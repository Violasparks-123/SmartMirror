/* Hand gestures with the front camera (Google MediaPipe, runs on the iPad itself).
   ✊ fist held for a second → start listening      ☝️ pointing up → home
   ✋ open hand swiped left/right → change screen   ✌️ peace sign → next song
   👍 thumbs up → "Thumbs up!" back */
(function () {
  var recognizer = null, video = null, stream = null, running = false, lastVideoTime = -1;
  var fistSince = 0, palmTrack = [], cooldownUntil = 0, loading = false;

  function cool(ms) { cooldownUntil = performance.now() + (ms || 1200); }

  M.startGestures = function () {
    if (running || loading) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { M.status('gestures', false, 'Camera not available here'); return; }
    loading = true;
    M.status('gestures', false, 'Starting camera…');
    import(M.config.gestureLib).then(function (vision) {
      return vision.FilesetResolver.forVisionTasks(M.config.gestureWasm).then(function (files) {
        return vision.GestureRecognizer.createFromOptions(files, { baseOptions: { modelAssetPath: M.config.gestureModel, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1 });
      });
    }).then(function (r) {
      recognizer = r;
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 }, audio: false });
    }).then(function (s) {
      stream = s;
      video = document.createElement('video');
      video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = s;
      video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
      document.body.appendChild(video);
      return video.play();
    }).then(function () {
      running = true; loading = false;
      M.status('gestures', true, 'Gestures on (camera)');
      loop();
    }).catch(function () {
      loading = false; running = false;
      M.status('gestures', false, 'Gestures unavailable here (camera or model blocked)');
    });
  };

  M.stopGestures = function () {
    running = false;
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
    if (video) { video.remove(); video = null; }
    M.status('gestures', false, 'Gestures off');
  };

  function loop() {
    if (!running) return;
    setTimeout(function () { requestAnimationFrame(loop); }, 80); // about 10 checks a second, gentle on an older iPad
    if (!video || video.currentTime === lastVideoTime) return;
    lastVideoTime = video.currentTime;
    var res;
    try { res = recognizer.recognizeForVideo(video, performance.now()); } catch (e) { return; }
    var now = performance.now();
    if (!res || !res.gestures || !res.gestures.length) { fistSince = 0; palmTrack = []; return; }
    var g = res.gestures[0][0], name = g.categoryName, score = g.score;
    var wrist = res.landmarks && res.landmarks[0] && res.landmarks[0][0];
    if (score < 0.6 || now < cooldownUntil) return;
    M.poke();

    if (name === 'Closed_Fist') {
      if (!fistSince) fistSince = now;
      if (now - fistSince > 900) { fistSince = 0; cool(2500); M.listen(); }
      return;
    }
    fistSince = 0;
    if (name === 'Open_Palm' && wrist) {
      palmTrack.push({ x: wrist.x, t: now });
      palmTrack = palmTrack.filter(function (p) { return now - p.t < 700; });
      if (palmTrack.length > 3) {
        var dx = palmTrack[palmTrack.length - 1].x - palmTrack[0].x;
        // The selfie camera sees you mirrored, so a hand moving to YOUR left increases x.
        if (dx > 0.22) { palmTrack = []; cool(); M.nextScreen(1); }
        else if (dx < -0.22) { palmTrack = []; cool(); M.nextScreen(-1); }
      }
      return;
    }
    palmTrack = [];
    if (name === 'Pointing_Up') { cool(); M.show('home'); }
    else if (name === 'Victory') { cool(2000); M.musicNext(); M.toast('Next song'); }
    else if (name === 'Thumb_Up') { cool(2500); M.lightsPulse(); M.toast('👍 Thumbs up!'); }
  }
})();
