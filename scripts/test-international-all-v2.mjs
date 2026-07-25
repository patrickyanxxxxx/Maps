import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = "modules/test/international-all-v2";
const responseText = await readFile(`${root}/assets/response.bundle.js`, "utf8");
const start = responseText.indexOf("function iRingoSurgeAdaptiveHybridFix");
const end = responseText.indexOf("async function ti", start);
if (start < 0 || end < 0) throw new Error("adaptive hybrid function was not found");

const responseContext = { structuredClone, JSON, Date, URL, console };
vm.runInNewContext(`${responseText.slice(start, end)}\nthis.adaptiveFix = iRingoSurgeAdaptiveHybridFix;`, responseContext);
const adaptiveFix = responseContext.adaptiveFix;

const tile = (style, url, extra = {}) => ({
	style,
	baseURL: url,
	validVersion: [{ identifier: 1, availableTiles: [{ minX: 214, minY: 82, maxX: 216, maxY: 82, minZ: 8, maxZ: 21 }] }],
	...extra,
});

const cnURLInfo = {
	dispatcherURL: "https://dispatcher.is.autonavi.com/dispatcher",
	directionsURL: "https://direction2.is.autonavi.com/direction",
	backgroundRevGeoURL: "https://reverse.is.autonavi.com/reverse",
	polyLocationShiftURL: "https://shift.is.autonavi.com/shift",
};
const xxURLInfo = {
	dispatcherURL: "https://gsp-ssl.ls.apple.com/dispatcher",
	directionsURL: "https://gsp-ssl.ls.apple.com/directions",
	backgroundRevGeoURL: "https://gsp-ssl.ls.apple.com/reverse",
	muninBaseURL: "https://gsp76-ssl.ls.apple.com/munin",
	alternateResourcesURL: "https://gsp-ssl.ls.apple.com/resources",
	problemSubmissionURL: "https://gsp-ssl.ls.apple.com/problem",
};

const cn = {
	tileSet: [
		tile("VECTOR_STANDARD", "https://gspe12-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("VECTOR_TRAFFIC", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("VECTOR_TRAFFIC_SKELETON", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("VECTOR_ROADS", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("MUNIN_METADATA", "https://gsp76-cn-ssl.ls.apple.com/munin"),
		tile("RASTER_SATELLITE", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("RASTER_SATELLITE_NIGHT", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("SPUTNIK_METADATA", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("FLYOVER_C3M_MESH", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
	],
	resource: [{ resourceType: 1, filename: "cn.dat" }],
	attribution: [{ name: "AutoNavi", resource: [] }],
	urlInfoSet: [cnURLInfo],
	dataSet: [{ identifier: 1 }, { identifier: 101 }],
	displayString: [{ key: "cn" }],
	muninBucket: [{ identifier: 1 }],
	tileGroup: [{ identifier: 11, tileSet: [{ tileSetIndex: 0, identifier: 1 }], attributionIndex: [0], resourceIndex: [0] }],
	releaseInfo: "CN-release",
};
const xx = {
	tileSet: [
		tile("VECTOR_STANDARD", "https://gspe12-ssl.ls.apple.com/tiles"),
		tile("VECTOR_TRAFFIC", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_TRAFFIC_SKELETON", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_ROADS", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_ROAD_NETWORK", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_ROAD_SELECTION", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_TRANSIT", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_TRANSIT_SELECTION", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_COVERAGE", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("VECTOR_REGION_METADATA", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("COARSE_LOCATION_POLYGONS", "https://gspe19-ssl.ls.apple.com/tile.vf"),
		tile("MUNIN_METADATA", "https://gsp76-ssl.ls.apple.com/munin"),
		tile("VECTOR_SPR_MERCATOR", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("VECTOR_SPR_MODELS", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("VECTOR_SPR_MATERIALS", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("VECTOR_SPR_METADATA", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("VECTOR_SPR_ROADS", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("SPR_ASSET_METADATA", "https://gsp76-ssl.ls.apple.com/spr"),
		tile("RASTER_SATELLITE", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("RASTER_SATELLITE_NIGHT", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("SPUTNIK_METADATA", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("FLYOVER_C3M_MESH", "https://gspe11-ssl.ls.apple.com/tile"),
	],
	resource: [{ resourceType: 2, filename: "xx.dat" }],
	attribution: [{ name: "‎", resource: [] }, { name: "Apple", resource: [] }],
	urlInfoSet: [xxURLInfo],
	dataSet: [{ identifier: 2 }],
	displayString: [{ key: "xx" }],
	muninBucket: [{ identifier: 2 }],
	tileGroup: [{
		identifier: 22,
		qualityMarker: "US-native-detail",
		tileSet: [
			{ tileSetIndex: 18, identifier: 1 },
			{ tileSetIndex: 19, identifier: 1 },
			{ tileSetIndex: 20, identifier: 1 },
			{ tileSetIndex: 21, identifier: 1 },
		],
		attributionIndex: [0, 1],
		resourceIndex: [0],
	}, {
		identifier: 23,
		qualityMarker: "US-native-base",
		tileSet: [
			{ tileSetIndex: 0, identifier: 1 },
			{ tileSetIndex: 1, identifier: 1 },
			{ tileSetIndex: 2, identifier: 1 },
		],
		attributionIndex: [0, 1],
		resourceIndex: [0],
	}],
	releaseInfo: "XX-release",
};

const settings = { UrlInfoSet: { RAP: "Apple" } };
const cnResult = adaptiveFix(cn, { CN: cn, XX: xx }, settings, "CN");
if (!cnResult.urlInfoSet[0].dispatcherURL.includes("autonavi")) throw new Error("CN dispatcher was not preserved");
if (!cnResult.urlInfoSet[0].directionsURL.includes("autonavi")) throw new Error("CN directions were not preserved");
if (!cnResult.urlInfoSet[0].muninBaseURL.includes("gsp76-ssl")) throw new Error("international Munin service URL was not restored");
if (!cnResult.urlInfoSet[0].alternateResourcesURL.includes("gsp-ssl")) throw new Error("international alternate resources URL was not restored");
if (!cnResult.tileSet.some(item => item.style === "MUNIN_METADATA" && item.baseURL.includes("gsp76-ssl"))) throw new Error("international Munin was not restored");
for (const style of ["VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA"]) {
	if (!cnResult.tileSet.some(item => item.style === style && item.baseURL.includes("gsp76-ssl"))) throw new Error(`international Look Around selector was not restored: ${style}`);
}
for (const style of ["RASTER_SATELLITE", "RASTER_SATELLITE_NIGHT", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	const descriptors = cnResult.tileSet.filter(item => item.style === style);
	if (!descriptors.some(item => item.baseURL.includes("gspe11-ssl"))) throw new Error(`international visual descriptor was not restored: ${style}`);
	if (descriptors.some(item => item.baseURL.includes("-cn-ssl"))) throw new Error(`CN visual descriptor still shadows international imagery: ${style}`);
}
if (cnResult.tileSet.some(item => item.style === "VECTOR_ROADS" && item.baseURL.includes("-cn-ssl"))) throw new Error("mainland road selector leaked into Look Around chain");
if (!cnResult.tileSet.some(item => item.style === "VECTOR_TRAFFIC" && item.baseURL.includes("-cn-ssl"))) throw new Error("mainland traffic was not preserved");
if (!cnResult.tileSet.some(item => item.style === "VECTOR_TRAFFIC" && !item.baseURL.includes("-cn-ssl"))) throw new Error("international traffic fallback was not preserved");
if (cnResult.releaseInfo !== "XX-release") throw new Error("international capability identity was not applied");

const xxResult = adaptiveFix(xx, { CN: cn, XX: xx }, settings, "US");
if (!xxResult.urlInfoSet[0].dispatcherURL.includes("autonavi")) throw new Error("mainland dispatcher was not injected into US baseline");
if (!xxResult.urlInfoSet[0].directionsURL.includes("autonavi")) throw new Error("mainland directions were not injected into US baseline");
if (!xxResult.urlInfoSet[0].muninBaseURL.includes("gsp76-ssl")) throw new Error("international Munin was not preserved in US baseline");
if (!xxResult.tileSet.some(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"))) throw new Error("mainland rendering layer was not injected into international baseline");
const mainlandStandard = xxResult.tileSet.find(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"));
if (mainlandStandard.dataSet !== 101) throw new Error("mainland standard-map dataset identity was removed and may cause coordinate displacement");
if (mainlandStandard.countryRegionWhitelist?.[0]?.countryCode !== "CN") throw new Error("mainland standard-map CN provider whitelist is missing");
if (!xxResult.dataSet.some(item => item.identifier === 101)) throw new Error("mainland dataset definition was not appended to US manifest");
for (let index = 0; index < xx.tileSet.length; index++) {
	if (xxResult.tileSet[index].style !== xx.tileSet[index].style || xxResult.tileSet[index].baseURL !== xx.tileSet[index].baseURL) {
		throw new Error(`native US tile index changed at ${index}`);
	}
}
for (let index = 0; index < xx.attribution.length; index++) {
	if (xxResult.attribution[index].name !== xx.attribution[index].name) throw new Error(`native US attribution index changed at ${index}`);
}
if (xxResult.tileGroup?.[0]?.qualityMarker !== "US-native-detail") throw new Error("native US detail group metadata was not preserved");
const native3DRefs = xxResult.tileGroup[0].tileSet.slice(0, 4).map(ref => ref.tileSetIndex);
if (JSON.stringify(native3DRefs) !== JSON.stringify([18, 19, 20, 21])) throw new Error("native US 3D tile-group indices were changed");
if (xxResult.tileGroup[0].tileSet.length !== 4 || xxResult.tileGroup[0].attributionIndex.length !== 2 || xxResult.tileGroup[0].resourceIndex.length !== 1) throw new Error("native US 3D group was polluted by mainland references");
if (!xxResult.tileGroup[1].tileSet.some(ref => ref.tileSetIndex >= xx.tileSet.length)) throw new Error("mainland layers were not appended to the native 2D group");
if (xxResult.tileGroup[1].tileSet[0].tileSetIndex < xx.tileSet.length) throw new Error("mainland standard-map selectors do not precede the Apple 2D fallback");
if (!responseText.includes("u.tileGroup=Array.from(u.tileGroup??[])")) throw new Error("legacy tile-group rebuilder was not bypassed");
if (responseText.includes("u=iRingoSurgeAdaptiveHybridFix(u,s,o,t),u.tileGroup=tt.tileGroups")) throw new Error("legacy tile-group rebuilder is still active after test8 fix");

const roadText = await readFile(`${root}/assets/cn-native-road.js`, "utf8");
const roadContext = { module: { exports: {} }, exports: {}, console, Date, JSON, Number, Math, Promise, setTimeout, decodeURIComponent, encodeURIComponent };
vm.runInNewContext(roadText, roadContext);
const road = roadContext.module.exports;
const records = new Map();
const storage = {
	read: () => records.get("auth"),
	write: record => records.set("auth", JSON.stringify(record)),
};
const token = "A".repeat(48);
const observed = road.handle({
	url: "https://gspe19-cn-ssl.ls.apple.com/tiles",
	headers: {
		"maps-auth-token": token,
		"maps-tile-style": "style=20&v=2883&size=2&scale=0&vertical_datum=wgs84&preflight=2",
		"maps-tile-x": "12928",
		"maps-tile-y": "6730",
		"maps-tile-z": "14",
	},
}, storage, 1000);
if (observed.action !== "observe") throw new Error(`CN road auth was not observed: ${observed.action}`);
const rewritten = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?style=20&z=14&x=12928&y=6730&size=2&scale=0&preflight=2",
	headers: {},
}, storage, 1100);
if (rewritten.action !== "rewrite") throw new Error(`mainland road was not rewritten: ${rewritten.action}`);
if (rewritten.request.url !== "https://gspe19-cn-ssl.ls.apple.com/tiles") throw new Error("mainland road endpoint mismatch");
if (rewritten.request.headers["maps-auth-token"] !== token) throw new Error("observed road token was not reused");
const outside = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?style=20&z=14&x=14539&y=6451",
	headers: {},
}, storage, 1100);
if (outside.action !== "passthrough") throw new Error("foreign road request was modified");

const satelliteText = await readFile(`${root}/assets/satellite-route.js`, "utf8");
const runSatellite = input => {
	let result;
	vm.runInNewContext(satelliteText, {
		URL,
		Number,
		$request: { url: input },
		$done: value => { result = value; },
	});
	return result?.url ?? input;
};
const mainlandSatelliteInput = "https://gspe11-ssl.ls.apple.com/tile?style=98&v=226&region=0&z=14&x=12927&y=6735&h=0&preflight=2";
const mainlandSatellite = new URL(runSatellite(mainlandSatelliteInput));
if (mainlandSatellite.hostname !== "gspe11-2-cn-ssl.ls.apple.com" || mainlandSatellite.pathname !== "/2/tiles") throw new Error("mainland satellite endpoint was not applied");
if (mainlandSatellite.searchParams.get("x") !== "12927" || mainlandSatellite.searchParams.get("y") !== "6735") throw new Error("mainland satellite coordinates were changed and may drift");
const tokyoSatelliteInput = "https://gspe11-ssl.ls.apple.com/tile?style=98&v=226&region=0&z=17&x=116423&y=51615&h=0&preflight=2";
if (runSatellite(tokyoSatelliteInput) !== tokyoSatelliteInput) throw new Error("foreign satellite request was modified");

const moduleText = await readFile(`${root}/iRingo.Maps.sgmodule`, "utf8");
for (const marker of [
	"International-All Test v2",
	"6.4.0-test.8",
	"CountryCode:\"US\"",
	"TileSet.Satellite:\"HYBRID\"",
	"modules/test/international-all-v2/assets/",
	"assets/request.bundle.js",
	"assets/response.bundle.js",
	"assets/cn-native-road.js",
	"assets/satellite-route.js",
]) {
	if (!moduleText.includes(marker)) throw new Error(`Surge module is missing ${marker}`);
}
if (moduleText.includes("surge-adaptive-v1.4.0")) throw new Error("Surge module still references the retired directory");
if (moduleText.includes("DOMAIN,gspe11-ssl.ls.apple.com,DIRECT")) throw new Error("Surge module direct-routes international 3D tiles and may make them unreachable");

const egernText = await readFile(`${root}/iRingo.Maps.yaml`, "utf8");
for (const marker of [
	"International-All Test v2",
	"GeoManifest.Dynamic.Config.CountryCode: US",
	"UrlInfoSet.RAP: Apple",
	"LogLevel: WARN",
	'TileSet.Map="CN"',
	'TileSet.POI="CN"',
	'TileSet.Traffic="CN"',
	'TileSet.Flyover="XX"',
	'TileSet.Munin="XX"',
	'TileSet.Roads="XX"',
	'TileSet.Satellite="HYBRID"',
	'Storage="Argument"',
	"modules/test/international-all-v2/assets/",
	"assets/request.bundle.js",
	"assets/response.bundle.js",
	"assets/satellite-route.js",
	"binary_body: true",
]) {
	if (!egernText.includes(marker)) throw new Error(`Egern module is missing ${marker}`);
}
if (egernText.includes("assets/cn-native-road.js")) throw new Error("Egern module unexpectedly enables the Surge road authorization helper");
if (egernText.includes("surge-adaptive-v1.4.0")) throw new Error("Egern module references the retired directory");
if (egernText.includes("match: gspe11-ssl.ls.apple.com")) throw new Error("Egern module direct-routes international 3D tiles and may make them unreachable");

console.log("International-All v2 Egern-first integration tests passed");
