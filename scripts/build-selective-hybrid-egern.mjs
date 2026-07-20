import { readFile, writeFile } from "node:fs/promises";

const releaseDirectory = process.argv[2];
if (!releaseDirectory) throw new Error("Usage: node build-selective-hybrid-egern.mjs <release-dir>");

const variant = process.argv[3] ?? "standard";
const mainland3DRoute = variant === "mainland-3d-route";
const mainland3DNative = variant === "mainland-3d-native";
const mainland3D = mainland3DRoute || mainland3DNative;
const profile = mainland3DRoute
	? "selective-hybrid-mainland-3d.v6"
	: mainland3DNative
		? "selective-hybrid-mainland-3d-native.v4"
		: "selective-hybrid.v1";
const requestPath = `modules/assets/request.${profile}.bundle.js`;
const responsePath = `modules/assets/response.${profile}.bundle.js`;
const modulePath = mainland3DRoute
	? "modules/iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml"
	: mainland3DNative
		? "modules/iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Native.Local.v4.yaml"
		: "modules/iRingo.Maps.iOS27.Selective-Hybrid.Local.v1.yaml";

let request = await readFile(`${releaseDirectory}/request.bundle.js`, "utf8");
let response = await readFile(`${releaseDirectory}/response.bundle.js`, "utf8");
let hybridSource = await readFile("src/function/InternationalHybrid.mjs", "utf8");

request = request.replaceAll(
	'case"gspe35-ssl.ls.apple.com":',
	'case"gspe35-ssl.ls.apple.com":case"gspe35-ssl.ls.apple.cn":',
);
response = response.replaceAll(
	'if("gspe35-ssl.ls.apple.com"===a.hostname)',
	'if(["gspe35-ssl.ls.apple.com","gspe35-ssl.ls.apple.cn"].includes(a.hostname))',
);

hybridSource = hybridSource.replace("export default function applyInternationalHybrid", "function applyInternationalHybrid");
const functionMarker = "async function ti(e,t,i)";
if (!response.includes(functionMarker)) throw new Error("Response function marker not found");
response = response.replace(functionMarker, `${hybridSource}\n${functionMarker}`);

const pipelineMarker = "u.displayString=tt.displayStrings(u.displayString,s,t),u.tileGroup=tt.tileGroups(u.tileGroup,u.tileSet,u.attribution,u.resource)";
if (!response.includes(pipelineMarker)) throw new Error("Response pipeline marker not found");
const pipelineStartMarker = "u.tileSet=tt.tileSets(u.tileSet,s,o,t)";
if (!response.includes(pipelineStartMarker)) throw new Error("Response pipeline start marker not found");
response = response.replace(pipelineStartMarker, `s.XX=clone(s.XX),${pipelineStartMarker}`);
response = response.replace(
	pipelineMarker,
	"u.displayString=tt.displayStrings(u.displayString,s,t),u=applyInternationalHybrid(u,s,o),u.tileGroup=tt.tileGroups(u.tileGroup,u.tileSet,u.attribution,u.resource)",
);

const encodeMarker = "M.debug(`releaseInfo: ${u.releaseInfo}`),e=te.encode(u)";
if (!response.includes(encodeMarker)) throw new Error("Response encode marker not found");
response = response.replace(
	encodeMarker,
	'M.debug(`releaseInfo: ${u.releaseInfo}`),e=te.encode(u),$response.headers=$response.headers??{},$response.headers["Cache-Control"]="no-store, no-cache, must-revalidate, max-age=0",$response.headers.Pragma="no-cache",$response.headers.Expires="0",delete $response.headers.ETag,delete $response.headers.etag,delete $response.headers["Last-Modified"],delete $response.headers["last-modified"],delete $response.headers["Content-Length"],delete $response.headers["content-length"]',
);

await writeFile(requestPath, request);
await writeFile(responsePath, response);

const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const scriptingName = mainland3DNative
	? "Maps.SelectiveHybridMainland3DNative"
	: mainland3DRoute
		? "Maps.SelectiveHybridMainland3D"
		: "Maps.SelectiveHybrid";
const mainland3DMode = mainland3DRoute ? "ROUTE" : mainland3DNative ? "NATIVE" : "DISABLED";
const args = `GeoManifest.Dynamic.Config.CountryCode="{{{GeoManifest.Dynamic.Config.CountryCode}}}"&UrlInfoSet.Dispatcher="{{{UrlInfoSet.Dispatcher}}}"&UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"&UrlInfoSet.RAP="{{{UrlInfoSet.RAP}}}"&UrlInfoSet.LocationShift="{{{UrlInfoSet.LocationShift}}}"&TileSet.Earth="{{{TileSet.Earth}}}"&TileSet.Flyover="{{{TileSet.Flyover}}}"&TileSet.Munin="{{{TileSet.Munin}}}"&TileSet.Roads="{{{TileSet.Roads}}}"&TileSet.Satellite="{{{TileSet.Satellite}}}"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="{{{Hybrid.MainlandLayers}}}"&Hybrid.Mainland3D="${mainland3DMode}"&Hybrid.ServiceMode="{{{Hybrid.ServiceMode}}}"&Storage="Argument"&LogLevel="{{{LogLevel}}}"`;

const moduleVersion = mainland3DNative ? "4" : mainland3DRoute ? "6" : "1";
const moduleSuffix = mainland3DNative ? " + Mainland 3D Native" : mainland3DRoute ? " + Mainland 3D Route" : "";
const module = `name: ' iRingo: Maps iOS 27 Selective Hybrid${moduleSuffix} Local v${moduleVersion}'
description: |-
  Egern 本地参数模块。中国大陆保留高德二维地图、道路、地点、导航与 2D 卫星${mainland3DNative ? "，并使用带正确 CN 白名单的原生国内 3D selector" : mainland3DRoute ? "，3D 瓦片按坐标改走 CN 端点" : "，只排除国内 3D"}；中国大陆以外全部使用 Apple 国际资源与服务。
  参考 Loon Hybrid Fix 的隔离思路，但继续使用本项目逻辑，并允许选择中国地点/导航服务范围。
  请勿与另一个 Selective Hybrid 模块同时启用。
compat_arguments:
  GeoManifest.Dynamic.Config.CountryCode: US
  UrlInfoSet.Dispatcher: AutoNavi
  UrlInfoSet.Directions: AutoNavi
  UrlInfoSet.RAP: Apple
  UrlInfoSet.LocationShift: AutoNavi
  TileSet.Earth: Apple
  TileSet.Flyover: XX
  TileSet.Munin: XX
  TileSet.Roads: XX
  TileSet.Satellite: XX
  Hybrid.MainlandLayers: EXTENDED
  Hybrid.ServiceMode: APPLE
  LogLevel: WARN
compat_arguments_desc: |
  推荐先使用默认值；CountryCode 必须保持 US 才能保留国际 3D 能力。

  Hybrid.MainlandLayers: [中国二维图层]
      ├ EXTENDED: 完整中国二维图层，含道路、标签、交通与 2D 卫星（默认）
      └ CORE: 仅标准地图、建筑、POI 与地标，用于诊断

  Hybrid.ServiceMode: [中国服务完整度]
      ├ APPLE: Apple 前台服务，仅保留大陆反向地理编码及可选坐标修正（默认，国外完全国际化）
      ├ CN_POI: 高德地点与反向地理编码，导航保留 Apple
      └ CN_FULL: 高德地点、反向地理编码、导航与交通（国内服务最完整，但国外 POI/导航不再严格国际化）

${mainland3DRoute ? `  国内 3D 路由:
      清单只保留一套国际 2D/3D 卫星 selector，避免从国内卫星视图直接定位国外时锁定 CN 数据源。
      仅坐标明确落在中国大陆的卫星/3D 瓦片请求改走 CN 端点。
      iOS 27 已确认的国际 style=98/v=226 会在大陆坐标转换为 CN style=7/v=68；国外保持原请求。

` : mainland3DNative ? `  国内卫星与 3D 原生选择:
      CN 2D/3D selector 使用协议规定的 countryCode/region 对象，并保留 CN 清单原始版本号和覆盖范围。
      不进行瓦片请求改写；国外由并存的国际 selector 回落。

` : ""}
  UrlInfoSet.LocationShift:
      ├ AutoNavi: 中国大陆使用 GCJ-02 修正（默认）
      └ Apple: 不注入高德坐标修正

  TileSet.Flyover / TileSet.Munin / TileSet.Roads / TileSet.Satellite:
      └ XX: 保持国际资源（默认；不建议在本模式中改为 CN）

  LogLevel: WARN / INFO / DEBUG
author: patrickyanxxxxx; VirgilClyne; Codex
homepage: https://github.com/patrickyanxxxxx/Maps
icon: https://developer.apple.com/assets/elements/icons/maps/maps-128x128.png
rules:
- domain:
    match: gspe12-cn-ssl.ls.apple.com
    policy: DIRECT
- domain:
    match: gspe19-cn-ssl.ls.apple.com
    policy: DIRECT
- domain:
    match: gspe19-2-cn-ssl.ls.apple.com
    policy: DIRECT
- domain:
    match: gspe79-cn-ssl.ls.apple.com
    policy: DIRECT
- domain:
    match: gspe11-2-cn-ssl.ls.apple.com
    policy: DIRECT
- domain_suffix:
    match: is.autonavi.com
    policy: DIRECT
scriptings:
- http_request:
    name: ${scriptingName}.defaults.request
    match: ^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults
    script_url: ${base}/request.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: ${scriptingName}.defaults.response
    match: ^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults
    script_url: ${base}/response.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
- http_request:
    name: ${scriptingName}.announcements.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/request.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: ${scriptingName}.announcements.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/response.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
    binary_body: true
- http_request:
    name: ${scriptingName}.manifest.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/request.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: ${scriptingName}.manifest.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/response.${profile}.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
    binary_body: true
${mainland3DRoute ? `- http_request:
    name: Maps.SelectiveHybridMainland3D.tile-route.request
    match: ^https?:\\/\\/(?:gspe11|gspe19(?:-kittyhawk)?|gspe79)-ssl\\.ls\\.apple\\.com\\/
    script_url: ${base}/request.selective-hybrid-mainland-3d-route.v6.js
` : ""}mitm:
  hostnames:
    includes:
    - configuration.ls.apple.com
    - gspe35-ssl.ls.apple.com
    - gspe35-ssl.ls.apple.cn
${mainland3DRoute ? `    - gspe19-ssl.ls.apple.com
    - gspe19-kittyhawk-ssl.ls.apple.com
    - gspe79-ssl.ls.apple.com
    - gspe11-ssl.ls.apple.com
` : ""}`;

await writeFile(modulePath, module);
console.log(`Wrote ${requestPath}, ${responsePath}, ${modulePath}`);
