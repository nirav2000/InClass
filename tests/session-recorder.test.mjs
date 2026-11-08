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
  assert.match(recorder, /data-session-consent/);
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
