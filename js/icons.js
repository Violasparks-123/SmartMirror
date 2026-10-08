/* Weather icons, drawn as thin glowing lines so they show through the mirror film. */
(function () {
  var I = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    partly: '<path d="M12 2v2M4.9 4.9l1.4 1.4M2 12h2M17.7 6.3l1.4-1.4"/><path d="M8 9.5a4 4 0 0 1 7.6-1"/><path d="M8 20h9a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.7-.6A3.8 3.8 0 0 0 8 20z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 9.5 4.25 4.25 0 0 0 7 18z"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    drizzle: '<path d="M7 15h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 6.5 4.25 4.25 0 0 0 7 15z"/><path d="M9 18v1M13 18v1M17 18v1"/>',
    rain: '<path d="M7 14h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 5.5 4.25 4.25 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
    storm: '<path d="M7 14h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 5.5 4.25 4.25 0 0 0 7 14z"/><path d="M12 15l-2 4h4l-2 4"/>',
    snow: '<path d="M7 14h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 5.5 4.25 4.25 0 0 0 7 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01"/>'
  };
  M.icon = function (name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (I[name] || I.cloud) + '</svg>'; };
  // WMO weather codes (used by Open-Meteo) → words + icon
  M.wmo = function (code, isDay) {
    var c = Number(code);
    if (c === 0) return { text: isDay === 0 ? 'Clear night' : 'Sunny', icon: isDay === 0 ? 'moon' : 'sun', rainy: false };
    if (c === 1 || c === 2) return { text: 'Partly cloudy', icon: isDay === 0 ? 'cloud' : 'partly', rainy: false };
    if (c === 3) return { text: 'Cloudy', icon: 'cloud', rainy: false };
    if (c === 45 || c === 48) return { text: 'Foggy', icon: 'fog', rainy: false };
    if (c >= 51 && c <= 57) return { text: 'Drizzle', icon: 'drizzle', rainy: true };
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return { text: c >= 80 ? 'Rain showers' : 'Rainy', icon: 'rain', rainy: true };
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { text: 'Snow', icon: 'snow', rainy: true };
    if (c >= 95) return { text: 'Thunderstorm', icon: 'storm', rainy: true, storm: true };
    return { text: 'Cloudy', icon: 'cloud', rainy: false };
  };
})();
