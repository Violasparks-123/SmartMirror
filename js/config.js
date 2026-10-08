/* Smart Mirror — settings that are the same for everyone using this copy.
   Things you change from the mirror itself (name, city, timetable…) live in store.js. */
window.M = window.M || {};
M.config = {
  version: '1.0',
  mirrorName: 'Mirror',
  wakeWords: ['hey mirror', 'hi mirror', 'okay mirror', 'ok mirror'],
  defaultCity: { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  // The messenger that links the iPad, the ESP32 and the phone remote.
  // Public test broker for now; swap for a private HiveMQ Cloud address later.
  mqttUrl: 'wss://broker.hivemq.com:8884/mqtt',
  mqttScript: 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js',
  topicRoot: 'smartmirror',
  // Middle-man server for the real AI. Empty = AI not set up yet; built-in commands still work.
  aiEndpoint: '',
  // Optional: lets the mirror search YouTube by name. Needs a key from a parent's Google Cloud account.
  youtubeApiKey: '',
  // Songs hosted next to the page, e.g. ['music/lofi-1.mp3']. Songs added in Settings also work.
  songs: [],
  gestureModel: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
  gestureLib: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  gestureWasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  idleMinutes: 10 // after this long with nothing happening, the mirror goes quiet (clock only)
};
