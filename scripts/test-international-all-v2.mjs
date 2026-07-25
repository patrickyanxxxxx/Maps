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
		tile("RASTER_SATELLITE", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("RASTER_SATELLITE_NIGHT", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("SPUTNIK_METADATA", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("FLYOVER_C3M_MESH", "https://gspe11-ssl.ls.apple.com/tile"),
		tile("UNUSED_98", "https://gspe11-ssl.ls.apple.com/tile", {
			validVersion: [{ identifier: 226, availableTiles: [{ minX: 116000, minY: 51000, maxX: 117000, maxY: 52000, minZ: 17, maxZ: 20 }] }],
		}),
	],
	resource: [{ resourceType: 2, filename: "xx.dat", alternateResourceURLIndex: 0 }],
	attribution: [{ name: "‎", resource: [] }, { name: "Apple", resource: [] }],
	urlInfoSet: [xxURLInfo],
	dataSet: [{ identifier: 2 }],
	displayString: [{ key: "xx" }],
	muninBucket: [{ identifier: 2 }],
	offlineMetadata: [{ dataVersion: 202, regulatoryRegionId: 0 }],
	tileGroup: [{
		identifier: 22,
		qualityMarker: "US-native-detail",
		tileSet: [
			{ tileSetIndex: 19, identifier: 1 },
			{ tileSetIndex: 20, identifier: 1 },
			{ tileSetIndex: 21, identifier: 1 },
			{ tileSetIndex: 22, identifier: 1 },
		],
		attributionIndex: [0, 1],
		resourceIndex: [0],
		offlineMetadataIndex: 0,
	}, {
		identifier: 23,
		qualityMarker: "US-native-base",
		tileSet: [
			{ tileSetIndex: 0, identifier: 1 },
			{ tileSetIndex: 1, identifier: 1 },
			{ tileSetIndex: 2, identifier: 1 },
			{ tileSetIndex: 3, identifier: 1 },
		],
		attributionIndex: [0, 1],
		resourceIndex: [0],
		offlineMetadataIndex: 0,
	}],
	releaseInfo: "XX-release",
};

// Real iOS 27 CN manifests reference the complete 41-tile provider graph from
// their single native group. Keep the fixture representative so group-level
// coordinate ownership tests cover standard, POI, roads and satellite.
cn.tileGroup[0].tileSet = cn.tileSet.map((item, tileSetIndex) => ({
	tileSetIndex,
	identifier: item.validVersion?.[0]?.identifier,
}));

const settings = { UrlInfoSet: { RAP: "Apple" } };
const cnResult = adaptiveFix(cn, { CN: cn, XX: xx }, settings, "CN");
if (!cnResult.urlInfoSet[0].dispatcherURL.includes("autonavi")) throw new Error("CN dispatcher was not preserved");
if (!cnResult.urlInfoSet[0].directionsURL.includes("autonavi")) throw new Error("CN directions were not preserved");
if (cnResult.urlInfoSet[0].muninBaseURL !== xxURLInfo.muninBaseURL) throw new Error("international Munin service URL was not preserved");
if (cnResult.releaseInfo !== xx.releaseInfo) throw new Error("CN request did not produce the international capability identity");
for (const style of ["VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA"]) {
	if (!cnResult.tileSet.some(item => item.style === style && item.baseURL.includes("gsp76-ssl"))) throw new Error(`international Look Around selector was not preserved: ${style}`);
}
const cnSatelliteRoads = cnResult.tileSet.filter(item => item.style === "VECTOR_SPR_ROADS");
if (!cnSatelliteRoads.some(item => item.baseURL.includes("gsp76-ssl"))) throw new Error("international satellite/Look Around road descriptor was not preserved");
const regionalCNSPRRoads = cnSatelliteRoads.filter(item => item.baseURL.includes("-cn-ssl"));
if (regionalCNSPRRoads.length) throw new Error("CN SPR road descriptor competes with international Look Around");
for (const style of ["RASTER_SATELLITE", "RASTER_SATELLITE_NIGHT", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	const descriptors = cnResult.tileSet.filter(item => item.style === style);
	if (!descriptors.some(item => item.baseURL.includes("gspe11-ssl"))) throw new Error(`international visual descriptor was not preserved: ${style}`);
	if (style.startsWith("RASTER_SATELLITE")) {
		const mainland = descriptors.filter(item => item.baseURL.includes("-cn-ssl"));
		if (style === "RASTER_SATELLITE" && !mainland.length) throw new Error("regional CN satellite descriptor is missing");
		if (mainland.some(item => item.validVersion?.some(version => version.availableTiles?.some(region => !isMainlandRegion(region))))) throw new Error(`CN satellite descriptor was left global: ${style}`);
	} else {
		if (descriptors.some(item => item.baseURL.includes("-cn-ssl"))) throw new Error(`CN 3D descriptor competes with the international chain: ${style}`);
	}
}
if (!cnResult.tileSet.some(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"))) throw new Error("regional mainland standard selector was lost");
if (!cnResult.tileSet.some(item => item.style === "VECTOR_TRAFFIC" && item.baseURL.includes("-cn-ssl"))) throw new Error("regional mainland traffic was not preserved");
const nativeCNStandard = cnResult.tileSet.find(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"));
if (!nativeCNStandard) throw new Error("regional CN standard map was not injected");
const sourceCNStandard = cn.tileSet.find(item => item.style === "VECTOR_STANDARD");
if (nativeCNStandard.dataSet !== sourceCNStandard.dataSet) throw new Error("native CN standard dataset identity was mutated");
if (JSON.stringify(nativeCNStandard.countryRegionWhitelist || []) !== JSON.stringify(sourceCNStandard.countryRegionWhitelist || [])) throw new Error("native mainland standard provider metadata was mutated");
if (!nativeCNStandard.validVersion?.every(version => version.availableTiles?.every(isMainlandRegion))) throw new Error("native CN standard descriptor was not mainland-limited");
for (const style of ["VECTOR_ROADS", "VECTOR_ROAD_NETWORK", "VECTOR_ROAD_SELECTION"]) {
	const mainlandRoads = cnResult.tileSet.filter(item => item.style === style && item.baseURL.includes("-cn-ssl"));
	if (mainlandRoads.length) throw new Error(`CN road capability competes with international Look Around: ${style}`);
	if (!cnResult.tileSet.some(item => item.style === style && !item.baseURL.includes("-cn-ssl"))) throw new Error(`international road capability is missing: ${style}`);
}
if (cnResult.tileGroup.length !== xx.tileGroup.length) throw new Error("CN request did not preserve the native international group count");
for (const group of cnResult.tileGroup) {
	if (group.tileSet.some(ref => ref.tileSetIndex < 0 || ref.tileSetIndex >= cnResult.tileSet.length)) throw new Error("tile group contains an invalid tile index");
	if (group.resourceIndex?.some(index => index < 0 || index >= cnResult.resource.length)) throw new Error("tile group contains an invalid resource index");
	if (group.attributionIndex?.some(index => index < 0 || index >= cnResult.attribution.length)) throw new Error("tile group contains an invalid attribution index");
}
const activeCapabilityRefs = cnResult.tileGroup.flatMap(group => group.tileSet || []);
for (const style of ["MUNIN_METADATA", "VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA", "UNUSED_98", "RASTER_SATELLITE", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	if (!activeCapabilityRefs.some(ref => cnResult.tileSet[ref.tileSetIndex]?.style === style && !cnResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"))) throw new Error(`active international group is missing: ${style}`);
}
const activeBaseGroup = cnResult.tileGroup.find(group => group.tileSet?.some(ref => cnResult.tileSet[ref.tileSetIndex]?.style === "VECTOR_STANDARD" && !cnResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl")));
if (!activeBaseGroup) throw new Error("international base group is missing");
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "RASTER_SATELLITE"]) {
	if (!activeBaseGroup.tileSet.some(ref => cnResult.tileSet[ref.tileSetIndex]?.style === style && cnResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"))) throw new Error(`international base group is missing regional CN selector: ${style}`);
}

const xxResult = adaptiveFix(xx, { CN: cn, XX: xx }, settings, "US");
if (!xxResult.urlInfoSet[0].dispatcherURL.includes("autonavi")) throw new Error("mainland dispatcher was not injected into US baseline");
if (!xxResult.urlInfoSet[0].directionsURL.includes("autonavi")) throw new Error("mainland directions were not injected into US baseline");
if (!xxResult.urlInfoSet[0].addressCorrectionInitURL.includes("autonavi")) throw new Error("mainland address-correction service was not injected into US baseline");
if (xxResult.urlInfoSet[0].muninBaseURL !== xxURLInfo.muninBaseURL) throw new Error("international Munin was not preserved in US baseline");
if (!xxResult.tileSet.some(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"))) throw new Error("mainland rendering layer was not injected into international baseline");
const mainlandStandard = xxResult.tileSet.find(item => item.style === "VECTOR_STANDARD" && item.baseURL.includes("-cn-ssl"));
if (mainlandStandard.dataSet !== 101) throw new Error("mainland standard-map dataset identity was removed and may cause coordinate displacement");
if (JSON.stringify(mainlandStandard.countryRegionWhitelist || []) !== JSON.stringify(cn.tileSet[0].countryRegionWhitelist || [])) throw new Error("mainland standard-map native provider metadata changed");
if (!xxResult.dataSet.some(item => item.identifier === 101)) throw new Error("mainland dataset definition was not appended to US manifest");
const mainlandPOI = xxResult.tileSet.find(item => item.style === "VECTOR_POI" && item.baseURL.includes("-cn-ssl"));
if (!mainlandPOI) throw new Error("mainland POI layer was not injected into international baseline");
if (mainlandPOI.dataSet !== 101 || mainlandPOI.countryRegionWhitelist?.[0]?.countryCode !== "CN") throw new Error("mainland POI does not share the CN coordinate identity");
if (mainlandPOI.validVersion?.[0]?.availableTiles?.[0]?.minZ !== 6) throw new Error("native mainland POI zoom coverage was replaced");
if (mainlandPOI.validVersion[0].availableTiles.some(region => region.minZ === 6 && region.maxX === 63)) throw new Error("mainland POI coverage was left global");
for (const style of ["VECTOR_STREET_POI", "VECTOR_POI_V2", "VECTOR_POLYGON_SELECTION", "POI_BUSYNESS", "POI_DP_BUSYNESS", "VECTOR_POI_V2_UPDATE"]) {
	const descriptor = xxResult.tileSet.find(item => item.style === style && item.baseURL.includes("-cn-ssl"));
	if (!descriptor) throw new Error(`mainland POI companion layer is missing: ${style}`);
	if (descriptor.countryRegionWhitelist?.[0]?.countryCode !== "CN") throw new Error(`mainland POI companion layer does not share the CN coordinate identity: ${style}`);
}
for (const descriptor of xxResult.tileSet.filter(item => item.baseURL.includes("-cn-ssl") && [
	"VECTOR_BUILDINGS",
	"VECTOR_REALISTIC",
	"VECTOR_VENUES",
	"VECTOR_LAND_COVER",
	"VECTOR_STREET_LANDMARKS",
	"VECTOR_BUILDINGS_V2",
].includes(item.style))) {
	if (descriptor.countryRegionWhitelist?.[0]?.countryCode !== "CN") throw new Error(`mainland geometry layer does not share the CN coordinate identity: ${descriptor.style}`);
}
if (xxResult.urlInfoSet[0].polyLocationShiftURL !== cnURLInfo.polyLocationShiftURL) throw new Error("AutoNavi mainland location-shift service was not preserved");
for (const style of ["VECTOR_ROADS", "VECTOR_ROAD_NETWORK", "VECTOR_ROAD_SELECTION"]) {
	const mainlandRoads = xxResult.tileSet.filter(item => item.style === style && item.baseURL.includes("-cn-ssl"));
	if (mainlandRoads.length) throw new Error(`mainland road selector competes with international Look Around: ${style}`);
	if (!xxResult.tileSet.some(item => item.style === style && !item.baseURL.includes("-cn-ssl"))) throw new Error(`international road capability is missing: ${style}`);
}
const mainlandSPRRoad = xxResult.tileSet.find(item => item.style === "VECTOR_SPR_ROADS" && item.baseURL.includes("-cn-ssl"));
if (mainlandSPRRoad) throw new Error("mainland SPR road selector competes with international Look Around");
if (!xxResult.tileSet.some(item => item.style === "VECTOR_SPR_ROADS" && !item.baseURL.includes("-cn-ssl"))) throw new Error("international SPR road was lost while aligning mainland roads");
for (const style of ["RASTER_SATELLITE", "RASTER_SATELLITE_NIGHT"]) {
	const mainland = xxResult.tileSet.find(item => item.style === style && item.baseURL.includes("-cn-ssl"));
	const foreign = xxResult.tileSet.find(item => item.style === style && !item.baseURL.includes("-cn-ssl"));
	if (!mainland || !foreign) throw new Error(`regional CN plus international satellite chain is incomplete: ${style}`);
	if (!mainland.validVersion?.every(version => version.availableTiles?.every(isMainlandRegion))) throw new Error(`mainland satellite descriptor was not regionalized: ${style}`);
}
if (xxResult.releaseInfo !== xx.releaseInfo) throw new Error("international PROD identity was not preserved");
for (const filename of ["POITypeMapping-CN-1.json", "POITypeMapping-CN-2.json", "China.cms-lpr"]) {
	const resource = xxResult.resource.find(item => item.filename === filename);
	if (!resource) throw new Error(`mainland POI resource is missing: ${filename}`);
	if (xxResult.urlInfoSet[0].alternateResourcesURL[resource.alternateResourceURLIndex]?.url !== "https://cn-resources.example/poi") throw new Error(`mainland POI resource URL index was not remapped: ${filename}`);
}
if (xxResult.resource.some(item => item.filename === "cn.dat")) throw new Error("unrelated mainland resource leaked into international baseline");
if (xxResult.urlInfoSet[0].alternateResourcesURL[0]?.url !== "https://gsp-ssl.ls.apple.com/resources") throw new Error("native international resource URL index changed");
for (let index = 0; index < xx.tileSet.length; index++) {
	if (xxResult.tileSet[index].style !== xx.tileSet[index].style || xxResult.tileSet[index].baseURL !== xx.tileSet[index].baseURL) {
		throw new Error(`native US tile index changed at ${index}`);
	}
}
for (let index = 0; index < xx.attribution.length; index++) {
	if (index === 0) {
		if (!xxResult.attribution[index].name.startsWith(" iRingo: 📍 adaptive hybrid\n")) throw new Error("iRingo adaptive hybrid attribution was not restored");
		if (xxResult.attribution[index].plainTextURLSHA256Checksum) throw new Error("iRingo attribution retained Apple's stale checksum");
	} else if (xxResult.attribution[index].name !== xx.attribution[index].name) throw new Error(`native US attribution index changed at ${index}`);
}
if (xxResult.tileGroup.length !== xx.tileGroup.length) throw new Error("international group count changed");
const mainlandGroup = xxResult.tileGroup.find(group => group.tileSet?.some(ref => xxResult.tileSet[ref.tileSetIndex]?.style === "VECTOR_STANDARD" && !xxResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl")));
if (!mainlandGroup) throw new Error("international base group is missing");
if (!Number.isInteger(mainlandGroup.identifier) || mainlandGroup.identifier <= 0 || mainlandGroup.identifier > 2147483647) throw new Error("base group identifier is not a valid positive int32");
if (xxResult.offlineMetadata.length !== xx.offlineMetadata.length + cn.offlineMetadata.length) throw new Error("CN regulatory metadata was not appended");
if (mainlandGroup.offlineMetadataIndex !== 0) throw new Error("active group regulatory metadata index changed");
if (xxResult.offlineMetadata[mainlandGroup.offlineMetadataIndex]?.regulatoryRegionId !== 0) throw new Error("active group no longer uses international regulatory semantics");
if (!mainlandGroup.tileSet.length) throw new Error("adaptive group has no tile references");
const firstInternationalRef = mainlandGroup.tileSet.findIndex(ref => ref.tileSetIndex < xx.tileSet.length);
if (firstInternationalRef !== 0) throw new Error("international capability selectors are not first in the active group");
const firstCNSatelliteRef = mainlandGroup.tileSet.findIndex(ref => xxResult.tileSet[ref.tileSetIndex]?.style === "RASTER_SATELLITE" && xxResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"));
const firstInternationalSatelliteRef = mainlandGroup.tileSet.findIndex(ref => xxResult.tileSet[ref.tileSetIndex]?.style === "RASTER_SATELLITE" && !xxResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"));
if (firstInternationalSatelliteRef < 0 || firstCNSatelliteRef < 0 || firstInternationalSatelliteRef >= firstCNSatelliteRef) throw new Error("international satellite selector does not precede the regional CN fallback");
const nativeBaseGroup = xx.tileGroup.find(group => group.qualityMarker === "US-native-base") ?? xx.tileGroup.at(-1);
const nativeUSOrder = nativeBaseGroup.tileSet.map(ref => ref.tileSetIndex);
const outputUSOrder = mainlandGroup.tileSet.filter(ref => ref.tileSetIndex < xx.tileSet.length).map(ref => ref.tileSetIndex);
let cursor = -1;
for (const index of nativeUSOrder) {
	const next = outputUSOrder.indexOf(index, cursor + 1);
	if (next < 0) throw new Error(`native US group reference order lost tile index ${index}`);
	cursor = next;
}
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_POI_V2", "VECTOR_POI_V2_UPDATE", "RASTER_SATELLITE", "RASTER_SATELLITE_NIGHT"]) {
	if (!mainlandGroup.tileSet.some(ref => xxResult.tileSet[ref.tileSetIndex]?.style === style)) throw new Error(`separate mainland group is missing: ${style}`);
}
for (const style of ["MUNIN_METADATA", "VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA", "UNUSED_98", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	if (!mainlandGroup.tileSet.some(ref => xxResult.tileSet[ref.tileSetIndex]?.style === style && !xxResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"))) {
		throw new Error(`adaptive group is missing international capability: ${style}`);
	}
}

// Current iOS 27 manifests use one combined group for base-map, satellite, 3D
// and Munin/SPR. Regional CN entries must be inserted into that same active
// group without replacing its international visual and Look Around graph.
const singleGroupXX = structuredClone(xx);
singleGroupXX.tileGroup = [{
	identifier: 24,
	qualityMarker: "US-native-combined",
	tileSet: xx.tileSet.map((item, tileSetIndex) => ({ tileSetIndex, identifier: item.validVersion?.[0]?.identifier })),
	attributionIndex: [0, 1],
	resourceIndex: [0],
}];
const singleGroupResult = adaptiveFix(singleGroupXX, { CN: cn, XX: singleGroupXX }, settings, "US");
if (singleGroupResult.tileGroup.length !== 1) throw new Error("iOS 27 combined manifest did not remain one active group");
const separatedRefs = singleGroupResult.tileGroup[0].tileSet;
if (!separatedRefs.some(ref => ref.tileSetIndex >= singleGroupXX.tileSet.length) || !separatedRefs.some(ref => ref.tileSetIndex < singleGroupXX.tileSet.length)) throw new Error("adaptive group is missing one provider side");
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_POI_V2", "VECTOR_POI_V2_UPDATE"]) {
	if (!separatedRefs.some(ref => singleGroupResult.tileSet[ref.tileSetIndex]?.style === style && singleGroupResult.tileSet[ref.tileSetIndex]?.baseURL.includes("-cn-ssl"))) {
		throw new Error(`separate iOS 27 mainland group is missing selector: ${style}`);
	}
}
for (const style of ["MUNIN_METADATA", "VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA", "UNUSED_98", "RASTER_SATELLITE", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	if (!separatedRefs.some(ref => singleGroupResult.tileSet[ref.tileSetIndex]?.style === style && !singleGroupResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl"))) {
		throw new Error(`iOS 27 active group lost international capability: ${style}`);
	}
}
const style98Position = separatedRefs.findIndex(ref => singleGroupResult.tileSet[ref.tileSetIndex]?.style === "UNUSED_98");
const firstCNSatellitePosition = separatedRefs.findIndex(ref =>
	singleGroupResult.tileSet[ref.tileSetIndex]?.style === "RASTER_SATELLITE" &&
	singleGroupResult.tileSet[ref.tileSetIndex]?.baseURL?.includes("-cn-ssl")
);
if (style98Position < 0) throw new Error("iOS 27 style=98 international 3D satellite selector is missing");
if (firstCNSatellitePosition >= 0 && style98Position > firstCNSatellitePosition) throw new Error("iOS 27 style=98 selector is still behind the CN satellite fallback");
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
const observedPOI = road.handle({
	url: "https://gspe19-cn-ssl.ls.apple.com/tiles",
	headers: {
		"maps-auth-token": token,
		"maps-tile-style": "style=68&v=2912&size=2&scale=0&vertical_datum=wgs84&preflight=2",
	},
}, storage, 1050);
if (observedPOI.action !== "observe") throw new Error("CN POI request could not seed native map authorization");
const rewritten = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?style=20&z=14&x=12928&y=6730&size=2&scale=0&preflight=2",
	headers: {},
}, storage, 1100);
if (rewritten.action !== "rewrite") throw new Error(`mainland road was not rewritten: ${rewritten.action}`);
if (new URL(rewritten.request.url).origin + new URL(rewritten.request.url).pathname !== "https://gspe19-cn-ssl.ls.apple.com/tiles") throw new Error("mainland road endpoint mismatch");
if (rewritten.request.headers["maps-auth-token"] !== token) throw new Error("observed road token was not reused");
const standard = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=40&style=1&z=14&x=12928&y=6730&size=2&scale=0&preflight=2",
	headers: {},
}, storage, 1100);
if (standard.action !== "rewrite") throw new Error(`mainland standard map was not rewritten: ${standard.action}`);
const standardURL = new URL(standard.request.url);
if (standardURL.hostname !== "gspe19-cn-ssl.ls.apple.com" || standardURL.pathname !== "/tiles") throw new Error("mainland standard endpoint mismatch");
if (standardURL.searchParams.get("style") !== "1" || standardURL.searchParams.get("flags") !== "40") throw new Error("mainland standard descriptor mismatch");
if (standardURL.searchParams.get("x") !== "12928" || standardURL.searchParams.get("y") !== "6730") throw new Error("mainland standard coordinates were changed");
const standardAccessKey = road.handle({
	url: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=40&style=1&z=16&x=51712&y=26920",
	headers: {},
}, storage, 1200);
if (standardAccessKey.action !== "rewrite") throw new Error("z16 mainland standard map was not rewritten");
const accessOnlyRecords = new Map();
const accessOnlyStorage = {
	read: () => accessOnlyRecords.get("auth"),
	write: record => accessOnlyRecords.set("auth", JSON.stringify(record)),
};
const cnAccessKey = "1784590536_" + "B".repeat(48);
const observedAccessKey = road.handle({
	url: `https://gspe19-cn-ssl.ls.apple.com/tiles?style=68&v=2912&z=14&x=12928&y=6730&accessKey=${cnAccessKey}`,
	headers: {},
}, accessOnlyStorage, 1200);
if (observedAccessKey.action !== "observe") throw new Error("CN URL accessKey was not observed");
const accessKeyRewrite = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=40&style=1&z=14&x=12928&y=6730",
	headers: {},
}, accessOnlyStorage, 1300);
if (accessKeyRewrite.action !== "rewrite") throw new Error("accessKey-only Egern request could not be rewritten");
if (new URL(accessKeyRewrite.request.url).searchParams.get("accessKey") !== cnAccessKey) throw new Error("observed CN URL accessKey was not reused");
const standardOutside = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=40&style=1&z=14&x=14539&y=6451",
	headers: {},
}, storage, 1200);
if (standardOutside.action !== "passthrough") throw new Error("foreign standard map request was modified");
const outside = road.handle({
	url: "https://gspe19-ssl.ls.apple.com/tile.vf?style=20&z=14&x=14539&y=6451",
	headers: {},
}, storage, 1100);
if (outside.action !== "passthrough") throw new Error("foreign road request was modified");

const moduleText = await readFile(`${root}/iRingo.Maps.sgmodule`, "utf8");
for (const marker of [
	"International-All Test v2",
	"6.4.0-test.20-ios27-style98-priority",
	"CountryCode:\"CN\"",
	"TileSet.Satellite:\"HYBRID\"",
	"modules/test/international-all-v2/assets/",
	"assets/request.bundle.js",
	"assets/response.bundle.js",
]) {
	if (!moduleText.includes(marker)) throw new Error(`Surge module is missing ${marker}`);
}
if (moduleText.includes("surge-adaptive-v1.4.0")) throw new Error("Surge module still references the retired directory");
if (moduleText.includes("DOMAIN,gspe11-ssl.ls.apple.com,DIRECT")) throw new Error("Surge module direct-routes international 3D tiles and may make them unreachable");
if (moduleText.includes("assets/satellite-route.js")) throw new Error("Surge still uses the retired satellite imagery rewrite");
if (moduleText.includes("assets/cn-satellite-road.js")) throw new Error("Surge still performs the retired test14 satellite-road rewrite");

const egernText = await readFile(`${root}/iRingo.Maps.yaml`, "utf8");
for (const marker of [
	"International-All Test v2",
	"GeoManifest.Dynamic.Config.CountryCode: CN",
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
	"binary_body: true",
]) {
	if (!egernText.includes(marker)) throw new Error(`Egern module is missing ${marker}`);
}
if (!egernText.includes("test20-ios27-style98-priority")) throw new Error("Egern module does not expose the test20 cache identity");
if (egernText.includes("assets/cn-native-road.js")) throw new Error("Egern still performs standard-map request rewriting under the CN baseline");
if (egernText.includes("assets/satellite-route.js")) throw new Error("Egern still uses the retired satellite imagery rewrite");
if (egernText.includes("assets/cn-satellite-road.js")) throw new Error("Egern still performs the retired test14 satellite-road rewrite");
if (egernText.includes("surge-adaptive-v1.4.0")) throw new Error("Egern module references the retired directory");
if (egernText.includes("policy: DIRECT\n- domain:\n    match: gspe11-ssl.ls.apple.com")) throw new Error("Egern module direct-routes international 3D tiles and may make them unreachable");

console.log("International-All v2 Egern-first integration tests passed");
