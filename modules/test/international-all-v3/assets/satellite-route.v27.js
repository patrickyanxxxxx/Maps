/* iOS 27 mainland satellite route -> CN style 7/68.
 * Confirmed on device (2026-07-26 Egern logs): with no CN satellite
 * descriptor in the manifest, geod requests mainland imagery through BOTH
 * the style=98 (v=226) selector and the legacy style=7 (v=10421)
 * international selector. test26: style-7 rewrites are withdrawn - their
 * accessKey is signed for the original international parameters and the CN
 * endpoint rejects them (device-verified in test25: requests reached
 * gspe11-2-cn-ssl but no imagery rendered). The manifest now excludes the
 * mainland from style-7 coverage instead, pushing geod onto style=98 whose
 * CN rewrite is the stable branch's device-proven path. Every decision is
 * logged so Egern logs prove which branch each request took. */
(() => {
	const TAG = "[iRingo SatRoute test.27]";
	const req = globalThis.$request;
	if (!req?.url) return $done({});
	let url;
	try {
		url = new URL(req.url);
	} catch (error) {
		console.log(`${TAG} unparsable url: ${String(req.url).slice(0, 120)}`);
		return $done({});
	}
	const style = url.searchParams.get("style") ?? url.searchParams.get("tile_style");
	if (url.hostname !== "gspe11-ssl.ls.apple.com" || url.pathname !== "/tile" || style !== "98") {
		console.log(`${TAG} pass (style=${style}) ${url.hostname}${url.pathname}`);
		return $done({});
	}
	const n = key => Number(url.searchParams.get(key));
	const x = n("x"), y = n("y"), z = n("z");
	if (![x, y, z].every(Number.isInteger) || z < 1 || z > 30) {
		console.log(`${TAG} pass (bad coords) style=${style} z=${z} x=${x} y=${y}`);
		return $done({});
	}
	const factor = z >= 8 ? 2 ** (z - 8) : 1 / 2 ** (8 - z);
	const x8 = Math.floor(x / factor), y8 = Math.floor(y / factor);
	const mainland = [
		[214,82,216,82],[213,83,217,83],[213,84,218,84],[213,85,218,85],[212,86,218,86],
		[189,87,190,87],[210,87,220,87],[188,88,191,88],[210,88,223,88],[188,89,192,89],
		[210,89,223,89],[186,90,192,90],[210,90,223,90],[186,91,192,91],[209,91,222,91],
		[184,92,195,92],[207,92,221,92],[185,93,196,93],[206,93,221,93],[182,94,219,95],
		[180,96,217,96],[180,97,216,97],[180,98,214,98],[180,99,215,99],[182,100,214,100],
		[183,101,213,101],[184,102,214,102],[183,103,214,103],[184,104,215,104],[185,105,215,105],
		[187,106,215,106],[189,107,193,107],[197,107,213,107],[198,108,213,108],[197,109,213,109],
		[197,110,213,110],[198,111,213,111],[204,112,209,112],[205,113,207,113],[205,114,206,114],[205,115,207,115],
	];
	if (!mainland.some(([a,b,c,d]) => x8 >= a && x8 <= c && y8 >= b && y8 <= d)) {
		console.log(`${TAG} pass (foreign) style=${style} z=${z} x8=${x8} y8=${y8}`);
		return $done({});
	}
	url.hostname = "gspe11-2-cn-ssl.ls.apple.com";
	url.pathname = "/2/tiles";
	url.searchParams.set("style", "7");
	url.searchParams.set("v", "68");
	url.searchParams.set("size", "1");
	url.searchParams.set("scale", "2");
	url.searchParams.set("vertical_datum", "wgs84");
	url.searchParams.delete("region");
	url.searchParams.delete("h");
	console.log(`${TAG} rewrite style=${style} z=${z} x=${x} y=${y} -> gspe11-2-cn-ssl`);
	$done({ url: url.toString() });
})();
