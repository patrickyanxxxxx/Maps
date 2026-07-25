import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [cnPath = "/tmp/iringo-test23-cn.pb", usPath = "/tmp/iringo-test23-us.pb"] = process.argv.slice(2);
const [source, cnBody, usBody] = await Promise.all([
	readFile("modules/test/international-all-v2/assets/response.bundle.js", "utf8"),
	readFile(cnPath),
	readFile(usPath),
]);

const instrumented = source.replace("async function ti", "globalThis.__decodeManifest=te.decode;async function ti");
let finish;
const completed = new Promise(resolve => { finish = resolve; });
const requestURL = "https://gspe35-ssl.ls.apple.com/geo_manifest/dynamic/config?application=geod&application_version=1&country_code=CN&hardware=iPhone18%2C2&os=ios&os_build=24A5390f&os_version=27.0";
const usQuery = "?application=geod&application_version=1&country_code=US&hardware=iPhone18%2C2&os=ios&os_build=24A5390f&os_version=27.0";
const persistentRoot = {
	Maps: {
		Caches: {
			[usQuery.slice(0, -2)]: {
				0: { eTag: "real-us", base64: usBody.toString("base64") },
			},
		},
	},
};
const context = {
	Egern: true,
	URL,
	Buffer,
	Date,
	JSON,
	Math,
	Number,
	Promise,
	TextDecoder,
	TextEncoder,
	Uint8Array,
	ArrayBuffer,
	DataView,
	BigInt,
	structuredClone,
	setTimeout,
	clearTimeout,
	console,
	$argument: 'GeoManifest.Dynamic.Config.CountryCode="CN"&UrlInfoSet.Dispatcher="AutoNavi"&UrlInfoSet.Directions="AutoNavi"&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift="AutoNavi"&TileSet.Earth="AutoNavi"&TileSet.Flyover="XX"&TileSet.Map="CN"&TileSet.Munin="XX"&TileSet.POI="CN"&TileSet.Roads="XX"&TileSet.Satellite="HYBRID"&TileSet.Traffic="CN"&Config.Announcements.Environment="CN"&Storage="Argument"&LogLevel="WARN"',
	$request: { url: requestURL, method: "GET", headers: { "Content-Type": "application/octet-stream" } },
	$response: { status: 200, headers: { "Content-Type": "application/octet-stream" }, bodyBytes: cnBody },
	$persistentStore: {
		read(key) {
			if (key === "iRingo") return JSON.stringify(persistentRoot);
			return null;
		},
		write() { return true; },
	},
	$done: finish,
};
context.globalThis = context;
vm.runInNewContext(instrumented, context, { filename: "response.bundle.js" });
const output = await Promise.race([
	completed,
	new Promise((_, reject) => setTimeout(() => reject(new Error("response script timed out")), 15_000)),
]);
const modifiedBody = output?.body ?? output?.bodyBytes;
const bytes = modifiedBody instanceof Uint8Array ? modifiedBody : new Uint8Array(modifiedBody || []);
if (!bytes.length) throw new Error("real manifest output is empty");
if (bytes.length > 2_097_152) throw new Error(`real manifest exceeds Egern max-size: ${bytes.length}`);

const result = context.__decodeManifest(bytes);
const endpoint = tile => String(tile?.baseURL || "");
const isCN = tile => /-cn-ssl\.ls\.apple\.com/i.test(endpoint(tile));
const containsTile = (region, z, x, y) => {
	if (!region || z < region.minZ || z > region.maxZ) return false;
	const factor = 2 ** (z - region.minZ);
	return x >= region.minX * factor && x <= ((region.maxX + 1) * factor - 1)
		&& y >= region.minY * factor && y <= ((region.maxY + 1) * factor - 1);
};
console.log(JSON.stringify({
	offlineMetadata: result.offlineMetadata?.map((item, index) => ({ index, regulatoryRegionId: item?.regulatoryRegionId })),
	tileGroups: result.tileGroup?.map((group, index) => ({ index, identifier: group?.identifier, offlineMetadataIndex: group?.offlineMetadataIndex, refs: group?.tileSet?.length })),
}));
if (result.tileGroup.length !== 2) throw new Error(`real manifest must expose specialized CN base and international capability groups, got ${result.tileGroup.length}`);
const chinaGroup = result.tileGroup.find(group => result.offlineMetadata[group.offlineMetadataIndex]?.regulatoryRegionId === 2);
const capabilityGroup = result.tileGroup.find(group => result.offlineMetadata[group.offlineMetadataIndex]?.regulatoryRegionId === 0);
if (!chinaGroup || !capabilityGroup) throw new Error("real specialized provider groups lost their regulatory identities");
for (const group of result.tileGroup) {
	if ((group.tileSet || []).some(ref => ref.tileSetIndex < 0 || ref.tileSetIndex >= result.tileSet.length)) throw new Error("real manifest contains invalid tile index");
	if ((group.resourceIndex || []).some(index => index < 0 || index >= result.resource.length)) throw new Error("real manifest contains invalid resource index");
	if ((group.attributionIndex || []).some(index => index < 0 || index >= result.attribution.length)) throw new Error("real manifest contains invalid attribution index");
}
for (const style of ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_ROADS", "RASTER_SATELLITE"]) {
	if (!chinaGroup.tileSet.some(ref => result.tileSet[ref.tileSetIndex]?.style === style && isCN(result.tileSet[ref.tileSetIndex]))) throw new Error(`real CN group is missing ${style}`);
}
for (const style of ["MUNIN_METADATA", "VECTOR_SPR_MERCATOR", "VECTOR_SPR_MODELS", "VECTOR_SPR_MATERIALS", "VECTOR_SPR_METADATA", "VECTOR_SPR_ROADS", "SPR_ASSET_METADATA", "UNUSED_98", "SPUTNIK_METADATA", "FLYOVER_C3M_MESH"]) {
	if (!capabilityGroup.tileSet.some(ref => result.tileSet[ref.tileSetIndex]?.style === style && !isCN(result.tileSet[ref.tileSetIndex]))) throw new Error(`real international capability group is missing ${style}`);
}
if (capabilityGroup.tileSet.some(ref => ["VECTOR_STANDARD", "VECTOR_POI", "VECTOR_TRAFFIC"].includes(result.tileSet[ref.tileSetIndex]?.style))) throw new Error("real international capability group contains ordinary base-map selectors");
const chinaSatellite = result.tileSet.find(tile => tile?.style === "RASTER_SATELLITE" && isCN(tile));
const internationalSatellite = result.tileSet.find(tile => tile?.style === "RASTER_SATELLITE" && !isCN(tile));
const shanghai = { z: 14, x: 12927, y: 6735 };
const tokyo = { z: 14, x: 14539, y: 6451 };
const covers = (tile, point) => tile?.validVersion?.some(version => version.availableTiles?.some(region => containsTile(region, point.z, point.x, point.y)));
if (!covers(chinaSatellite, shanghai) || covers(chinaSatellite, tokyo)) throw new Error("real CN satellite coverage is not mainland-only");
if (covers(internationalSatellite, shanghai) || !covers(internationalSatellite, tokyo)) throw new Error("real international satellite coverage does not exclude mainland while preserving Tokyo");
console.log(JSON.stringify({
	cnInputBytes: cnBody.length,
	usInputBytes: usBody.length,
	outputBytes: bytes.length,
	tileSets: result.tileSet.length,
	tileGroups: result.tileGroup.length,
	chinaRegulatoryRegion: result.offlineMetadata[chinaGroup.offlineMetadataIndex]?.regulatoryRegionId,
	capabilityRegulatoryRegion: result.offlineMetadata[capabilityGroup.offlineMetadataIndex]?.regulatoryRegionId,
}));
