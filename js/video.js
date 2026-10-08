/* Videos.
   - The Video shelf: numbered tiles. Spot 2 tap = next tile, hold = play it. Or say "play number 2".
   - Saved videos come from Settings or from Mirror Home (no typing links on the mirror itself).
   - "Search YouTube for cats" fills the shelf with results to pick from. That needs a free
     YouTube API key from a parent's Google account (typed into Settings → Videos). Safe search is always strict. */
(function () {
  // Starter videos (all checked to be real). Added once, so ones you remove stay removed.
  var starters = [
    { title: 'Lofi study music', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { title: 'Jazz lofi', url: 'https://www.youtube.com/watch?v=HuFYqnbVbzY' },
    { title: 'Synthwave beats', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
    { title: 'Sleepy lofi', url: 'https://www.youtube.com/watch?v=rUxyKA_-grg' },
    { title: 'Rain sounds', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
    { title: 'Study with me (pomodoro)', url: 'https://www.youtube.com/watch?v=n0CSlkPybTc' },
    { title: 'Nick DiGiovanni: YouTubers\' last meals', url: 'https://www.youtube.com/watch?v=tP_x_ctVz3Y' },
    { title: 'Draw with me (acrylic markers)', url: 'https://www.youtube.com/watch?v=yRSI_zZ-Q-Y' }
  ];
  if (!M.settings.videos) M.settings.videos = [];
  if (!M.settings.ytSongs) M.settings.ytSongs = [];   // the Songs shelf: YouTube songs
  var mode = 'videos';   // which shelf is showing: 'videos' or 'songs'
  var playingFrom = null; // the list the current video came from, so 'next' and auto-play work
  // Each starter is added once (remembered by its ID), so new starters appear in updates
  // but ones you've removed don't come back.
  var added = M.settings.videoStartersAdded || (M.settings.videoStarters ? starters.slice(0, 6).map(function (v) { return v.url.slice(-11); }) : []);
  starters.forEach(function (v) {
    var id = v.url.slice(-11); if (added.indexOf(id) >= 0) return;
    if (!M.settings.videos.some(function (x) { return x.url.indexOf(id) >= 0; })) M.settings.videos.push(v);
    added.push(id);
  });
  M.settings.videoStartersAdded = added; M.save();
  var localVideos = [];          // video files added this session
  var results = null, resultsFor = '';   // latest YouTube search results
  var sel = 0;                   // highlighted tile
  var current = null;            // what's playing {kind, title, url, frame|el}
  var paused = false;
  // The YouTube key is typed in Settings and saved only on this device
  function ytKey() { return M.settings.youtubeKey || M.config.youtubeApiKey || ''; }

  M.youtubeId = function (url) {
    var m = String(url).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url) ? url : null);
  };
  function thumb(v) { var id = M.youtubeId(v.url); return id ? 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg' : ''; }
  function saved() { return M.settings.videos.concat(localVideos); }
  function shelfList() { return results || (mode === 'songs' ? M.settings.ytSongs : saved()); }

  /* ---------- The shelf ---------- */
  M.renderShelf = function () {
    var list = shelfList(), box = M.$('shelf'); if (!box) return;
    if (sel >= list.length) sel = 0;
    M.$('shelfTitle').textContent = results ? 'Results for "' + resultsFor + '"' : (mode === 'songs' ? 'Your songs' : 'Your videos');
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = '<div class="sample-note">' + (mode === 'songs' ? 'No songs yet. In Mirror Home go to Videos, paste a YouTube link and tap Save as song.' : 'No videos yet. On your phone open Mirror Home, go to Videos, and tap Paste from YouTube.') + '</div>'; return; }
    var page = Math.floor(sel / 9), pages = Math.ceil(list.length / 9);
    if (pages > 1) M.$('shelfTitle').textContent += ' · page ' + (page + 1) + ' of ' + pages;
    list.slice(page * 9, page * 9 + 9).forEach(function (v, j) {
      var i = page * 9 + j;
      var t = document.createElement('div'); t.className = 'tile' + (i === sel ? ' sel' : '');
      var src = thumb(v);
      t.innerHTML = '<div class="noimg">' + (mode === 'songs' && !results ? '♪' : '▶') + '</div>' + (src ? '<img alt="" loading="lazy">' : '') + '<div class="no">' + (i + 1) + '</div><div class="tt"></div>';
      if (src) { var im = t.querySelector('img'); im.onerror = function () { im.remove(); }; im.src = src; }
      t.querySelector('.tt').textContent = v.title;
      t.addEventListener('click', function () { playIndex(i); });   // works when testing on a laptop
      box.appendChild(t);
    });
    M.$('shelfNote').textContent = results ? 'Say "save number 2" (or "save number 2 as a song"). "My videos" goes back.' : 'Spot 2: tap = next, hold = play. Or say "play number 2". ' + (mode === 'songs' ? '"My videos" switches shelf.' : '"My songs" switches shelf.');
  };
  M.showShelf = function (fromResults, which) {
    if (!fromResults) results = null;
    if (which && which !== mode) { mode = which; sel = 0; }
    M.renderShelf(); M.show('videos');
  };
  M.shelfMove = function (dir) {
    var n = shelfList().length; if (!n) return;
    sel = (sel + dir + n) % n; M.renderShelf();
  };
  function playIndex(i) {
    var v = shelfList()[i]; if (!v) return M.say('There\'s no number ' + (i + 1) + '.');
    sel = i; var list = shelfList(); M.playVideo(v.url, v.title); playingFrom = { list: list, i: i }; return true;
  }
  M.shelfPlay = function () { return playIndex(sel); };

  // Shares the shelf with Mirror Home so the phone can show thumbnails and play them
  M.shareVideos = function () {
    if (!M.publishRetained) return;
    function pack(v) { return { title: v.title, url: v.url }; }
    M.publishRetained('videos', {
      saved: M.settings.videos.map(pack), songs: M.settings.ytSongs.map(pack),
      results: (results || []).map(pack), query: resultsFor,
      search: !!ytKey()
    });
  };
  function saveVideo(v, asSong) {
    if (!M.youtubeId(v.url)) return M.say('I can only save YouTube links.');
    var list = asSong ? M.settings.ytSongs : M.settings.videos;
    if (!list.some(function (x) { return M.youtubeId(x.url) === M.youtubeId(v.url); })) list.push({ title: v.title, url: v.url });
    M.save(); M.shareVideos(); if (M.current === 'videos') M.renderShelf();
    return M.say('Saved ' + v.title + ' to your ' + (asSong ? 'songs' : 'videos') + '.');
  }
  M.saveVideo = saveVideo;
  M.removeSaved = function (url) {
    var id = M.youtubeId(url);
    M.settings.videos = M.settings.videos.filter(function (v) { return M.youtubeId(v.url) !== id; });
    M.settings.ytSongs = M.settings.ytSongs.filter(function (v) { return M.youtubeId(v.url) !== id; });
    M.save(); M.shareVideos(); if (M.current === 'videos') M.renderShelf();
  };
  // Plays the next one from the same shelf (used by "next" and when a song ends)
  M.playNextFromShelf = function (dir) {
    if (!playingFrom || !playingFrom.list.length) return false;
    var n = playingFrom.list.length, i = (playingFrom.i + (dir || 1) + n) % n, v = playingFrom.list[i];
    var list = playingFrom.list; M.playVideo(v.url, v.title); playingFrom = { list: list, i: i }; sel = i; return true;
  };

  /* ---------- Playing ---------- */
  M.playVideo = function (url, title) {
    var box = M.$('videoBox'); box.innerHTML = '';
    var id = M.youtubeId(url);
    M.show('video'); paused = false; playingFrom = null;
    M.$('videoTitle').textContent = title || 'Video';
    if (M.isPlaying && M.isPlaying()) M.musicPause();
    if (id) {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&enablejsapi=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.title = title || 'YouTube video';
      f.setAttribute('allowfullscreen', '');
      box.appendChild(f);
      // Ask YouTube to tell us when the video ends, so songs can play one after another
      f.addEventListener('load', function () { try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'); } catch (e) {} });
      current = { kind: 'yt', title: title, url: url, frame: f };
    } else {
      var v = document.createElement('video');
      v.src = url; v.controls = true; v.playsInline = true; v.autoplay = true;
      v.addEventListener('ended', function () { if (playingFrom) M.playNextFromShelf(1); });
      box.appendChild(v);
      current = { kind: 'file', title: title, url: url, el: v };
    }
  };
  window.addEventListener('message', function (e) {
    if (!current || current.kind !== 'yt' || !/youtube/.test(e.origin)) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (d && d.info && d.info.playerState === 0 && playingFrom) M.playNextFromShelf(1);   // 0 = ended
  });
  function ytCmd(func) { if (current && current.frame && current.frame.contentWindow) current.frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*'); }
  M.pauseVideo = function () { if (!current) return false; if (current.kind === 'yt') ytCmd('pauseVideo'); else current.el.pause(); paused = true; return true; };
  M.resumeVideo = function () { if (!current) return false; if (current.kind === 'yt') ytCmd('playVideo'); else current.el.play(); paused = false; return true; };
  M.toggleVideo = function () { return paused ? M.resumeVideo() : M.pauseVideo(); };
  M.closeVideo = function () { M.$('videoBox').innerHTML = ''; current = null; M.show('home'); };
  M.backToShelf = function () { M.$('videoBox').innerHTML = ''; current = null; M.renderShelf(); M.show('videos'); };

  M.addLocalVideos = function (files) {
    Array.prototype.forEach.call(files, function (f) { localVideos.push({ title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' '), url: URL.createObjectURL(f) }); });
  };
  function findVideo(q) {
    q = q.toLowerCase().trim();
    var list = saved();
    return list.filter(function (v) { return v.title.toLowerCase() === q; })[0] ||
      list.filter(function (v) { return v.title.toLowerCase().indexOf(q) >= 0 || q.indexOf(v.title.toLowerCase()) >= 0; })[0] ||
      list.filter(function (v) { return q.split(' ').some(function (w) { return w.length > 3 && v.title.toLowerCase().indexOf(w) >= 0; }); })[0] || null;
  }
  function unescape(s) { return s.replace(/&#39;/g, '\'').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }
  function searchYouTube(q, max) {
    var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=' + (max || 6) + '&safeSearch=strict&videoEmbeddable=true&q=' + encodeURIComponent(q) + '&key=' + ytKey();
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      return (j.items || []).map(function (it) { return { title: unescape(it.snippet.title), url: 'https://youtu.be/' + it.id.videoId }; });
    });
  }
  M.searchVideos = function (q) {
    if (!ytKey()) return M.say('Searching YouTube needs a YouTube key from a parent first. For now, add videos from Mirror Home.');
    M.$('shelfTitle').textContent = 'Searching for "' + q + '"…'; M.$('shelf').innerHTML = ''; M.show('videos');
    searchYouTube(q, 6).then(function (list) {
      if (!list.length) return M.say('I couldn\'t find videos for ' + q + '.');
      results = list; resultsFor = q; sel = 0; M.renderShelf(); M.shareVideos();
      M.say('Here are ' + list.length + ' videos. Say "play number 1", or use Spot 2.', { silent: true });
    }).catch(function () { M.say('YouTube search isn\'t working right now.'); });
    return true;
  };
  function numFrom(s) { var n = M.num(s.replace(/^(number|no\.?) /, '').replace(/^(the )?(first|second|third|fourth|fifth|sixth|seventh|eighth)( one)?$/, function (a, b, w) { return { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8 }[w]; })); return n; }
  function onShelf() { return M.current === 'videos'; }

  /* ---------- Voice commands ---------- */
  M.addCommand(['^(?:show|open)?\\s*(?:my )?(?:videos|video menu|video shelf|youtube)$', '^(?:show|open|list) (?:me )?(?:my |the |saved )*videos$', '^(?:what|which) videos (?:do you have|can you play|have i got)$', '^(?:what are|list) my (?:saved )?videos$'], function () {
    M.showShelf(false, 'videos'); var l = saved();
    return M.say(l.length ? 'You have ' + l.length + ' video' + (l.length === 1 ? '' : 's') + '. Say "play number 1", or tap Spot 2 to move and hold to play.' : 'No videos yet. Add some from Mirror Home.', { silent: true });
  });
  M.addCommand(['^(?:show|open|play)?\\s*(?:my )?(?:songs|song shelf|youtube songs|song list|my song list)$', '^(?:show|open|list) (?:me )?(?:my |the |saved )*songs$', '^what songs (?:do you have|can you play|have i got)$'], function (m, t) {
    if (!M.settings.ytSongs.length && M.playlist && M.playlist.length && /^play/.test(t)) return false;   // MP3s only: use the music player
    M.showShelf(false, 'songs'); var l = M.settings.ytSongs;
    return M.say(l.length ? 'You have ' + l.length + ' song' + (l.length === 1 ? '' : 's') + '. Say "play number 1", or use Spot 2.' : 'No songs yet. Add some from Mirror Home.', { silent: true });
  });
  M.addCommand(['^play (?:the )?song (?:called |named )?(.+)$', '^play (.+?) (?:song|by .+)$'], function (m) {
    var q = m[1].toLowerCase().trim();
    if (/^(a|an|some|the|my|any|another|next|previous|last|that|this|different|new|random|one|the next|the last|the previous|a different|a random)$/.test(q)) return false;
    // Your MP3s first, then YouTube songs, then a YouTube search if there's a key
    var mp = (M.playlist || []).map(function (s, i) { return [s, i]; }).filter(function (x) { return x[0].title.toLowerCase().indexOf(q) >= 0; })[0];
    if (mp && M.playTrack) { M.playTrack(mp[1]); M.show('music'); return true; }
    var list = M.settings.ytSongs, i = -1;
    list.forEach(function (s, j) { if (i < 0 && (s.title.toLowerCase().indexOf(q) >= 0 || q.indexOf(s.title.toLowerCase()) >= 0)) i = j; });
    if (i < 0) list.forEach(function (s, j) { if (i < 0 && q.split(' ').some(function (w) { return w.length > 3 && s.title.toLowerCase().indexOf(w) >= 0; })) i = j; });
    if (i >= 0) { mode = 'songs'; results = null; return playIndex(i); }
    if (ytKey()) return M.searchVideos(q + ' song');
    return M.say('I don\'t have a song called ' + m[1] + ' yet. Add it from Mirror Home.');
  });
  M.addCommand(['^(?:next|skip)(?: song| video| one| track| it)?$', '^play (?:the )?next(?: one| song| video)?$'], function () {
    if (M.current === 'video' && playingFrom) return M.playNextFromShelf(1);
    return false;
  });
  M.addCommand(['^(?:previous|last) (?:song|video|one)$'], function () {
    if (M.current === 'video' && playingFrom) return M.playNextFromShelf(-1);
    return false;
  });
  M.addCommand(['^save (?:video )?(?:number )?(\\d+|one|two|three|four|five|six|seven|eight|nine) as (?:a )?song$'], function (m) {
    var v = shelfList()[numFrom(m[1]) - 1]; return v ? saveVideo(v, true) : M.say('There\'s no video with that number.');
  });
  M.addCommand(['^(?:save|keep|add) (?:this|the|that) (?:song|one as a song)(?: to my songs)?$', '^save (?:this|it) as (?:a )?song$'], function () {
    if (current) return saveVideo(current, true); if (M.current === 'videos' && shelfList()[sel]) return saveVideo(shelfList()[sel], true);
    return M.say('Play a video first, or pick one on the video shelf, then say "save this as a song".');
  });
  M.addCommand(['^(?:search|look up|find)(?: on)?(?: youtube)?(?: for)? (.+?) (?:on youtube|videos?)$', '^(?:search|look up) youtube (?:for )?(.+)$', '^(?:search|find) (?:for )?videos? (?:of|about|for|on) (.+)$', '^youtube search (.+)$'], function (m) {
    return M.searchVideos(m[1].replace(/^(the|a|some) /, '').trim());
  });
  M.addCommand(['^(?:play|watch|open|pick|choose) (?:video )?(?:number |no\\.? )?(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)$', '^(?:play |watch )?(?:the )?(first|second|third|fourth|fifth|sixth|seventh|eighth) (?:one|video)$', '^number (\\d+|one|two|three|four|five|six|seven|eight)$'], function (m) {
    var n = numFrom(m[1]); if (!(n >= 1)) return false;
    if (!onShelf() && !results && M.current !== 'video') M.renderShelf();
    return playIndex(n - 1);
  });
  M.addCommand(['^save (?:video )?(?:number )?(\\d+|one|two|three|four|five|six|seven|eight)$', '^save (?:the )?(first|second|third|fourth|fifth|sixth) (?:one|video)$'], function (m) {
    var v = shelfList()[numFrom(m[1]) - 1]; return v ? saveVideo(v) : M.say('There\'s no video with that number.');
  });
  M.addCommand(['^(?:save|keep|add) (?:this|the|that) (?:video|one)(?: to my videos)?$'], function () {
    if (current) return saveVideo(current); if (onShelf() && shelfList()[sel]) return saveVideo(shelfList()[sel]); return false;
  });
  M.addCommand(['^(?:remove|delete) (?:video )?(?:number )?(\\d+|one|two|three|four|five|six)(?: from my videos)?$'], function (m) {
    if (results) return M.say('Say "my videos" first, then remove by number.');
    var arr = mode === 'songs' ? M.settings.ytSongs : M.settings.videos;
    var i = numFrom(m[1]) - 1, v = arr[i]; if (!v) return M.say('There\'s no saved one with that number.');
    arr.splice(i, 1); M.save(); M.shareVideos(); M.renderShelf(); return M.say('Removed ' + v.title + '.');
  });
  M.addCommand(['^(?:next|down|right)(?: one| video)?$'], function () { if (!onShelf()) return false; M.shelfMove(1); return true; });
  M.addCommand(['^(?:previous|back|up|left|last)(?: one| video)?$'], function () {
    if (onShelf()) { M.shelfMove(-1); return true; }
    if (M.current === 'video') { M.backToShelf(); return true; } return false;
  });
  M.addCommand(['^(?:play|open)(?: this| that| it)?$', '^(?:this one|that one|select|ok play)$'], function () { if (!onShelf()) return false; return M.shelfPlay(); });
  M.addCommand(['^(?:play|watch|put on|show me|open|start) (?:the |a |my )?(?:video|youtube video|clip)(?: of| called| named)? (.+)$', '^(?:play|watch|put on) (.+?) (?:video|on youtube)$', '^(?:watch|youtube) (.+)$'], function (m) {
    var q = m[1].replace(/^(the|a|my) /, '').trim();
    if (/^(music|song|songs|a song)$/.test(q)) return false;
    var v = findVideo(q);
    if (v) { M.playVideo(v.url, v.title); return M.say('Playing ' + v.title + '.', { silent: true }); }
    if (ytKey()) return M.searchVideos(q);
    return M.say('I don\'t have a video called ' + q + ' yet. Add it from Mirror Home.');
  });
  M.addCommand(['^(pause|stop) (the )?video$', '^pause it$'], function () { return M.pauseVideo() ? true : false; });
  M.addCommand(['^(play|resume|continue|unpause) (the )?video$'], function () {
    if (M.resumeVideo()) return true;
    M.showShelf(); return M.say('Pick a video. Say "play number 1".', { silent: true });
  });
  M.addCommand(['(close|exit|quit|turn off|end)( the)? video'], function () { M.closeVideo(); return true; });
  M.addCommand(['^(?:back to|go back to) (?:the |my )?videos$'], function () { M.backToShelf(); return true; });
})();
