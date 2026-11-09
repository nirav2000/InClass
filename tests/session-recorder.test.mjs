import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const recorder = read('inclass-session-recorder.js');
const html = read('index.html');
const sw = read('sw.js');
const menu = read('inclass-compact-tools.js');

test('session recorder is installed without adding another persistent header control', () => {
  assert.match(html, /src="inclass-session-recorder\.js"/);
  assert.match(html, /href="inclass-session-recorder\.css"/);
  assert.match(sw, /\.\/inclass-session-recorder\.js/);
  assert.match(sw, /\.\/inclass-session-recorder\.css/);
  assert.match(menu, /data-action|make\('.*Session recorder',\s*'record'\)/);
  assert.match(menu, /inclass:open-session-recorder/);
});

test('recordings are local and never silently uploaded to public feedback, Notes or Firebase', () => {
  assert.match(recorder, /indexedDB\.open\(DB_NAME/);
  assert.match(recorder, /'sessions'/);
  assert.match(recorder, /'videos'/);
  assert.doesNotMatch(recorder, /data-session-consent|parental approval/i);
  assert.match(recorder, /data-session-auto/);
  assert.match(recorder, /inclass:recorder:auto-v1/);
  assert.match(recorder, /function beginLesson\(/);
  assert.match(recorder, /function endLesson\(/);
  assert.match(read('welcome.js'), /InClassSessionRecorder\?\.beginLesson/);
  assert.match(read('welcome.js'), /InClassSessionRecorder\?\.endLesson/);
  assert.match(recorder, /getDisplayMedia/);
  assert.match(recorder, /getUserMedia/);
  assert.match(recorder, /new MediaRecorder/);
  assert.match(recorder, /screen \+ microphone recording saved|Screen \+ microphone recording saved/);
  assert.doesNotMatch(recorder, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|firebase\.|createCloudTransport/);
  assert.match(recorder, /deleteSession/);
  assert.match(recorder, /Import Apple screen recording/);
  assert.match(recorder, /No speech is transcribed or analysed automatically/);
});

test('loading the recorder makes no permission requests and capability detection is honest', () => {
  const listeners = [];
  let micCalls = 0, screenCalls = 0;
  const window = {
    isSecureContext: true,
    MediaRecorder: class {},
    indexedDB: {},
    crypto: {},
    addEventListener: (type, listener) => listeners.push(type),
  };
  const navigator = {mediaDevices: {
    getDisplayMedia: () => { screenCalls++; },
    getUserMedia: () => { micCalls++; },
  }};
  vm.runInNewContext(recorder, {window, navigator, document: {}}, {filename: 'inclass-session-recorder.js'});
  assert.equal(screenCalls, 0, 'Never start capturing on page load');
  assert.equal(micCalls, 0, 'Never turn on a microphone on page load');
  assert.equal(window.InClassSessionRecorder.capabilities().screenAndMic, true);
  assert.equal(window.InClassSessionRecorder.capabilities().localLibrary, true);
  assert.ok(listeners.includes('inclass:open-session-recorder'));
  window.isSecureContext = false;
  assert.equal(window.InClassSessionRecorder.capabilities().screenAndMic, false);
  window.isSecureContext = true;
  delete navigator.mediaDevices.getDisplayMedia;
  assert.equal(window.InClassSessionRecorder.capabilities().screenAndMic, false);
});

test('interaction metadata does not collect the contents of student answers', () => {
  assert.match(recorder, /never read typed answers/i);
  // The video-picker's file input is reset after import; that is not a learner answer.
  // Only the eventLabel function determines which interactions are logged.
  const eventLabel = recorder.slice(recorder.indexOf('function eventLabel('), recorder.indexOf('function trackEvents('));
  assert.doesNotMatch(eventLabel, /\.value\b|\.textContent\b|\.innerHTML\b|event\.key\b/);
  assert.match(recorder, /MAX_EVENTS/);
  assert.match(recorder, /Mark stuck/);
  assert.match(recorder, /Export observations/);
});

test('auto recording defaults off and a homework tap requests capture only once', () => {
  let screenCalls = 0;
  const values = new Map();
  const storage = {getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)};
  const window = {
    isSecureContext: true, MediaRecorder: class {}, indexedDB: {},
    crypto: {}, addEventListener() {}
  };
  const navigator = {mediaDevices: {
    getDisplayMedia: () => { screenCalls++; return new Promise(() => {}); },
    getUserMedia: () => { throw Error('Microphone should be requested only after screen sharing'); }
  }};
  vm.runInNewContext(recorder, {
    window, navigator, document: {getElementById: () => null}, localStorage: storage
  }, {filename: 'inclass-session-recorder.js'});
  assert.equal(window.InClassSessionRecorder.autoEnabled(), false);
  window.InClassSessionRecorder.beginLesson({subject: 'French', week: 'avoir'});
  assert.equal(screenCalls, 0, 'New devices do not start recording without choosing auto-record');
  window.InClassSessionRecorder.setAutoEnabled(true);
  window.InClassSessionRecorder.beginLesson({subject: 'French', week: 'avoir'});
  window.InClassSessionRecorder.beginLesson({subject: 'French', week: 'avoir'});
  assert.equal(screenCalls, 1, 'Two lesson events cannot open duplicate screen-sharing pickers');
  assert.equal(window.InClassSessionRecorder.capabilities().autoStart, true);
});

test('long-session recording uses bounded chunks and independent checkpoint parts instead of 20-minute memory buffers', () => {
  assert.match(recorder, /const SEGMENT_MS = 5 \* 60 \* 1000/);
  assert.match(recorder, /const CHUNK_MS = 5000/);
  assert.match(recorder, /const MAX_PENDING_CHUNKS = 12/);
  assert.doesNotMatch(recorder, /LIMIT_MS|20-minute recording limit was reached|chunks:\s*\[\]/);
  assert.match(recorder, /indexedDB\.open\(DB_NAME, 2\)/, 'Upgrade existing IndexedDB in-place');
  assert.match(recorder, /'segments'/);
  assert.match(recorder, /'chunks'/);
  assert.match(recorder, /state\.writeQueue/);
  assert.match(recorder, /tx\.objectStore\('chunks'\)\.put/, 'Persist each recorded blob');
  assert.match(recorder, /function startPart\(state\)/);
  assert.match(recorder, /function rotatePart\(state\)/);
  assert.match(recorder, /setTimeout\(\(\) => rotatePart\(state\), SEGMENT_MS\)/);
  assert.match(recorder, /storageFormat: 'chunks-v2'/);
  assert.match(recorder, /async function recoverInterrupted\(/);
  assert.match(recorder, /function deleteSession\(/);
  assert.match(recorder, /getSegmentVideo\(id, part\)/);
  assert.match(recorder, /document\.addEventListener\?\.\('visibilitychange'/);
});

test('storage display distinguishes origin quota from device space and estimates time with a safety margin', () => {
  assert.match(recorder, /navigator\.storage\.estimate\(\)/);
  assert.match(recorder, /data-session-storage-usage/);
  assert.match(recorder, /data-session-storage-time/);
  assert.match(recorder, /browser storage allowance, not the device/i);
  assert.match(recorder, /15e6 \/ 60000/);
  assert.match(recorder, /estimate\.remaining \* 0\.8 \/ bytesPerMs/);
  assert.match(recorder, /navigator\.storage\.persist\(\)/);
  assert.match(recorder, /low-storage/);
});
