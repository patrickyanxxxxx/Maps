import { readFile } from "node:fs/promises";

const parameterKeys = [
	"GeoManifest.Dynamic.Config.CountryCode",
	"UrlInfoSet.Dispatcher",
	"UrlInfoSet.Directions",
	"UrlInfoSet.RAP",
	"UrlInfoSet.LocationShift",
	"TileSet.Earth",
	"TileSet.Flyover",
	"TileSet.Munin",
	"TileSet.Roads",
	"TileSet.Satellite",
	"Hybrid.MainlandLayers",
	"Hybrid.ServiceMode",
	"Storage",
	"LogLevel",
];

const surge = await readFile("modules/iRingo.Maps.sgmodule", "utf8");
const loon = await readFile("modules/iRingo.Maps.plugin", "utf8");
const egern = await readFile("modules/iRingo.Maps.yaml", "utf8");
const readme = await readFile("README.md", "utf8");

for (const key of parameterKeys) {
	if (!surge.includes(`${key}:`)) throw new Error(`Surge parameter or description missing: ${key}`);
	if (!loon.includes(`${key} = select`)) throw new Error(`Loon parameter missing: ${key}`);
	if (!readme.includes(`\`${key}\``)) throw new Error(`README default table missing: ${key}`);
}

for (const key of parameterKeys.filter(key => key !== "UrlInfoSet.Directions" && key !== "Storage")) {
	if (!egern.includes(`${key}:`)) throw new Error(`Egern parameter or description missing: ${key}`);
}

if (!egern.includes("UrlInfoSet.Directions=AutoNavi")) {
	throw new Error("Egern fixed navigation default is not documented");
}
if (!egern.includes("Storage=Argument")) {
	throw new Error("Egern fixed storage default is not documented");
}

for (const file of ["iRingo.Maps.srmodule", "iRingo.Maps.stoverride", "iRingo.Maps.snippet"]) {
	const text = await readFile(`modules/${file}`, "utf8");
	if (!text.includes("参数与默认值")) throw new Error(`${file} has no default parameter notes`);
}

console.log("Multi-client parameter documentation tests passed");
