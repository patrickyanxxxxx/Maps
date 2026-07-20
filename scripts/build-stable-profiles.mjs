import { readFile, writeFile } from "node:fs/promises";

const releaseDirectory = process.argv[2];
if (!releaseDirectory) throw new Error("Usage: node build-stable-profiles.mjs <release-dir>");

let request = await readFile(`${releaseDirectory}/request.bundle.js`, "utf8");
let response = await readFile(`${releaseDirectory}/response.bundle.js`, "utf8");
let module = await readFile(`${releaseDirectory}/iRingo.Maps.yaml`, "utf8");

request = request.replaceAll(
	'case"gspe35-ssl.ls.apple.com":',
	'case"gspe35-ssl.ls.apple.com":case"gspe35-ssl.ls.apple.cn":',
);
response = response.replaceAll(
	'if("gspe35-ssl.ls.apple.com"===a.hostname)',
	'if(["gspe35-ssl.ls.apple.com","gspe35-ssl.ls.apple.cn"].includes(a.hostname))',
);

const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
module = module
	.replace("name: ' iRingo: 🗺️ Maps'", "name: ' iRingo: 🗺️ Maps China Full (Local)'")
	.replace("添加国际版功能", "完整中国地图数据与坐标修正")
	.replace("自定义服务版本", "高德地点与导航（本地脚本，不启用国际 3D）")
	.replace("  UrlInfoSet.LocationShift: AUTO", "  UrlInfoSet.LocationShift: AutoNavi")
	.replaceAll("https://github.com/NSRingo/GeoServices/releases/download/v4.6.1/request.bundle.js", `${base}/request.cn.bundle.js`)
	.replaceAll("https://github.com/NSRingo/GeoServices/releases/download/v4.6.1/response.bundle.js", `${base}/response.cn.bundle.js`)
	.replace("    - gspe35-ssl.ls.apple.com\n", "    - gspe35-ssl.ls.apple.com\n    - gspe35-ssl.ls.apple.cn\n");

await writeFile("modules/assets/request.cn.bundle.js", request);
await writeFile("modules/assets/response.cn.bundle.js", response);
await writeFile("modules/iRingo.Maps.China.Full.Local.yaml", module);

let globalModule = await readFile("modules/iRingo.Maps.iOS27.Local.v3.yaml", "utf8");
globalModule = globalModule
	.replace("Maps iOS 27 Local v3", "Maps International 3D (Local)")
	.replace("GeoManifest.Dynamic.Config.CountryCode: CN", "GeoManifest.Dynamic.Config.CountryCode: US")
	.replace("高德中国服务 + 国际卫星、地球与 Look Around", "国际主清单、2D/3D 卫星与 Look Around；中国数据可能不完整")
	.replace("├ CN: 中国清单（默认，保留高德服务并混合国际瓦片）", "├ CN: 中国清单")
	.replace("├ US: 国际清单", "├ US: 国际清单（默认）");
await writeFile("modules/iRingo.Maps.International.3D.Local.yaml", globalModule);

console.log("Wrote stable China and international 3D local profiles");
