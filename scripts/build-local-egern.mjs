import { copyFile, readFile, writeFile } from "node:fs/promises";

const releaseDirectory = process.argv[2];
if (!releaseDirectory) throw new Error("Usage: node build-local-egern.mjs <release-dir>");

const requestPath = "modules/assets/request.v7.bundle.js";
const responsePath = "modules/assets/response.v7.bundle.js";
const modulePath = "modules/iRingo.Maps.iOS27.Local.v7.yaml";

let request = await readFile(`${releaseDirectory}/request.bundle.js`, "utf8");
let response = await readFile(`${releaseDirectory}/response.bundle.js`, "utf8");

request = request.replaceAll(
	'case"gspe35-ssl.ls.apple.com":',
	'case"gspe35-ssl.ls.apple.com":case"gspe35-ssl.ls.apple.cn":',
);
response = response.replaceAll(
	'if("gspe35-ssl.ls.apple.com"===a.hostname)',
	'if(["gspe35-ssl.ls.apple.com","gspe35-ssl.ls.apple.cn"].includes(a.hostname))',
);
response = response.replaceAll(
	'M.warn(`Missing style: ${i?.style}`)',
	'M.info(`Added international style: ${i?.style}`)',
);

const satellite3D = 'case"SPUTNIK_METADATA":case"SPUTNIK_C3M":case"SPUTNIK_DSM":case"SPUTNIK_DSM_GLOBAL":case"SPUTNIK_VECTOR_BORDER":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
const switchMarker = 'switch(e.style){case"RASTER_SATELLITE"';
if (!response.includes(switchMarker)) throw new Error("Satellite patch marker not found");
response = response.replace(switchMarker, `switch(e.style){${satellite3D}case"RASTER_SATELLITE"`);

const sprOriginal = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":M.info(`SPR style: ${e?.style}`),M.info(`SPR baseURL: ${e?.baseURL}`),M.debug(`SPR tile: ${JSON.stringify(e,null,2)}`);break;';
const sprInternational = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
if (!response.includes(sprOriginal)) throw new Error("SPR patch marker not found");
response = response.replace(sprOriginal, sprInternational);

// Request US to unlock iOS 27 Flyover, but use the complete CN manifest as the
// response base. Keep the original country code variable as US so the client
// retains international capabilities, then append only international visual
// styles (never international roads, POI or labels).
const internationalPrimary = 'default:s.XX=u,s.CN=await tt.decodeCache(l,n.search,i),s.CN||(M.warn("Missing cache: CN"),c=!1)';
const chinaResponseBase = 'default:s.XX=u,s.CN=await tt.decodeCache(l,n.search,i),s.CN&&(u=s.CN),s.CN||(M.warn("Missing cache: CN"),c=!1)';
if (!response.includes(internationalPrimary)) throw new Error("International manifest patch marker not found");
response = response.replace(internationalPrimary, chinaResponseBase);
const tileGroupMarker = 'u.tileGroup=tt.tileGroups(u.tileGroup,u.tileSet,u.attribution,u.resource)';
const hybridTileGroups = '(()=>{let e=new Set(["RASTER_SATELLITE","RASTER_SATELLITE_NIGHT","RASTER_SATELLITE_DIGITIZE","RASTER_SATELLITE_ASTC","RASTER_SATELLITE_POLAR","RASTER_SATELLITE_POLAR_NIGHT","SPUTNIK_METADATA","SPUTNIK_C3M","SPUTNIK_DSM","SPUTNIK_DSM_GLOBAL","SPUTNIK_VECTOR_BORDER","FLYOVER_C3M_MESH","FLYOVER_C3M_JPEG_TEXTURE","FLYOVER_C3M_ASTC_TEXTURE","FLYOVER_VISIBILITY","FLYOVER_SKYBOX","FLYOVER_NAVGRAPH","FLYOVER_METADATA","MUNIN_METADATA","VECTOR_SPR_MERCATOR","VECTOR_SPR_MODELS","VECTOR_SPR_MATERIALS","VECTOR_SPR_METADATA","SPR_ASSET_METADATA","VECTOR_SPR_POLAR","VECTOR_SPR_MODELS_OCCLUSION"]);for(let t of s.XX?.tileSet??[])e.has(t.style)&&!u.tileSet.some(e=>e.style===t.style&&e.scale===t.scale&&e.size===t.size&&e.dataSet===t.dataSet&&e.baseURL===t.baseURL)&&u.tileSet.push(t)})(),u.tileGroup=tt.tileGroups(u.tileGroup,u.tileSet,u.attribution,u.resource)';
if (!response.includes(tileGroupMarker)) throw new Error("Tile group patch marker not found");
response = response.replace(tileGroupMarker, hybridTileGroups);

// The tile pipeline needs the US capability path for 3D, but all service
// endpoints must be merged as CN or mainland search/POI/navigation metadata
// is lost to the international manifest.
const internationalURLInfo = 'u.urlInfoSet=tt.urlInfoSets(u.urlInfoSet,s,o,t)';
const chinaURLInfo = 'u.urlInfoSet=tt.urlInfoSets(u.urlInfoSet,s,o,"CN")';
if (!response.includes(internationalURLInfo)) throw new Error("URL info patch marker not found");
response = response.replace(internationalURLInfo, chinaURLInfo);

await writeFile(requestPath, request);
await writeFile(responsePath, response);

const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const args = 'GeoManifest.Dynamic.Config.CountryCode="{{{GeoManifest.Dynamic.Config.CountryCode}}}"&UrlInfoSet.Dispatcher="{{{UrlInfoSet.Dispatcher}}}"&UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"&UrlInfoSet.RAP="{{{UrlInfoSet.RAP}}}"&UrlInfoSet.LocationShift="{{{UrlInfoSet.LocationShift}}}"&TileSet.Earth="{{{TileSet.Earth}}}"&TileSet.Roads="{{{TileSet.Roads}}}"&TileSet.Satellite="{{{TileSet.Satellite}}}"&TileSet.Flyover="{{{TileSet.Flyover}}}"&TileSet.Munin="{{{TileSet.Munin}}}"&Storage="Argument"&LogLevel="{{{LogLevel}}}"';

const module = `name: ' iRingo: 🗺️ Maps iOS 27 Local v7'
description: |-
  Egern 本地脚本配置
  完整中国服务与底图 + 国际 2D/3D 卫星
compat_arguments:
  GeoManifest.Dynamic.Config.CountryCode: US
  UrlInfoSet.Dispatcher: AutoNavi
  UrlInfoSet.Directions: AutoNavi
  UrlInfoSet.RAP: Apple
  UrlInfoSet.LocationShift: AutoNavi
  TileSet.Earth: AutoNavi
  TileSet.Roads: HYBRID
  TileSet.Satellite: HYBRID
  TileSet.Flyover: XX
  TileSet.Munin: XX
  LogLevel: WARN
compat_arguments_desc: |
  GeoManifest.Dynamic.Config.CountryCode: [资源清单地区]
      ├ US: 国际清单（默认，解锁国际 3D）
      ├ CN: 中国清单
      └ AUTO: 自动

  UrlInfoSet.Dispatcher: [地点数据]
      ├ AutoNavi: 高德
      ├ Apple: Apple
      └ AUTO: 自动

  UrlInfoSet.Directions: [导航与 ETA]
      ├ AutoNavi: 高德
      ├ Apple: Apple
      └ AUTO: 自动

  UrlInfoSet.LocationShift: [中国坐标修正]
      ├ AutoNavi: 使用高德 GCJ-02 修正（默认）
      ├ Apple: 使用国际 WGS-84
      └ AUTO: 跟随清单

  TileSet.Earth: [地球图像]
      ├ Apple: 国际地球与地貌
      ├ AutoNavi: 高德版
      └ AUTO: 自动

  TileSet.Roads: [卫星道路与 Look Around]
      ├ HYBRID: 中国道路与国际道路并存（默认）
      ├ XX: 仅国际道路与 Look Around
      ├ CN: 中国道路
      └ AUTO: 自动

  TileSet.Satellite: [2D/3D 卫星图像]
      ├ HYBRID: 中国与国际卫星并存（默认）
      ├ XX: 仅国际卫星图像
      ├ CN: 中国卫星图像
      └ AUTO: 自动

  TileSet.Flyover: [3D 城市与俯瞰]
      ├ XX: 国际 Flyover 资源
      ├ CN: 中国资源
      └ HYBRID: 保留清单原值

  TileSet.Munin: [Look Around]
      ├ XX: 国际 Look Around
      ├ CN: 中国资源
      └ HYBRID: 混合

  LogLevel: [日志]
      ├ WARN: 警告
      ├ INFO: 信息
      └ DEBUG: 调试
author: patrickyanxxxxx
homepage: https://github.com/patrickyanxxxxx/Maps
icon: https://developer.apple.com/assets/elements/icons/maps/maps-128x128.png
rules:
- domain_suffix:
    match: is.autonavi.com
    policy: DIRECT
- domain:
    match: gspe11-2-cn-ssl.ls.apple.com
    policy: DIRECT
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
scriptings:
- http_request:
    name: 🗺️ Maps.defaults.request
    match: ^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults
    script_url: ${base}/request.v7.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.defaults.response
    match: ^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults
    script_url: ${base}/response.v7.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
- http_request:
    name: 🗺️ Maps.announcements.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/request.v7.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.announcements.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/response.v7.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
    binary_body: true
- http_request:
    name: 🗺️ Maps.manifest.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/request.v7.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.manifest.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/response.v7.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
    binary_body: true
mitm:
  hostnames:
    includes:
    - configuration.ls.apple.com
    - gspe35-ssl.ls.apple.com
    - gspe35-ssl.ls.apple.cn
`;

await writeFile(modulePath, module);
console.log(`Wrote ${requestPath}, ${responsePath}, ${modulePath}`);
