/* Live weather from Open-Meteo (free, no account). Falls back to clearly-marked sample weather. */
(function () {
  M.weather = null;          // latest data
  M.weatherIsSample = false;

  function sample() {
    var now = new Date(), hours = [];
    for (var i = 0; i < 24; i++) {
      var t = new Date(now.getTime() + i * 3600e3);
      hours.push({ time: t, temp: Math.round(27 + 4 * Math.sin((t.getHours() - 9) / 24 * 2 * Math.PI)), code: t.getHours() >= 15 && t.getHours() <= 17 ? 61 : 2, rain: t.getHours() >= 15 && t.getHours() <= 17 ? 60 : 10 });
    }
    return { temp: 27, feels: 29, code: 2, isDay: 1, humidity: 62, wind: 9, hours: hours,
      today: { max: 31, min: 22, rain: 40, code: 61, sunrise: '06:05', sunset: '17:58' },
      tomorrow: { max: 30, min: 21, rain: 20, code: 2 } };
  }
  function hhmm(iso) { return iso ? iso.slice(11, 16) : ''; }

  M.loadWeather = function () {
    var c = M.settings.city;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m' +
      '&hourly=temperature_2m,weather_code,precipitation_probability' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
      '&timezone=auto&forecast_days=2';
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('weather ' + r.status); return r.json(); }).then(function (j) {
      var nowH = new Date(); nowH.setMinutes(0, 0, 0);
      var hours = [];
      j.hourly.time.forEach(function (t, i) {
        var d = new Date(t);
        if (d >= nowH && hours.length < 24) hours.push({ time: d, temp: Math.round(j.hourly.temperature_2m[i]), code: j.hourly.weather_code[i], rain: j.hourly.precipitation_probability[i] || 0 });
      });
      M.weather = {
        temp: Math.round(j.current.temperature_2m), feels: Math.round(j.current.apparent_temperature),
        code: j.current.weather_code, isDay: j.current.is_day, humidity: j.current.relative_humidity_2m, wind: Math.round(j.current.wind_speed_10m),
        hours: hours,
        today: { max: Math.round(j.daily.temperature_2m_max[0]), min: Math.round(j.daily.temperature_2m_min[0]), rain: j.daily.precipitation_probability_max[0] || 0, code: j.daily.weather_code[0], sunrise: hhmm(j.daily.sunrise[0]), sunset: hhmm(j.daily.sunset[0]) },
        tomorrow: { max: Math.round(j.daily.temperature_2m_max[1]), min: Math.round(j.daily.temperature_2m_min[1]), rain: j.daily.precipitation_probability_max[1] || 0, code: j.daily.weather_code[1] }
      };
      M.weatherIsSample = false;
      M.renderWeather();
      M.status('weather', true, 'Live weather for ' + c.name);
    }).catch(function () {
      if (!M.weather || M.weatherIsSample) { M.weather = sample(); M.weatherIsSample = true; M.renderWeather(); }
      M.status('weather', false, 'Live weather unavailable here (sample shown)');
    });
  };

  M.findCity = function (name) {
    return fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(name))
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.results || !j.results.length) throw new Error('not found'); var r = j.results[0]; return { name: r.name, lat: r.latitude, lon: r.longitude }; });
  };

  // When does it next rain (≥50% chance) in the coming hours?
  M.nextRain = function () {
    if (!M.weather) return null;
    var h = M.weather.hours.filter(function (x) { return x.rain >= 50 || M.wmo(x.code).rainy; })[0];
    return h || null;
  };

  M.renderWeather = function () {
    var w = M.weather; if (!w) return;
    var info = M.wmo(w.code, w.isDay), $ = M.$;
    $('wMiniIcon').innerHTML = M.icon(info.icon);
    $('wMiniTemp').textContent = w.temp + '°C';
    var r = M.nextRain();
    $('wMiniDesc').textContent = info.text + (r ? ' · rain around ' + M.fmtTime(r.time) : ' · no rain expected');
    $('wBigIcon').innerHTML = M.icon(info.icon);
    $('wBigTemp').textContent = w.temp + '°C';
    $('wBigDesc').textContent = info.text + ' · feels like ' + w.feels + '°';
    $('wBigExtra').textContent = r ? 'Rain likely around ' + M.fmtTime(r.time) + ', take an umbrella' : 'High ' + w.today.max + '° · Low ' + w.today.min + '°';
    var hrs = $('wHours'); hrs.innerHTML = '';
    [0, 3, 6, 9, 12].forEach(function (k, i) {
      var h = w.hours[k]; if (!h) return;
      var d = document.createElement('div'); d.className = 'hour';
      d.innerHTML = '<span>' + (i === 0 ? 'Now' : M.fmtTime(h.time).replace(':00', '')) + '</span>' + M.icon(M.wmo(h.code, 1).icon) + '<b>' + h.temp + '°</b>';
      hrs.appendChild(d);
    });
    $('wSampleNote').textContent = M.weatherIsSample ? 'Sample weather. Live weather loads once the mirror is online.' : M.settings.city.name;
  };
})();
