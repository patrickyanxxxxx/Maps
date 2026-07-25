import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import vm from "node:vm";

const root = "modules/test/international-all-v3";
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

const isMainlandRegion = region => {
	if (!region || region.minZ < 8) return false;
	const factor = 2 ** (region.minZ - 8);
	const minXAtZ8 = Math.floor(region.minX / factor);
	const maxXAtZ8 = Math.ceil((region.maxX + 1) / factor) - 1;
	return minXAtZ8 >= 180 && maxXAtZ8 <= 223;
};

const cnURLInfo = {
	dispatcherURL: "https://dispatcher.is.autonavi.com/dispatcher",
	directionsURL: "https://direction2.is.autonavi.com/direction",
	backgroundRevGeoURL: "https://reverse.is.autonavi.com/reverse",
	addressCorrectionInitURL: "https://address.is.autonavi.com/init",
	addressCorrectionUpdateURL: "https://address.is.autonavi.com/update",
	polyLocationShiftURL: "https://shift.is.autonavi.com/localshift",
	alternateResourcesURL: [
		{ url: "https://cn-resources.example/primary" },
		{ url: "https://cn-resources.example/poi" },
	],
};
const xxURLInfo = {
	dispatcherURL: "https://gsp-ssl.ls.apple.com/dispatcher",
	directionsURL: "https://gsp-ssl.ls.apple.com/directions",
	backgroundRevGeoURL: "https://gsp-ssl.ls.apple.com/reverse",
	muninBaseURL: "https://gspe81-ssl.ls.apple.com/munin",
	alternateResourcesURL: [{ url: "https://gsp-ssl.ls.apple.com/resources" }],
	problemSubmissionURL: "https://gsp-ssl.ls.apple.com/problem",
};

const cn = {
	tileSet: [
		tile("VECTOR_STANDARD", "https://gspe12-cn-ssl.ls.apple.com/tiles", { dataSet: 101, countryRegionWhitelist: [{ region: "US" }] }),
		tile("VECTOR_POI", "https://gspe19-cn-ssl.ls.apple.com/tiles", {
			dataSet: 101,
			countryRegionWhitelist: [],
			validVersion: [{ identifier: 31, availableTiles: [
				{ minX: 0, minY: 0, maxX: 63, maxY: 63, minZ: 6, maxZ: 10 },
				{ minX: 0, minY: 0, maxX: 4095, maxY: 4095, minZ: 12, maxZ: 15 },
			] }],
		}),
		tile("VECTOR_STREET_POI", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("VECTOR_POI_V2", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("VECTOR_POLYGON_SELECTION", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("POI_BUSYNESS", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("POI_DP_BUSYNESS", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("VECTOR_POI_V2_UPDATE", "https://gspe19-cn-ssl.ls.apple.com/tiles", { dataSet: 101 }),
		tile("VECTOR_TRAFFIC", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("VECTOR_TRAFFIC_SKELETON", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("VECTOR_ROADS", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("VECTOR_SPR_ROADS", "https://gspe19-cn-ssl.ls.apple.com/tiles"),
		tile("MUNIN_METADATA", "https://gsp76-cn-ssl.ls.apple.com/munin"),
		tile("RASTER_SATELLITE", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("RASTER_SATELLITE_NIGHT", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("SPUTNIK_METADATA", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
		tile("FLYOVER_C3M_MESH", "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles"),
	],
	resource: [
		{ resourceType: 1, filename: "cn.dat", alternateResourceURLIndex: 0 },
		{ resourceType: 1, filename: "POITypeMapping-CN-1.json", alternateResourceURLIndex: 1 },
		{ resourceType: 1, filename: "POITypeMapping-CN-2.json", alternateResourceURLIndex: 1 },
		{ resourceType: 1, filename: "China.cms-lpr", alternateResourceURLIndex: 1 },
	],
	attribution: [{ name: "AutoNavi", resource: [] }],
	urlInfoSet: [cnURLInfo],
	dataSet: [{ identifier: 1 }, { identifier: 101 }],
	displayString: [{ key: "cn" }],
	muninBucket: [{ identifier: 1 }],
	offlineMetadata: [{ dataVersion: 101, regulatoryRegionId: 2 }],
	tileGroup: [{ identifier: 11, tileSet: [{ tileSetIndex: 0, identifier: 1 }], attributionIndex: [0], resourceIndex: [0], offlineMetadataIndex: 0 }],
	releaseInfo: "CN-release",
};
const xx = {
	tileSet: [
		tile("VECTOR_STANDARD", "https://gspe12-ssl.ls.apple.com/tiles"),
		tile("VECTOR_POI", "https://gspe19-ssl.ls.apple.com/tile.vf"),
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
		tile("RASTER_SATELLITE", "https://gspe11-ssl.ls.apple.com/tile", {
			validVersion: [{ identifier: 9911, availableTiles: [{ minX: 0, minY: 0, maxX: 255, maxY: 255, minZ: 8, maxZ: 21 }] }],
		}),
		tile("RASTER_SATELLITE_NIGHT", "https://gspe11-ssl.ls.apple.com/tile", {
			validVersion: [{ identifier: 9912, availableTiles: [{ minX: 0, minY: 0, maxX: 255, maxY: 255, minZ: 8, maxZ: 21 }] }],
		}),
		// iOS 27 international satellite selector: mirrors the live manifest
		// (identifier 226, empty whitelist, single global region).
		tile("UNUSED_98", "https://gspe11-ssl.ls.apple.com/tile", {
			countryRegionWhitelist: [],
			validVersion: [{ identifier: 226, availableTiles: [{ minX: 0, minY: 0, maxX: 255, maxY: 255, minZ: 8, maxZ: 20 }] }],
		}),
		tile("SPUTNIK_METADATA", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("FLYOVER_C3M_MESH", "https://gspe11-ssl.ls.apple.com/tile"),
	],
	resource: [{ resourceType: 2, filename: "xx.dat", alternateResourceURLIndex: 0 }],
	attribution: [{ name: "‎", resource: [] }, { name: "Apple", resource: [] }],
	urlInfoSet: [xxURLInfo],
	dataSet: [{ identifier: 2 }],
	displayString: [{ key: "xx" }],
	muninBucket: [{ identifier: 2 }],
	offlineMetadata: [{ dataVersion: 202, regulatoryRegionId: 0 }],
	tileGroup: [{
		identifier: 24,
		qualityMarker: "US-native-combined",
		tileSet: [],
		attributionIndex: [0, 1],
		resourceIndex: [0],
		offlineMetadataIndex: 0,
	}],
	releaseInfo: "XX-release",
};
// Real iOS 27 manifests expose one combined group referencing every selector.
xx.tileGroup[0].tileSet = xx.tileSet.map((item, tileSetIndex) => ({
	tileSetIndex,
	identifier: item.validVersion?.[0]?.identifier,
}));
cn.tileGroup[0].tileSet = cn.tileSet.map((item, tileSetIndex) => ({
	tileSetIndex,
	identifier: item.validVersion?.[0]?.identifier,
}));

const satelliteStyles = ["RASTER_SATELLITE", "RASTER_SATELLITE_NIGHT", "RASTER_SATELLITE_DIGITIZE", "RASTER_SATELLITE_ASTC", "RASTER_SATELLITE_POLAR", "RASTER_SATELLITE_POLAR_NIGHT"];

const assertTest20Invariants = (result, cnSource, xxSource, label) => {
	const urlInfo = result.urlInfoSet[0];
	if (!urlInfo.dispatcherURL?.url && !String(urlInfo.dispatcherURL).includes("autonavi") && !urlInfo.dispatcherURL?.url?.includes("autonavi")) {
		const value = urlInfo.dispatcherURL?.url ?? urlInfo.dispatcherURL;
		if (!String(value).includes("autonavi")) throw new Error(`${label}: mainland dispatcher was not injected`);
	}
	const endpoint = value => String(value?.url ?? value?.baseURL ?? value ?? "");
	if (!/\.is\.autonavi\.com/i.test(endpoint(urlInfo.directionsURL))) throw new Error(`${label}: mainland directions were not injected`);
	if (!/\.is\.autonavi\.com/i.test(endpoint(urlInfo.backgroundRevGeoURL))) throw new Error(`${label}: mainland reverse geocoder was not injected`);
	if (!/\.is\.autonavi\.com/i.test(endpoint(urlInfo.polyLocationShiftURL))) throw new Error(`${label}: AutoNavi GCJ-02 shift service was not preserved`);
	if (endpoint(urlInfo.muninBaseURL) !== endpoint(xxSource.urlInfoSet[0].muninBaseURL)) throw new Error(`${label}: international Munin service URL changed`);
	if (result.releaseInfo !== xxSource.releaseInfo) throw new Error(`${label}: international release identity changed`);
	// test20: no CN satellite descriptor may survive; mainland satellite is
	// reached exclusively through the style-98 request route.
	for (const style of satelliteStyles) {
		if (result.tileSet.some(item => item.style === style && /-cn-ssl\./.test(item.baseURL ?? ""))) throw new Error(`${label}: CN satellite descriptor must not be present: ${style}`);
	}
	const sourceRoutedSatellite = (xxSource.tileSet || []).find(item => item.style === "UNUSED_98");
	if (sourceRoutedSatellite) {
		const routed = result.tileSet.find(item => item.style === "UNUSED_98");
		if (!routed) throw new Error(`${label}: style-98 satellite selector is missing`);
		if ((routed.countryRegionWhitelist || []).length) throw new Error(`${label}: style-98 selector must not carry a whitelist`);
		if (!routed.validVersion?.some(version => version.availableTiles?.some(isMainlandRegion))) throw new Error(`${label}: style-98 selector is missing mainland route coverage`);
		const sourceRegionCount = sourceRoutedSatellite.validVersion?.[0]?.availableTiles?.length ?? 0;
		const resultRegionCount = routed.validVersion?.[0]?.availableTiles?.length ?? 0;
		if (resultRegionCount <= sourceRegionCount) throw new Error(`${label}: style-98 mainland coverage was not appended`);
		if (!routed.validVersion?.[0]?.availableTiles?.slice(0, sourceRegionCount).every((region, index) => JSON.stringify(region) === JSON.stringify(sourceRoutedSatellite.validVersion[0].availableTiles[index]))) throw new Error(`${label}: style-98 original coverage changed`);
	}
	// test27: the plain international satellite chain is byte-for-byte native
	// again (the test26 mainland carve-out regressed on device).
	for (const style of satelliteStyles) {
		const source = (xxSource.tileSet || []).find(item => item.style === style);
		if (!source) continue;
		const output = result.tileSet.find(item => item.style === style && !/-cn-ssl\./.test(item.baseURL ?? ""));
		if (!output) throw new Error(`${label}: international satellite selector is missing: ${style}`);
		if (JSON.stringify(output.validVersion) !== JSON.stringify(source.validVersion)) throw new Error(`${label}: international satellite coverage was modified: ${style}`);
	}
	// Munin/SPR/Look Around stays byte-for-byte international; no CN roads.
	for (const style of ["MUNIN_METADATA", "VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA"]) {
		const nativeDescriptors = (xxSource.tileSet || []).filter(item => item.style === style);
		for (const native of nativeDescriptors) {
			if (!result.tileSet.some(item => item.style === style && item.baseURL === native.baseURL)) throw new Error(`${label}: international Look Around descriptor was replaced: ${style}`);
		}
	}
	for (const style of ["VECTOR_ROAD_NETWORK", "VECTOR_ROAD_SELECTION", "VECTOR_SPR_ROADS"]) {
		if (result.tileSet.some(item => item.style === style && /-cn-ssl\./.test(item.baseURL ?? ""))) throw new Error(`${label}: CN road selector competes with international Look Around: ${style}`);
	}
	for (const style of ["VECTOR_ROADS", "VECTOR_ROAD_NETWORK", "VECTOR_ROAD_SELECTION", "VECTOR_SPR_ROADS"]) {
		if ((xxSource.tileSet || []).some(item => item.style === style) && !result.tileSet.some(item => item.style === style && !/-cn-ssl\./.test(item.baseURL ?? ""))) throw new Error(`${label}: international road capability is missing: ${style}`);
	}
	// test23: mainland roads come back as a regional CN layer (stable parity).
	// Mainland standard map, POI, traffic and roads remain regional CN entries.
	for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_TRAFFIC", "VECTOR_ROADS"]) {
		const mainland = result.tileSet.find(item => item.style === style && /-cn-ssl\./.test(item.baseURL ?? ""));
		if ((cnSource.tileSet || []).some(item => item.style === style) && !mainland) throw new Error(`${label}: regional mainland layer is missing: ${style}`);
		// POI layers keep their native zoom bands (which can start below z8) as
		// scaled mainland rectangles; only detailed z8+ regions are comparable.
		if (mainland && !mainland.validVersion?.every(version => version.availableTiles?.every(region => region.minZ < 8 || isMainlandRegion(region)))) throw new Error(`${label}: mainland layer was left global: ${style}`);
	}
	// Group invariants: single active group, international regulatory identity,
	// valid reference indices, mainland selectors referenced, no CN satellite.
	if (result.tileGroup.length !== (xxSource.tileGroup || []).length) throw new Error(`${label}: group count changed`);
	for (const group of result.tileGroup) {
		if (group.tileSet.some(ref => ref.tileSetIndex < 0 || ref.tileSetIndex >= result.tileSet.length)) throw new Error(`${label}: group contains an invalid tile index`);
		if (group.resourceIndex?.some(index => index < 0 || index >= result.resource.length)) throw new Error(`${label}: group contains an invalid resource index`);
		if (group.attributionIndex?.some(index => index < 0 || index >= result.attribution.length)) throw new Error(`${label}: group contains an invalid attribution index`);
	}
	const activeGroup = result.tileGroup.find(group => group.tileSet?.some(ref => result.tileSet[ref.tileSetIndex]?.style === "MUNIN_METADATA" && !/-cn-ssl\./.test(result.tileSet[ref.tileSetIndex]?.baseURL ?? "")));
	if (!activeGroup) throw new Error(`${label}: active international group is missing`);
	if (result.offlineMetadata?.[activeGroup.offlineMetadataIndex]?.regulatoryRegionId !== 0) throw new Error(`${label}: active group lost regulatoryRegionId=0`);
	const refStyles = activeGroup.tileSet.map(ref => ({ style: result.tileSet[ref.tileSetIndex]?.style, mainland: /-cn-ssl\./.test(result.tileSet[ref.tileSetIndex]?.baseURL ?? "") }));
	for (const style of ["UNUSED_98", "MUNIN_METADATA", "VECTOR_SPR_ROADS"]) {
		if ((xxSource.tileSet || []).some(item => item.style === style) && !refStyles.some(item => item.style === style && !item.mainland)) throw new Error(`${label}: active group is missing international capability: ${style}`);
	}
	for (const style of ["VECTOR_STANDARD", "VECTOR_POI"]) {
		if ((cnSource.tileSet || []).some(item => item.style === style) && !refStyles.some(item => item.style === style && item.mainland)) throw new Error(`${label}: active group is missing regional CN selector: ${style}`);
	}
	if (refStyles.some(item => satelliteStyles.includes(item.style) && item.mainland)) throw new Error(`${label}: active group references a CN satellite selector`);
	// CN POI resources remapped into the international URL array.
	const cnPOIFiles = (cnSource.resource || []).filter(item => ["POITypeMapping-CN-1.json", "POITypeMapping-CN-2.json", "China.cms-lpr"].includes(item.filename));
	for (const source of cnPOIFiles) {
		const resource = result.resource.find(item => item.filename === source.filename);
		if (!resource) throw new Error(`${label}: mainland POI resource is missing: ${source.filename}`);
		if (Number.isInteger(source.alternateResourceURLIndex)) {
			const expected = endpoint((cnSource.urlInfoSet?.[0]?.alternateResourcesURL || [])[source.alternateResourceURLIndex]);
			const actual = endpoint((result.urlInfoSet[0].alternateResourcesURL || [])[resource.alternateResourceURLIndex]);
			if (expected !== actual) throw new Error(`${label}: mainland POI resource URL index was not remapped: ${source.filename}`);
		}
	}
};

const settings = { UrlInfoSet: { RAP: "Apple" } };
const xxResult = adaptiveFix(structuredClone(xx), { CN: structuredClone(cn), XX: structuredClone(xx) }, settings, "US");
assertTest20Invariants(xxResult, cn, xx, "fixture US");
// test22: mainland layers are PREPENDED; the native US block must follow at a
// constant offset with its relative order and identifiers untouched.
const mainlandCount = xxResult.tileSet.length - xx.tileSet.length;
if (mainlandCount <= 0) throw new Error("no mainland layers were injected");
for (let index = 0; index < mainlandCount; index++) {
	if (!/-cn-ssl\./.test(xxResult.tileSet[index]?.baseURL ?? "")) throw new Error(`mainland-first block contains a non-mainland tile at ${index}`);
}
for (let index = 0; index < xx.tileSet.length; index++) {
	if (xxResult.tileSet[mainlandCount + index].style !== xx.tileSet[index].style || xxResult.tileSet[mainlandCount + index].baseURL !== xx.tileSet[index].baseURL) {
		throw new Error(`native US tile order changed at ${index}`);
	}
}
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_TRAFFIC"]) {
	const mainlandIndex = xxResult.tileSet.findIndex(item => item.style === style && /-cn-ssl\./.test(item.baseURL ?? ""));
	const internationalIndex = xxResult.tileSet.findIndex(item => item.style === style && !/-cn-ssl\./.test(item.baseURL ?? ""));
	if (mainlandIndex < 0 || internationalIndex < 0 || mainlandIndex > internationalIndex) throw new Error(`mainland layer does not precede the international one in tileSet order: ${style}`);
}
if (!xxResult.attribution[0].name.includes("iRingo: 📍 adaptive hybrid")) throw new Error("iRingo adaptive hybrid attribution was not restored");

// test21: uniform coordinate identity across ALL injected mainland layers.
// NATIVE (default) preserves each source descriptor's own whitelist; CN marks
// every layer. A mixed state (POI forced CN while roads stay native) is the
// suspected root cause of the mutual mainland drift and must never reappear.
const whitelistOf = (result, style) => JSON.stringify(result.tileSet.find(item => item.style === style && /-cn-ssl\./.test(item.baseURL ?? ""))?.countryRegionWhitelist ?? null);
const sourceWhitelistOf = style => JSON.stringify(cn.tileSet.find(item => item.style === style)?.countryRegionWhitelist ?? []);
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_TRAFFIC"]) {
	if (whitelistOf(xxResult, style) !== sourceWhitelistOf(style)) throw new Error(`NATIVE mode did not preserve the source whitelist: ${style}`);
}
const cnModeSettings = { UrlInfoSet: { RAP: "Apple" }, Hybrid: { MainlandWhitelist: "CN" } };
const cnModeResult = adaptiveFix(structuredClone(xx), { CN: structuredClone(cn), XX: structuredClone(xx) }, cnModeSettings, "US");
assertTest20Invariants(cnModeResult, cn, xx, "fixture US whitelist=CN");
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_TRAFFIC"]) {
	if (whitelistOf(cnModeResult, style) !== JSON.stringify([{ countryCode: "CN", region: "" }])) throw new Error(`CN mode did not mark the mainland layer: ${style}`);
}

// The CN-identity diagnostic path must produce the same test20 structure.
const cnResult = adaptiveFix(structuredClone(cn), { CN: structuredClone(cn), XX: structuredClone(xx) }, settings, "CN");
assertTest20Invariants(cnResult, cn, xx, "fixture CN");

// test27: Hybrid.Enabled=false must return the native manifest untouched.
const passthrough = adaptiveFix(structuredClone(cn), { CN: structuredClone(cn), XX: structuredClone(xx) }, { ...settings, Hybrid: { Enabled: "false" } }, "CN");
if (JSON.stringify(passthrough) !== JSON.stringify(cn)) throw new Error("Hybrid.Enabled=false did not pass the native manifest through");
const passthroughBool = adaptiveFix(structuredClone(xx), { CN: structuredClone(cn), XX: structuredClone(xx) }, { ...settings, Hybrid: { Enabled: false } }, "US");
if (JSON.stringify(passthroughBool) !== JSON.stringify(xx)) throw new Error("Hybrid.Enabled=false (boolean) did not pass the native manifest through");

if (!responseText.includes("u.tileGroup=Array.from(u.tileGroup??[])")) throw new Error("legacy tile-group rebuilder was not bypassed");

// --- satellite-route.js: mainland style-98 requests are rewritten, foreign
// and non-98 requests pass through untouched.
const routeText = await readFile(`${root}/assets/satellite-route.v27.js`, "utf8");
const runRoute = url => {
	let output;
	const context = { URL, URLSearchParams, Number, Math, console, globalThis: undefined, $request: { url }, $done: value => { output = value; } };
	context.globalThis = context;
	vm.runInNewContext(routeText, context);
	return output;
};
const beijing = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=98&v=226&region=0&z=14&x=13450&y=6220&h=0&accessKey=TEST");
if (!beijing?.url) throw new Error("mainland style-98 request was not rewritten");
const beijingURL = new URL(beijing.url);
if (beijingURL.hostname !== "gspe11-2-cn-ssl.ls.apple.com" || beijingURL.pathname !== "/2/tiles") throw new Error("mainland satellite endpoint mismatch");
if (beijingURL.searchParams.get("style") !== "7" || beijingURL.searchParams.get("v") !== "68") throw new Error("mainland satellite style/version mismatch");
if (beijingURL.searchParams.get("x") !== "13450" || beijingURL.searchParams.get("y") !== "6220" || beijingURL.searchParams.get("z") !== "14") throw new Error("mainland satellite coordinates changed");
if (beijingURL.searchParams.get("vertical_datum") !== "wgs84") throw new Error("mainland satellite datum parameter missing");
if (beijingURL.searchParams.get("region") !== null || beijingURL.searchParams.get("h") !== null) throw new Error("mainland satellite request kept international-only parameters");
const tokyo = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=98&v=226&region=0&z=14&x=14538&y=6450&h=0");
if (tokyo?.url) throw new Error("foreign style-98 request was modified");
// test26: style-7 rewrites are withdrawn (accessKey signed for international
// parameters fails on the CN endpoint); mainland style-7 requests should no
// longer occur because the manifest excludes mainland from their coverage,
// and any stragglers must pass through untouched.
const beijing7 = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=7&size=2&scale=2&v=10421&z=11&x=1615&y=840&vertical_datum=wgs84&preflight=2&accessKey=TEST7");
if (beijing7?.url) throw new Error("mainland style-7 request must pass through in test26");
const tokyo7 = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=7&size=2&scale=2&v=10421&z=11&x=1817&y=806");
if (tokyo7?.url) throw new Error("foreign style-7 request was modified");
const sputnik = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=15&v=100&z=14&x=13450&y=6220");
if (sputnik?.url) throw new Error("non-satellite 3D request was modified");
const style100 = runRoute("https://gspe11-ssl.ls.apple.com/tile?style=100&v=226&region=0&z=9&x=404&y=210&h=0");
if (style100?.url) throw new Error("style-100 request must pass through until its CN mapping is confirmed");

// --- optional: run the merge against real device manifests when present.
const realCNPath = "/tmp/maps-cn.json";
const realUSPath = "/tmp/maps-us.json";
if (existsSync(realCNPath) && existsSync(realUSPath)) {
	const realCN = JSON.parse(await readFile(realCNPath, "utf8"));
	const realUS = JSON.parse(await readFile(realUSPath, "utf8"));
	const realResult = adaptiveFix(structuredClone(realUS), { CN: structuredClone(realCN), XX: structuredClone(realUS) }, settings, "US");
	assertTest20Invariants(realResult, realCN, realUS, "real US");
	console.log("real device manifests: test20 invariants passed");
} else {
	console.log("real device manifests not found, skipped (/tmp/maps-cn.json, /tmp/maps-us.json)");
}

// --- module wiring.
const moduleText = await readFile(`${root}/iRingo.Maps.sgmodule`, "utf8");
for (const marker of [
	"International-All Test v3",
	"6.4.0-test.27-known-good-plus-dual-mode",
	'CountryCode:"US"',
	'TileSet.Satellite:"ROUTE"',
	"modules/test/international-all-v3/assets/",
	"assets/request.bundle.js",
	"assets/response.bundle.js",
	"assets/satellite-route.v27.js",
	"gspe11-ssl.ls.apple.com",
]) {
	if (!moduleText.includes(marker)) throw new Error(`Surge module is missing ${marker}`);
}
if (moduleText.includes("DOMAIN,gspe11-ssl.ls.apple.com,DIRECT")) throw new Error("Surge module direct-routes international satellite tiles and may make them unreachable");
if (!/hostname = %APPEND%.*gspe11-ssl\.ls\.apple\.com/.test(moduleText)) throw new Error("Surge module does not MITM the satellite route host");

const egernText = await readFile(`${root}/iRingo.Maps.yaml`, "utf8");
for (const marker of [
	"International-All Test v3",
	"GeoManifest.Dynamic.Config.CountryCode: US",
	"UrlInfoSet.RAP: Apple",
	"LogLevel: WARN",
	'TileSet.Map="CN"',
	'TileSet.POI="CN"',
	'TileSet.Traffic="CN"',
	'TileSet.Flyover="XX"',
	'TileSet.Munin="XX"',
	'TileSet.Roads="XX"',
	'TileSet.Satellite="ROUTE"',
	'Storage="Argument"',
	"modules/test/international-all-v3/assets/",
	"assets/request.bundle.js",
	"assets/response.bundle.js",
	"assets/satellite-route.v27.js",
	"binary_body: true",
	"- gspe11-ssl.ls.apple.com",
	"test27-known-good-plus-dual-mode",
]) {
	if (!egernText.includes(marker)) throw new Error(`Egern module is missing ${marker}`);
}
if (egernText.includes("assets/cn-native-road.js") || egernText.includes("assets/cn-satellite-road.js")) throw new Error("Egern still references retired rewrite scripts");
if (egernText.includes("match: gspe11-ssl.ls.apple.com\n    policy: DIRECT")) throw new Error("Egern module direct-routes international satellite tiles");

console.log("International-All v3 test20 integration tests passed");
