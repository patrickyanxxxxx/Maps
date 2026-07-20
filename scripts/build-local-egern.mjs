import { copyFile, readFile, writeFile } from "node:fs/promises";

const releaseDirectory = process.argv[2];
if (!releaseDirectory) throw new Error("Usage: node build-local-egern.mjs <release-dir>");

const requestPath = "modules/assets/request.v2.bundle.js";
const responsePath = "modules/assets/response.v2.bundle.js";
const modulePath = "modules/iRingo.Maps.iOS27.Local.yaml";

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

const satellite3D = 'case"SPUTNIK_METADATA":case"SPUTNIK_C3M":case"SPUTNIK_DSM":case"SPUTNIK_DSM_GLOBAL":case"SPUTNIK_VECTOR_BORDER":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
const switchMarker = 'switch(e.style){case"RASTER_SATELLITE"';
if (!response.includes(switchMarker)) throw new Error("Satellite patch marker not found");
response = response.replace(switchMarker, `switch(e.style){${satellite3D}case"RASTER_SATELLITE"`);

const sprOriginal = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":M.info(`SPR style: ${e?.style}`),M.info(`SPR baseURL: ${e?.baseURL}`),M.debug(`SPR tile: ${JSON.stringify(e,null,2)}`);break;';
const sprInternational = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
if (!response.includes(sprOriginal)) throw new Error("SPR patch marker not found");
response = response.replace(sprOriginal, sprInternational);

await writeFile(requestPath, request);
await writeFile(responsePath, response);

const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const args = 'GeoManifest.Dynamic.Config.CountryCode="{{{GeoManifest.Dynamic.Config.CountryCode}}}"&UrlInfoSet.Dispatcher="{{{UrlInfoSet.Dispatcher}}}"&UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"&UrlInfoSet.RAP="{{{UrlInfoSet.RAP}}}"&UrlInfoSet.LocationShift="{{{UrlInfoSet.LocationShift}}}"&TileSet.Earth="{{{TileSet.Earth}}}"&TileSet.Roads="{{{TileSet.Roads}}}"&TileSet.Satellite="{{{TileSet.Satellite}}}"&TileSet.Flyover="{{{TileSet.Flyover}}}"&TileSet.Munin="{{{TileSet.Munin}}}"&Storage="Argument"&LogLevel="{{{LogLevel}}}"';

const module = `name: ' iRingo: 🗺️ Maps iOS 27 Local'
description: |-
  Egern 本地脚本配置
  高德中国服务 + 国际卫星、地球与 Look Around
compat_arguments:
  GeoManifest.Dynamic.Config.CountryCode: CN
  UrlInfoSet.Dispatcher: AutoNavi
  UrlInfoSet.Directions: AutoNavi
  UrlInfoSet.RAP: Apple
  UrlInfoSet.LocationShift: AUTO
  TileSet.Earth: Apple
  TileSet.Roads: XX
  TileSet.Satellite: XX
  TileSet.Flyover: XX
  TileSet.Munin: XX
  LogLevel: WARN
compat_arguments_desc: |
  GeoManifest.Dynamic.Config.CountryCode: [资源清单地区]
      ├ CN: 中国清单（默认，保留高德服务并混合国际瓦片）
      ├ US: 国际清单
      └ AUTO: 自动

  UrlInfoSet.Dispatcher: [地点数据]
      ├ AutoNavi: 高德
      ├ Apple: Apple
      └ AUTO: 自动

  UrlInfoSet.Directions: [导航与 ETA]
      ├ AutoNavi: 高德
      ├ Apple: Apple
      └ AUTO: 自动

  TileSet.Earth: [地球图像]
      ├ Apple: 国际地球与地貌
      ├ AutoNavi: 高德版
      └ AUTO: 自动

  TileSet.Roads: [卫星道路与 Look Around]
      ├ XX: 国际道路与 Look Around
      ├ CN: 中国道路
      └ AUTO: 自动

  TileSet.Satellite: [2D/3D 卫星图像]
      ├ XX: 国际卫星图像
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
    script_url: ${base}/request.v2.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.defaults.response
    match: ^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults
    script_url: ${base}/response.v2.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
- http_request:
    name: 🗺️ Maps.announcements.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/request.v2.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.announcements.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements
    script_url: ${base}/response.v2.bundle.js
    env:
      _compat.$argument: ${args}
    body_required: true
    binary_body: true
- http_request:
    name: 🗺️ Maps.manifest.request
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/request.v2.bundle.js
    env:
      _compat.$argument: ${args}
- http_response:
    name: 🗺️ Maps.manifest.response
    match: ^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config
    script_url: ${base}/response.v2.bundle.js
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
