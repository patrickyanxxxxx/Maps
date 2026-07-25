/* Route only mainland satellite-road overlays to the native CN vector service. */
(() => {
  "use strict";

  const MAINLAND_Z8 = [
    [214,82,216,82],[213,83,217,83],[213,84,218,84],[213,85,218,85],[212,86,218,86],
    [189,87,190,87],[210,87,220,87],[188,88,191,88],[210,88,223,88],[188,89,192,89],
    [210,89,223,89],[186,90,192,90],[210,90,223,90],[186,91,192,91],[209,91,222,91],
    [184,92,195,92],[207,92,221,92],[185,93,196,93],[206,93,221,93],[182,94,219,95],
    [180,96,217,96],[180,97,216,97],[180,98,214,98],[180,99,215,99],[182,100,214,100],
    [183,101,213,101],[184,102,214,102],[183,103,214,103],[184,104,215,104],[185,105,215,105],
    [187,106,215,106],[189,107,193,107],[197,107,213,107],[198,108,213,108],[197,109,213,109],
    [197,110,213,110],[198,111,213,111],[204,112,209,112],[205,113,207,113],[205,114,206,114],
    [205,115,207,115]
  ];
  const APPLE_HOSTS = {
    "gspe19-ssl.ls.apple.com": true,
    "gspe19-kittyhawk-ssl.ls.apple.com": true
  };
  const CN_HOSTS = {
    "gspe19-cn-ssl.ls.apple.com": true,
    "gspe19-2-cn-ssl.ls.apple.com": true
  };
  const STORAGE_KEY = "iRingo.Maps.InternationalAll.CNSatelliteRoadAuth.v1";
  const AUTH_MAX_AGE_MS = 30 * 60 * 1000;

  const lowerHeaders = headers => Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [String(key).toLowerCase(), String(value)]));
  const cloneHeaders = headers => Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key, String(value)]));
  const replaceHeader = (headers, name, value) => {
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(headers)) if (key.toLowerCase() === lowerName) delete headers[key];
    if (value !== undefined && value !== null) headers[name] = String(value);
  };
  const parameter = (source, name) => {
    const match = new RegExp("(?:^|&)" + name + "=([^&]*)", "i").exec(String(source || ""));
    if (!match) return null;
    try { return decodeURIComponent(match[1].replace(/\+/g, " ")); } catch (_) { return match[1]; }
  };
  const parseURL = value => {
    const match = /^(https?):\/\/([^\/:?#]+)(?::\d+)?([^?#]*)(?:\?([^#]*))?/i.exec(String(value || ""));
    return match ? { protocol: match[1], host: match[2].toLowerCase(), path: match[3] || "/", query: match[4] || "" } : null;
  };
  const parseRequest = request => {
    const address = parseURL(request?.url);
    if (!address) return null;
    const headers = lowerHeaders(request?.headers);
    const packed = headers["maps-tile-style"] || "";
    const value = name => parameter(address.query, name) ?? parameter(packed, name) ?? headers["maps-tile-" + name] ?? null;
    return {
      ...address,
      style: Number.parseInt(value("style"), 10),
      version: Number.parseInt(value("v") ?? value("version"), 10),
      x: Number.parseInt(value("x"), 10),
      y: Number.parseInt(value("y"), 10),
      z: Number.parseInt(value("z"), 10),
      size: value("size") || "2",
      scale: value("scale") || "0",
      verticalDatum: value("vertical_datum") || "wgs84",
      language: value("vlang"),
      preflight: value("preflight") || "2",
      token: headers["maps-auth-token"] || null,
      accessKey: value("accessKey") ?? value("accesskey")
    };
  };
  const isMainland = tile => {
    if (![tile?.x, tile?.y, tile?.z].every(Number.isInteger) || tile.z < 8 || tile.z > 21) return false;
    const factor = 2 ** (tile.z - 8);
    const x8 = Math.floor(tile.x / factor);
    const y8 = Math.floor(tile.y / factor);
    return MAINLAND_Z8.some(([minX, minY, maxX, maxY]) => x8 >= minX && x8 <= maxX && y8 >= minY && y8 <= maxY);
  };
  const readAuth = (storage, now) => {
    let value;
    try {
      value = storage?.read?.();
      if (typeof value === "string") value = JSON.parse(value);
    } catch (_) { return null; }
    if (!value || !Number.isInteger(value.version) || value.version < 1) return null;
    if (!Number.isFinite(value.savedAt) || now - value.savedAt < 0 || now - value.savedAt > AUTH_MAX_AGE_MS) return null;
    if (!(String(value.token || "").length >= 16 || String(value.accessKey || "").length >= 16)) return null;
    return value;
  };
  const observe = (tile, storage, now) => {
    if (!tile || !CN_HOSTS[tile.host] || tile.path !== "/tiles" || !Number.isInteger(tile.version)) return false;
    if (!(String(tile.token || "").length >= 16 || String(tile.accessKey || "").length >= 16)) return false;
    const previous = readAuth(storage, now) || {};
    storage?.write?.({ token: tile.token || previous.token || null, accessKey: tile.accessKey || previous.accessKey || null, version: tile.version, savedAt: now });
    return true;
  };
  const encode = (name, value) => encodeURIComponent(name) + "=" + encodeURIComponent(String(value));
  const makeQuery = (tile, auth) => {
    const pairs = [["flags", "32"], ["style", tile.style], ["size", tile.size], ["scale", tile.scale], ["v", auth.version], ["z", tile.z], ["x", tile.x], ["y", tile.y], ["vertical_datum", tile.verticalDatum]];
    if (tile.language) pairs.push(["vlang", tile.language]);
    pairs.push(["preflight", tile.preflight]);
    if (auth.accessKey) pairs.push(["accessKey", auth.accessKey]);
    return pairs.map(([name, value]) => encode(name, value)).join("&");
  };
  const packedStyle = (tile, auth) => [["style", tile.style], ["size", tile.size], ["scale", tile.scale], ["v", auth.version], ["vertical_datum", tile.verticalDatum], ["preflight", tile.preflight]].map(([name, value]) => encode(name, value)).join("&");
  const rewrite = (request, tile, auth) => {
    const headers = cloneHeaders(request?.headers);
    replaceHeader(headers, "Host", "gspe19-cn-ssl.ls.apple.com");
    replaceHeader(headers, ":authority", null);
    replaceHeader(headers, "maps-auth-token", auth.token || null);
    replaceHeader(headers, "maps-tile-style", packedStyle(tile, auth));
    replaceHeader(headers, "maps-tile-x", tile.x);
    replaceHeader(headers, "maps-tile-y", tile.y);
    replaceHeader(headers, "maps-tile-z", tile.z);
    replaceHeader(headers, "If-None-Match", null);
    replaceHeader(headers, "If-Modified-Since", null);
    replaceHeader(headers, "Content-Length", null);
    return { url: "https://gspe19-cn-ssl.ls.apple.com/tiles?" + makeQuery(tile, auth), headers };
  };
  const handle = (request, storage, now = Date.now()) => {
    const tile = parseRequest(request);
    if (observe(tile, storage, now)) return { action: "observe", tile };
    const targeted = tile && APPLE_HOSTS[tile.host] && tile.path === "/tile.vf" && (tile.style === 20 || tile.style === 66) && isMainland(tile);
    if (!targeted) return { action: "passthrough", tile };
    const auth = readAuth(storage, now);
    return auth ? { action: "rewrite", tile, request: rewrite(request, tile, auth), authVersion: auth.version } : { action: "passthrough-no-auth", tile };
  };

  const api = { parseRequest, isMainland, readAuth, observe, rewrite, handle };
  if (typeof module === "object" && module?.exports) module.exports = api;
  if (typeof $request === "object" && typeof $done === "function") {
    const storage = {
      read: () => $persistentStore.read(STORAGE_KEY),
      write: value => $persistentStore.write(JSON.stringify(value), STORAGE_KEY)
    };
    try {
      const result = handle($request, storage);
      if (result.action === "rewrite") {
        console.log("[iRingo Maps CN satellite roads] style=" + result.tile.style + " " + result.tile.z + "/" + result.tile.x + "/" + result.tile.y + " -> CN v=" + result.authVersion);
        $done(result.request);
      } else $done({});
    } catch (error) {
      console.log("[iRingo Maps CN satellite roads] passthrough: " + (error?.message || error));
      $done({});
    }
  }
})();
