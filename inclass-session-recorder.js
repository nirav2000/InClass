/* InClass lesson-session recorder.
 * Explicit, visible recording only. Recordings remain in this browser's
 * IndexedDB until a person deliberately downloads or deletes them.
 * Nothing is sent to Notes, Firebase, analytics or public GitHub issues.
 */
(function () {
  'use strict';
  const DB_NAME = 'inclass-session-recordings-v1';
  const LIMIT_MS = 20 * 60 * 1000;
  const MAX_IMPORT_BYTES = 750 * 1024 * 1024;
  const MAX_EVENTS = 4000;
  let dbPromise = null;
  let dialog = null;
  let notice = null;
  let current = null;
  let selected = null;
  let playbackUrl = null;
  let transientVideo = null;

  const by = selector => dialog && dialog.querySelector(selector);
  const capable = () => Boolean(window.isSecureContext && window.MediaRecorder &&
    navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia &&
    navigator.mediaDevices.getUserMedia);
  const clock = milliseconds => {
    const s = Math.max(0, Math.floor(milliseconds / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
      String(s % 60).padStart(2, '0');
  };
  const uniqueId = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  const message = text => { const el = by('[data-session-status]'); if (el) el.textContent = text; };
  const lessonInfo = () => ({
    subject: (document.getElementById('subjectSelect')?.value || 'home').slice(0, 80),
    week: (document.getElementById('weekSelect')?.value || 'general').slice(0, 120)
  });

  function database() {
    if (!window.indexedDB) return Promise.reject(Error('Local video storage is unavailable.'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
      };
      request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
      request.onerror = () => reject(request.error || Error('Could not open recording library.'));
      request.onblocked = () => reject(Error('Close other InClass tabs and try again.'));
    }).catch(error => { dbPromise = null; throw error; });
    return dbPromise;
  }
  async function saveSession(meta, video) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions', 'videos'], 'readwrite');
      tx.objectStore('sessions').put(meta);
      tx.objectStore('videos').put(video, meta.id);
      tx.oncomplete = () => resolve(meta);
      tx.onerror = () => reject(tx.error || Error('Storage failed.'));
      tx.onabort = () => reject(tx.error || Error('Insufficient storage space.'));
    });
  }
  async function updateSession(meta) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put(meta);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error('Could not save review.'));
    });
  }
  async function allSessions() {
    const db = await database();
    return new Promise((resolve, reject) => {
      const request = db.transaction('sessions').objectStore('sessions').getAll();
      request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      request.onerror = () => reject(request.error);
    });
  }
  async function getVideo(id) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const request = db.transaction('videos').objectStore('videos').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async function deleteSession(id) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions', 'videos'], 'readwrite');
      tx.objectStore('sessions').delete(id);
      tx.objectStore('videos').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error('Delete failed.'));
    });
  }

  function revokePreview() {
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    playbackUrl = null;
    transientVideo = null;
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function fileExtension(type) {
    return /quicktime/i.test(type || '') ? 'mov' : /mp4/i.test(type || '') ? 'mp4' : 'webm';
  }
  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'inclassRecorderDialog';
    dialog.setAttribute('aria-label', 'Session recording and parent review');
    dialog.innerHTML = [
      '<div class="inclassRecorderHead"><div><p class="inclassRecorderEyebrow">INCLASS · LEARNING OBSERVATION</p>',
      '<h2>Session recorder</h2></div><button type="button" data-session-close aria-label="Close session recorder">✕</button></div>',
      '<p class="inclassRecorderIntro">Watch a lesson back with the child’s explanation, pauses and on-screen choices.</p>',
      '<p class="inclassRecorderPrivacy"><strong>Private by default.</strong> Videos contain screen content and voices. ',
      'They remain in this device’s browser storage, not in Firebase, Notes, analytics or public GitHub issues. ',
      'Anyone using this browser profile may be able to view them. Export or delete them yourself.</p>',
      '<label class="inclassRecorderConsent"><input type="checkbox" data-session-consent> ',
      'I am the parent/carer and approve recording this learning session with the child’s knowledge.</label>',
      '<div class="inclassRecorderActions"><button type="button" class="inclassRecorderPrimary" data-session-start>● Record screen + microphone</button>',
      '<button type="button" data-session-import>Import Apple screen recording</button>',
      '<input type="file" accept="video/*,.mov,.mp4,.webm" data-session-file hidden></div>',
      '<p data-session-capability class="inclassRecorderHint"></p>',
      '<details class="inclassRecorderGuide"><summary>Recording on an iPad or iPhone</summary>',
      '<ol><li>Swipe down from the top right to open Control Centre.</li>',
      '<li>Touch and hold <strong>Screen Recording</strong>, switch <strong>Microphone On</strong>, then tap Start Recording.</li>',
      '<li>Return to InClass and work through the lesson. Stop via the red recording indicator.</li>',
      '<li>Return here and use <strong>Import Apple screen recording</strong> to select it from Photos or Files.</li></ol>',
      '<p>On iOS/iPadOS 26, websites cannot start full-screen capture. Safari 27 may offer in-app capture; actual recording support is checked on this device.</p></details>',
      '<p data-session-status class="inclassRecorderStatus" role="status" aria-live="polite"></p>',
      '<div class="inclassRecorderSectionHead"><h3>Recordings on this device</h3><button type="button" data-session-refresh>Refresh</button></div>',
      '<div data-session-list class="inclassRecorderList"></div>',
      '<section data-session-review class="inclassRecorderReview" hidden>',
      '<h3 data-session-review-title>Parent review</h3>',
      '<video controls playsinline preload="metadata" data-session-video aria-label="Recorded lesson video"></video>',
      '<div class="inclassRecorderActions"><button type="button" data-session-download>Download video</button>',
      '<button type="button" data-session-export>Export observations (.json)</button>',
      '<button type="button" data-session-delete class="inclassRecorderDanger">Delete recording</button></div>',
      '<p class="inclassRecorderHint">Pause the video at a useful moment, then add an observation. ',
      'No speech is transcribed or analysed automatically.</p>',
      '<div class="inclassRecorderObservations"><label>Observation type ',
      '<select data-session-note-type><option value="confusion">Confusing concept</option>',
      '<option value="hesitation">Hesitation</option><option value="help">Needed help</option>',
      '<option value="independent">Independent understanding</option><option value="interface">App problem</option></select></label>',
      '<label>Optional parent note (stored locally)<textarea maxlength="400" rows="2" data-session-note-text ',
      'placeholder="What happened and what could teach it better?"></textarea></label>',
      '<button type="button" data-session-note>Add observation at current video time</button></div>',
      '<div data-session-events class="inclassRecorderTimeline"></div></section>'
    ].join('');
    dialog.querySelector('[data-session-close]').onclick = () => dialog.close();
    dialog.querySelector('[data-session-start]').onclick = () => { void startCapture(); };
    dialog.querySelector('[data-session-import]').onclick = () => {
      if (!approved()) return;
      by('[data-session-file]').click();
    };
    dialog.querySelector('[data-session-file]').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) await importVideo(file);
    });
    dialog.querySelector('[data-session-refresh]').onclick = () => { void renderLibrary(); };
    dialog.querySelector('[data-session-note]').onclick = () => { void addObservation(); };
    dialog.querySelector('[data-session-download]').onclick = () => { void exportVideo(); };
    dialog.querySelector('[data-session-export]').onclick = exportReview;
    dialog.querySelector('[data-session-delete]').onclick = () => { void removeSelected(); };
    dialog.addEventListener('close', revokePreview);
    document.body.append(dialog);
    return dialog;
  }
  function approved() {
    if (by('[data-session-consent]')?.checked) return true;
    message('Please confirm parental approval before starting or importing a recording.');
    by('[data-session-consent]')?.focus();
    return false;
  }
  function openDialog() {
    const el = ensureDialog();
    if (!el.open) {
      by('[data-session-consent]').checked = false;
      el.showModal();
    }
    const canRecord = capable();
    const button = by('[data-session-start]');
    button.disabled = !canRecord || Boolean(current);
    by('[data-session-capability]').textContent = canRecord
      ? 'This device offers browser screen capture. Choose the InClass tab or screen when prompted; allow microphone access separately.'
      : 'This browser does not expose screen + microphone capture here. Use the built-in Apple screen recorder above, then import its video.';
    void renderLibrary();
  }
  async function renderLibrary() {
    const list = by('[data-session-list]');
    if (!list) return;
    list.replaceChildren();
    try {
      const entries = await allSessions();
      if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'inclassRecorderHint';
        empty.textContent = 'No recordings saved here yet. Import a recording or start a new one.';
        list.append(empty);
        return;
      }
      entries.forEach(meta => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'inclassRecorderItem';
        item.textContent = new Date(meta.createdAt).toLocaleString('en-GB') + ' · ' +
          (meta.subject || 'Lesson') + ' · ' + clock(meta.durationMs) +
          ' · ' + (meta.source === 'import' ? 'Imported video' : 'Screen + microphone');
        item.addEventListener('click', () => { void showSession(meta); });
        list.append(item);
      });
    } catch (error) {
      list.textContent = 'Recordings could not be opened: ' + (error?.message || error);
    }
  }
  function renderTimeline() {
    const area = by('[data-session-events]');
    area.replaceChildren();
    if (!selected) return;
    const events = (selected.events || []).map(e => ({...e, kind: 'event'}));
    const notes = (selected.markers || []).map(e => ({...e, kind: 'note'}));
    const combined = notes.concat(events).sort((a, b) => a.at - b.at);
    const heading = document.createElement('h4');
    heading.textContent = 'Observation & interaction timeline';
    area.append(heading);
    if (!combined.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No markers yet. Add a note while watching the recording.';
      area.append(empty);
      return;
    }
    combined.slice(0, 250).forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = entry.kind === 'note' ? 'inclassRecorderMarker' : 'inclassRecorderEvent';
      button.textContent = clock(entry.at) + '  ·  ' +
        (entry.kind === 'note' ? entry.type + (entry.note ? ': ' + entry.note : '') : entry.label);
      button.onclick = () => {
        const player = by('[data-session-video]');
        if (player) { player.currentTime = entry.at / 1000; player.focus(); }
      };
      area.append(button);
    });
    if (combined.length > 250) {
      const more = document.createElement('p');
      more.textContent = 'First 250 timeline entries shown; the complete metadata can be exported.';
      area.append(more);
    }
  }
  async function showSession(meta, unsavedBlob) {
    selected = meta;
    const section = by('[data-session-review]');
    section.hidden = false;
    by('[data-session-review-title]').textContent = 'Review · ' + new Date(meta.createdAt).toLocaleString('en-GB');
    revokePreview();
    let blob;
    try { blob = unsavedBlob || await getVideo(meta.id); }
    catch (error) { message('Could not open video: ' + (error?.message || error)); return; }
    if (!blob || selected !== meta) { message('Video is missing from this device.'); return; }
    transientVideo = unsavedBlob || null;
    playbackUrl = URL.createObjectURL(blob);
    const player = by('[data-session-video]');
    player.src = playbackUrl;
    player.onloadedmetadata = () => {
      if (selected !== meta || meta.durationMs || !Number.isFinite(player.duration)) return;
      meta.durationMs = Math.max(0, Math.round(player.duration * 1000));
      if (!unsavedBlob) void updateSession(meta).then(renderLibrary).catch(() => {});
    };
    player.load();
    renderTimeline();
    section.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
  async function addObservation() {
    if (!selected) return;
    const video = by('[data-session-video]');
    selected.markers = selected.markers || [];
    selected.markers.push({
      at: Math.max(0, Math.floor((video?.currentTime || 0) * 1000)),
      type: by('[data-session-note-type]').value,
      note: by('[data-session-note-text]').value.trim().slice(0, 400)
    });
    try {
      if (!transientVideo) await updateSession(selected);
      by('[data-session-note-text]').value = '';
      message(transientVideo ? 'Added for this preview only. Storage was unavailable.' : 'Observation saved locally.');
      renderTimeline();
    } catch (error) {
      message('Observation could not be saved: ' + (error?.message || error));
    }
  }
  async function exportVideo() {
    if (!selected) return;
    try {
      const video = transientVideo || await getVideo(selected.id);
      if (!video) throw Error('No video is available.');
      download(video, 'inclass-session-' + selected.id + '.' + fileExtension(video.type));
    } catch (error) { message('Download failed: ' + (error?.message || error)); }
  }
  function exportReview() {
    if (!selected) return;
    const safe = {
      app: 'InClass', id: selected.id, createdAt: selected.createdAt,
      subject: selected.subject, week: selected.week, source: selected.source,
      durationMs: selected.durationMs, events: selected.events || [],
      markers: selected.markers || [],
      recordingNotIncluded: 'Attach the separately downloaded video if you choose to share it.'
    };
    download(new Blob([JSON.stringify(safe, null, 2)], {type: 'application/json'}),
      'inclass-observations-' + selected.id + '.json');
  }
  async function removeSelected() {
    if (!selected || transientVideo) { message('Unsaved preview: there is no stored recording to delete.'); return; }
    if (!window.confirm('Permanently delete this local recording, its event log and parent observations?')) return;
    try {
      await deleteSession(selected.id);
      selected = null;
      revokePreview();
      by('[data-session-video]').removeAttribute('src');
      by('[data-session-video]').load();
      by('[data-session-review]').hidden = true;
      message('Recording permanently deleted from this browser.');
      await renderLibrary();
    } catch (error) { message('Could not delete recording: ' + (error?.message || error)); }
  }
  async function importVideo(file) {
    if (!approved()) return;
    if (!file.type.startsWith('video/') && !/\.(mov|mp4|webm)$/i.test(file.name)) {
      message('Select a video recording, not an audio or document file.');
      return;
    }
    if (!file.size || file.size > MAX_IMPORT_BYTES) {
      message('This video is empty or over 750 MB. Trim it in Photos, then try again.');
      return;
    }
    const meta = {
      id: uniqueId(), createdAt: new Date().toISOString(), ...lessonInfo(),
      source: 'import', durationMs: 0, events: [], markers: []
    };
    try {
      await saveSession(meta, file);
      message('Apple screen recording saved locally for review. It was not uploaded.');
      await renderLibrary();
      await showSession(meta);
    } catch (error) {
      message('The browser could not store this large video (' + (error?.message || error) +
        '). You can review and download this temporary preview; the original remains in Photos/Files.');
      await showSession(meta, file);
    }
  }

  function eventLabel(event) {
    const element = event.target?.closest?.('button, a, select, input, textarea, [role="button"]');
    if (!element || element.closest('.inclassRecorderDialog, .inclassRecordingBadge')) return null;
    const tag = element.tagName.toLowerCase();
    const id = /^[a-z0-9_-]{1,48}$/i.test(element.id || '') ? '#' + element.id : '';
    // Deliberately never read typed answers, element text, selected options or key presses.
    return tag + id;
  }
  function trackEvents(state) {
    const click = event => {
      if (!current || current !== state || state.events.length >= MAX_EVENTS) return;
      const label = eventLabel(event);
      if (label) state.events.push({at: Date.now() - state.started, label});
    };
    const step = () => {
      if (current === state && state.events.length < MAX_EVENTS)
        state.events.push({at: Date.now() - state.started, label: 'Lesson step changed'});
    };
    document.addEventListener('click', click, true);
    window.addEventListener('inclass:lessonchange', step);
    state.untrack = () => {
      document.removeEventListener('click', click, true);
      window.removeEventListener('inclass:lessonchange', step);
    };
  }
  function showNotice(state) {
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'inclassRecordingBadge';
      notice.setAttribute('role', 'region');
      notice.setAttribute('aria-label', 'Visible session recording controls');
      notice.innerHTML = '<span data-session-elapsed aria-live="off">● 00:00</span>' +
        '<button type="button" data-session-stuck>Mark stuck</button>' +
        '<button type="button" data-session-stop>■ Stop & save</button>';
      notice.querySelector('[data-session-stop]').onclick = () => stopCapture('manual');
      notice.querySelector('[data-session-stuck]').onclick = () => {
        if (current) {
          current.markers.push({at: Date.now() - current.started, type: 'help',
            note: 'Learner or parent marked a difficult moment'});
        }
      };
      document.body.append(notice);
    }
    notice.hidden = false;
    const update = () => {
      if (current !== state) return;
      notice.querySelector('[data-session-elapsed]').textContent =
        '● ' + clock(Date.now() - state.started);
    };
    update();
    state.timer = setInterval(update, 1000);
    state.limit = setTimeout(() => stopCapture('limit'), LIMIT_MS);
  }
  function hideNotice(state) {
    clearInterval(state?.timer);
    clearTimeout(state?.limit);
    if (notice) notice.hidden = true;
  }
  function release(state) {
    state?.untrack?.();
    hideNotice(state);
    [state?.display, state?.mic, state?.combined].forEach(stream =>
      stream?.getTracks?.().forEach(track => { try { track.stop(); } catch {} }));
    if (state?.mixer) void state.mixer.close().catch(() => {});
  }
  function pickMime() {
    const supported = window.MediaRecorder.isTypeSupported?.bind(window.MediaRecorder);
    return ['video/mp4;codecs=h264,aac', 'video/mp4', 'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus', 'video/webm'].find(type => supported && supported(type));
  }
  async function startCapture() {
    if (current || !approved()) return;
    if (!capable()) { message('Browser screen capture is unavailable. Use Apple Screen Recording and import.'); return; }
    const button = by('[data-session-start]');
    button.disabled = true;
    message('Choose the InClass screen/tab and grant microphone access.');
    let display = null, mic = null, mixer = null, combined = null;
    try {
      // This call must begin directly from a click for the browser permission picker.
      display = await navigator.mediaDevices.getDisplayMedia({video: {frameRate: 12}, audio: true});
      if (!display.getVideoTracks().length) throw Error('No screen track was selected.');
      mic = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
      const audioTracks = mic.getAudioTracks();
      if (!audioTracks.length) throw Error('Microphone audio was not available.');
      let audioOutput = audioTracks[0];
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio) {
        try {
          mixer = new Audio();
          const dest = mixer.createMediaStreamDestination();
          [mic, display].forEach(stream => {
            if (stream.getAudioTracks().length)
              mixer.createMediaStreamSource(new MediaStream(stream.getAudioTracks())).connect(dest);
          });
          audioOutput = dest.stream.getAudioTracks()[0] || audioOutput;
          if (mixer.state === 'suspended') void mixer.resume().catch(() => {});
        } catch (error) {
          console.warn('System audio mix unavailable; recording microphone only.', error);
          if (mixer) { void mixer.close().catch(() => {}); mixer = null; }
        }
      }
      combined = new MediaStream([...display.getVideoTracks(), audioOutput]);
      const mime = pickMime();
      const recorder = new MediaRecorder(combined, mime ? {mimeType: mime} : undefined);
      const state = {
        display, mic, mixer, combined, recorder, chunks: [], started: Date.now(),
        info: lessonInfo(), events: [], markers: [], stopping: false, captureError: null
      };
      recorder.ondataavailable = event => { if (event.data?.size) state.chunks.push(event.data); };
      recorder.onerror = event => {
        state.captureError = event.error?.message || 'Media recording error';
        stopCapture('error');
      };
      recorder.onstop = () => { void finishCapture(state); };
      current = state;
      recorder.start(1500);
      display.getVideoTracks()[0].addEventListener('ended', () => stopCapture('screen-ended'), {once: true});
      trackEvents(state);
      showNotice(state);
      dialog.close();
    } catch (error) {
      if (current && current.display === display) { release(current); current = null; }
      [display, mic, combined].forEach(stream => stream?.getTracks?.().forEach(track => track.stop()));
      if (mixer) void mixer.close().catch(() => {});
      message('Recording did not start: ' + (error?.message || error) +
        '. You can still use Apple Screen Recording and import the result.');
    } finally {
      button.disabled = !capable() || Boolean(current);
    }
  }
  function stopCapture(reason) {
    const state = current;
    if (!state || state.stopping) return;
    state.stopping = true;
    state.stopReason = reason;
    hideNotice(state);
    if (state.recorder.state !== 'inactive') {
      try { state.recorder.stop(); } catch (error) {
        state.captureError = error.message;
        void finishCapture(state);
      }
    } else void finishCapture(state);
  }
  async function finishCapture(state) {
    if (current !== state) return;
    current = null;
    release(state);
    const type = state.recorder.mimeType || 'video/webm';
    const video = new Blob(state.chunks, {type});
    state.chunks = [];
    openDialog();
    if (!video.size) {
      message('No video data was recorded. ' + (state.captureError || 'Please retry or use Apple Screen Recording.'));
      return;
    }
    const meta = {
      id: uniqueId(), createdAt: new Date(state.started).toISOString(),
      subject: state.info.subject, week: state.info.week, source: 'screen',
      durationMs: Date.now() - state.started,
      events: state.events, markers: state.markers
    };
    try {
      await saveSession(meta, video);
      message('Screen + microphone recording saved on this device only.' +
        (state.stopReason === 'limit' ? ' The 20-minute recording limit was reached.' : ''));
      await renderLibrary();
      await showSession(meta);
    } catch (error) {
      message('Recording finished, but local storage failed (' + (error?.message || error) +
        '). Download this temporary video now to avoid losing it.');
      await showSession(meta, video);
    }
  }
  window.addEventListener('beforeunload', event => {
    if (current) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('pagehide', () => { if (current) stopCapture('pagehide'); });
  window.addEventListener('inclass:open-session-recorder', openDialog);
  window.InClassSessionRecorder = {open: openDialog, capabilities: () => ({screenAndMic: capable(), localLibrary: Boolean(window.indexedDB)})};
})();
