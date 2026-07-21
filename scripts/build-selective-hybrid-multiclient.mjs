import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.argv[2] ?? "modules";
const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const version = "6.2.1";
const surgeVersion = "6.2.2";
const request = `${base}/request.bundle.js?v=${version}`;
const response = `${base}/response.bundle.js?v=${version}`;
const route = `${base}/satellite-route.js?v=${version}`;
const homepage = "https://github.com/patrickyanxxxxx/Maps";
const icon = "https://developer.apple.com/assets/elements/icons/maps/maps-128x128.png";
const description = "自定义 Maps app\\n添加国际版功能\\n自定义服务版本\\niOS 27 中国大陆卫星 + 国际卫星与 3D";
const argument = 'GeoManifest.Dynamic.Config.CountryCode="US"&UrlInfoSet.Dispatcher="AutoNavi"&UrlInfoSet.Directions="Apple"&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift="AutoNavi"&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="EXTENDED"&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode="CN_POI"&Storage="Argument"&LogLevel="WARN"';
const surgeArguments = 'GeoManifest.Dynamic.Config.CountryCode:"US",UrlInfoSet.Dispatcher:"AutoNavi",UrlInfoSet.Directions:"Apple",UrlInfoSet.LocationShift:"AutoNavi",Hybrid.MainlandLayers:"EXTENDED",Hybrid.ServiceMode:"CN_POI",TileSet.Flyover:"XX",TileSet.Munin:"XX",TileSet.Roads:"XX",TileSet.Satellite:"XX",LogLevel:"WARN"';
const surgeArgument = 'GeoManifest.Dynamic.Config.CountryCode="{{{GeoManifest.Dynamic.Config.CountryCode}}}"&UrlInfoSet.Dispatcher="{{{UrlInfoSet.Dispatcher}}}"&UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift="{{{UrlInfoSet.LocationShift}}}"&TileSet.Earth="Apple"&TileSet.Flyover="{{{TileSet.Flyover}}}"&TileSet.Munin="{{{TileSet.Munin}}}"&TileSet.Roads="{{{TileSet.Roads}}}"&TileSet.Satellite="{{{TileSet.Satellite}}}"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="{{{Hybrid.MainlandLayers}}}"&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode="{{{Hybrid.ServiceMode}}}"&Storage="Argument"&LogLevel="{{{LogLevel}}}"';
const mapPattern = "^https?:\\/\\/(?:gspe11|gspe19(?:-kittyhawk)?|gspe79)-ssl\\.ls\\.apple\\.com\\/";
const defaultsPattern = "^https?:\\/\\/configuration\\.ls\\.apple\\.com\\/config\\/defaults";
const announcementsPattern = "^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/config\\/announcements";
const manifestPattern = "^https?:\\/\\/gspe35-ssl\\.ls\\.apple\\.(com|cn)\\/geo_manifest\\/dynamic\\/config";
const domains = [
	"gspe11-2-cn-ssl.ls.apple.com",
	"gspe12-cn-ssl.ls.apple.com",
	"gspe19-cn-ssl.ls.apple.com",
	"gspe19-2-cn-ssl.ls.apple.com",
	"gspe79-cn-ssl.ls.apple.com",
];
const mitm = [
	"configuration.ls.apple.com",
	"gspe35-ssl.ls.apple.com",
	"gspe35-ssl.ls.apple.cn",
	"gspe11-ssl.ls.apple.com",
	"gspe19-ssl.ls.apple.com",
	"gspe19-kittyhawk-ssl.ls.apple.com",
	"gspe79-ssl.ls.apple.com",
];

const argumentsDesc = `
GeoManifest.Dynamic.Config.CountryCode: [动态配置] 资源清单的国家或地区代码
    └ US: 国际清单（默认，保留国际卫星、3D、Flyover 与四处看看）
UrlInfoSet.Dispatcher: [URL信息集] 调度器
    ├ AutoNavi: 高德地点数据（默认）
    └ Apple: Apple 地点数据
UrlInfoSet.Directions: [URL信息集] 导航与ETA
    ├ Apple: Apple 导航与 ETA（默认）
    └ AutoNavi: 高德导航与 ETA
UrlInfoSet.LocationShift: [URL信息集] 定位漂移
    ├ AutoNavi: 中国大陆使用 GCJ-02 修正（默认）
    └ Apple: 使用 WGS-84
Hybrid.MainlandLayers: [瓦片数据集] 中国大陆二维图层
    ├ EXTENDED: 道路、地点、标签、交通与卫星（默认）
    └ CORE: 标准地图、建筑、POI 与地标
Hybrid.ServiceMode: [URL信息集] 中国服务范围
    ├ CN_POI: 中国地点、POI 与反向地理编码，导航保持 Apple（默认）
    ├ APPLE: 国际前台服务优先
    └ CN_FULL: 中国地点、导航与交通
TileSet.Flyover / Munin / Roads / Satellite: [瓦片数据集]
    └ XX: 保持 Apple 国际资源（默认）
LogLevel: [调试] 日志等级
    ├ WARN: 警告（默认）
    ├ INFO: 信息
    └ DEBUG: 调试`;

const ruleLines = domains.map(domain => `DOMAIN,${domain},DIRECT`).join("\n");
const qxRuleLines = domains.map(domain => `host, ${domain}, direct`).join("\n");
const stashRuleLines = domains.map(domain => `  - DOMAIN,${domain},DIRECT`).join("\n");

const surge = `#!name =  iRingo: 🗺️ Maps iOS 27 Hybrid
#!desc = ${description}
#!openUrl = http://boxjs.com/#/app/iRingo.Maps
#!author = patrickyanxxxxx; VirgilClyne
#!homepage = ${homepage}
#!icon = ${icon}
#!category =  iRingo
#!version = ${surgeVersion}
#!arguments = ${surgeArguments}
#!arguments-desc = ${argumentsDesc.replaceAll("\n", "\\n")}

[Rule]
# 🗺️ Amap
DOMAIN-SUFFIX,is.autonavi.com,DIRECT
# 🗺️ Maps
${ruleLines}

[Script]
# 🗺️ Network Defaults
🗺️ Maps.config.defaults.request = type=http-request, pattern=${defaultsPattern}, script-path=${request}, argument=${surgeArgument}
🗺️ Maps.config.defaults.response = type=http-response, pattern=${defaultsPattern}, requires-body=1, engine=webview, script-path=${response}, argument=${surgeArgument}
# 🗺️ Announcements
🗺️ Maps.config.announcements.request = type=http-request, pattern=${announcementsPattern}, script-path=${request}, argument=${surgeArgument}
🗺️ Maps.config.announcements.response = type=http-response, pattern=${announcementsPattern}, requires-body=1, binary-body-mode=1, engine=webview, script-path=${response}, argument=${surgeArgument}
# 🗺️ Resource Manifest
🗺️ Maps.geo_manifest.dynamic.config.request = type=http-request, pattern=${manifestPattern}, script-path=${request}, argument=${surgeArgument}
🗺️ Maps.geo_manifest.dynamic.config.response = type=http-response, pattern=${manifestPattern}, requires-body=1, binary-body-mode=1, engine=webview, script-path=${response}, argument=${surgeArgument}
# 🗺️ iOS 27 Satellite Route
🗺️ Maps.satellite.route.request = type=http-request, pattern=${mapPattern}, script-path=${route}

[MITM]
hostname = %APPEND% ${mitm.join(", ")}
`;

const loon = `#!name =  iRingo: 🗺️ Maps iOS 27 Hybrid
#!desc = ${description}
#!openUrl = http://boxjs.com/#/app/iRingo.Maps
#!author = patrickyanxxxxx; VirgilClyne
#!homepage = ${homepage}
#!icon = ${icon}
#!tag =  iRingo
#!system = iOS,iPadOS,macOS
#!version = ${version}
#!system_version = 15

[Argument]
GeoManifest.Dynamic.Config.CountryCode = select,"US","US",tag=[动态配置] 资源清单的国家或地区代码,desc=必须保持 US 以保留国际卫星、3D、Flyover 与四处看看。
UrlInfoSet.Dispatcher = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 调度器,desc=此选项影响公共指南、兴趣点与位置信息等地点数据。
UrlInfoSet.Directions = select,"Apple","Apple","AutoNavi",tag=[URL信息集] 导航与ETA,desc=CN_POI 默认保留 Apple 导航与 ETA，避免中国服务影响国外导航。
UrlInfoSet.LocationShift = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 定位漂移,desc=AutoNavi 在中国大陆使用 GCJ-02 坐标修正。
Hybrid.MainlandLayers = select,"EXTENDED","EXTENDED","CORE",tag=[瓦片数据集] 中国大陆二维图层,desc=EXTENDED 包含道路、地点、标签、交通与卫星；CORE 用于诊断。
Hybrid.ServiceMode = select,"CN_POI","CN_POI","APPLE","CN_FULL",tag=[URL信息集] 中国服务范围,desc=CN_POI 恢复中国地点、POI 与反向地理编码并保持 Apple 导航；CN_FULL 还会切换导航与交通。
LogLevel = select,"WARN","WARN","INFO","DEBUG",tag=[调试] 日志等级,desc=选择脚本日志的输出等级。

[Rule]
# 🗺️ Amap
DOMAIN-SUFFIX,is.autonavi.com,DIRECT
# 🗺️ Maps
${ruleLines}

[Script]
# 🗺️ Network Defaults
http-request ${defaultsPattern} script-path=${request}, tag=🗺️ Maps.config.defaults.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
http-response ${defaultsPattern} script-path=${response}, requires-body=1, tag=🗺️ Maps.config.defaults.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
# 🗺️ Announcements
http-request ${announcementsPattern} script-path=${request}, tag=🗺️ Maps.config.announcements.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
http-response ${announcementsPattern} script-path=${response}, requires-body=1, binary-body-mode=1, tag=🗺️ Maps.config.announcements.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
# 🗺️ Resource Manifest
http-request ${manifestPattern} script-path=${request}, tag=🗺️ Maps.geo_manifest.dynamic.config.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
http-response ${manifestPattern} script-path=${response}, requires-body=1, binary-body-mode=1, tag=🗺️ Maps.geo_manifest.dynamic.config.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage="Argument"&LogLevel=[{LogLevel}]
# 🗺️ iOS 27 Satellite Route
http-request ${mapPattern} script-path=${route}, tag=🗺️ Maps.satellite.route.request

[MITM]
hostname = ${mitm.join(", ")}
`;

const shadowrocket = `#!name =  iRingo: 🗺️ Maps iOS 27 Hybrid
#!desc = ${description}
#!openUrl = http://boxjs.com/#/app/iRingo.Maps
#!author = patrickyanxxxxx; VirgilClyne
#!homepage = ${homepage}
#!icon = ${icon}
#!category =  iRingo
#!version = ${version}

[Rule]
# 🗺️ Amap
DOMAIN-SUFFIX,is.autonavi.com,DIRECT
# 🗺️ Maps
${ruleLines}

[Script]
# 🗺️ Network Defaults
🗺️ Maps.config.defaults.request = type=http-request, pattern=${defaultsPattern}, script-path=${request}, argument=${argument}
🗺️ Maps.config.defaults.response = type=http-response, pattern=${defaultsPattern}, requires-body=1, script-path=${response}, argument=${argument}
# 🗺️ Announcements
🗺️ Maps.config.announcements.request = type=http-request, pattern=${announcementsPattern}, script-path=${request}, argument=${argument}
🗺️ Maps.config.announcements.response = type=http-response, pattern=${announcementsPattern}, requires-body=1, binary-body-mode=1, script-path=${response}, argument=${argument}
# 🗺️ Resource Manifest
🗺️ Maps.geo_manifest.dynamic.config.request = type=http-request, pattern=${manifestPattern}, script-path=${request}, argument=${argument}
🗺️ Maps.geo_manifest.dynamic.config.response = type=http-response, pattern=${manifestPattern}, requires-body=1, binary-body-mode=1, script-path=${response}, argument=${argument}
# 🗺️ iOS 27 Satellite Route
🗺️ Maps.satellite.route.request = type=http-request, pattern=${mapPattern}, script-path=${route}

[MITM]
hostname = %APPEND% ${mitm.join(", ")}
`;

const quantumultx = `#!name =  iRingo: 🗺️ Maps iOS 27 Hybrid
#!desc = ${description}
#!openUrl = http://boxjs.com/#/app/iRingo.Maps
#!author = patrickyanxxxxx; VirgilClyne
#!homepage = ${homepage}
#!icon = ${icon}
#!category =  iRingo
#!version = ${version}

#[filter_local]
# 🗺️ Amap
host-suffix, is.autonavi.com, direct
# 🗺️ Maps
${qxRuleLines}

#[rewrite_local]
# 🗺️ Network Defaults
${defaultsPattern} url script-request-header ${request}
${defaultsPattern} url script-response-body ${response}
# 🗺️ Announcements
${announcementsPattern} url script-request-header ${request}
${announcementsPattern} url script-response-body ${response}
# 🗺️ Resource Manifest
${manifestPattern} url script-request-header ${request}
${manifestPattern} url script-response-body ${response}
# 🗺️ iOS 27 Satellite Route
${mapPattern} url script-request-header ${route}

#[mitm]
hostname = ${mitm.join(", ")}
`;

const stash = `name: " iRingo: 🗺️ Maps iOS 27 Hybrid"
desc: |-
  自定义 Maps app
  添加国际版功能
  自定义服务版本
  iOS 27 中国大陆卫星 + 国际卫星与 3D
author: |-
  patrickyanxxxxx
  VirgilClyne
homepage: "${homepage}"
icon: "${icon}"
category: " iRingo"
version: "${version}"

rules:
  # 🗺️ Amap
  - DOMAIN-SUFFIX,is.autonavi.com,DIRECT
  # 🗺️ Maps
${stashRuleLines}

http:
  mitm:
${mitm.map(host => `    - "${host}"`).join("\n")}
  script:
    - match: ${defaultsPattern}
      name: iRingo.Maps.v6.request
      type: request
      argument: '${argument}'
    - match: ${defaultsPattern}
      name: iRingo.Maps.v6.response
      type: response
      require-body: true
      argument: '${argument}'
    - match: ${announcementsPattern}
      name: iRingo.Maps.v6.request
      type: request
      argument: '${argument}'
    - match: ${announcementsPattern}
      name: iRingo.Maps.v6.response
      type: response
      require-body: true
      binary-mode: true
      argument: '${argument}'
    - match: ${manifestPattern}
      name: iRingo.Maps.v6.request
      type: request
      argument: '${argument}'
    - match: ${manifestPattern}
      name: iRingo.Maps.v6.response
      type: response
      require-body: true
      binary-mode: true
      argument: '${argument}'
    - match: ${mapPattern}
      name: iRingo.Maps.v6.route
      type: request

script-providers:
  iRingo.Maps.v6.request:
    url: ${request}
    interval: 86400
  iRingo.Maps.v6.response:
    url: ${response}
    interval: 86400
  iRingo.Maps.v6.route:
    url: ${route}
    interval: 86400
`;

await mkdir(root, { recursive: true });
await mkdir(`${root}/assets`, { recursive: true });

const firstExisting = async paths => {
	for (const path of paths) {
		try {
			await access(path);
			return path;
		} catch {}
	}
	throw new Error(`Missing build source: ${paths.join(", ")}`);
};
const requestSource = await firstExisting([
	`${root}/archive/assets/request.selective-hybrid-mainland-3d.v6.bundle.js`,
	`${root}/assets/request.selective-hybrid-mainland-3d.v6.bundle.js`,
]);
const responseSource = await firstExisting([
	`${root}/archive/assets/response.selective-hybrid-mainland-3d.v6.bundle.js`,
	`${root}/assets/response.selective-hybrid-mainland-3d.v6.bundle.js`,
]);
const routeSource = await firstExisting([
	`${root}/archive/assets/request.selective-hybrid-mainland-3d-route.v6.js`,
	`${root}/assets/request.selective-hybrid-mainland-3d-route.v6.js`,
]);
const egernSource = await firstExisting([
	`${root}/archive/legacy/iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml`,
	`${root}/iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml`,
]);
const embeddedArgument = `globalThis.$argument=globalThis.$argument??${JSON.stringify(argument)};`;
await Promise.all([
	writeFile(`${root}/assets/request.bundle.js`, embeddedArgument + await readFile(requestSource, "utf8")),
	writeFile(`${root}/assets/response.bundle.js`, embeddedArgument + await readFile(responseSource, "utf8")),
	writeFile(`${root}/assets/satellite-route.js`, await readFile(routeSource, "utf8")),
]);

await Promise.all([
	writeFile(`${root}/iRingo.Maps.sgmodule`, surge),
	writeFile(`${root}/iRingo.Maps.plugin`, loon),
	writeFile(`${root}/iRingo.Maps.srmodule`, shadowrocket),
	writeFile(`${root}/iRingo.Maps.snippet`, quantumultx),
	writeFile(`${root}/iRingo.Maps.stoverride`, stash),
]);

// Keep the tested Egern module under the upstream-style stable name while the
// versioned copy is archived by the release organizer.
const egern = await readFile(egernSource, "utf8");
const archiveBase = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/archive/assets";
await writeFile(`${root}/iRingo.Maps.yaml`, egern
	.replace("Maps iOS 27 Selective Hybrid + Mainland 3D Route Local v6", "🗺️ Maps iOS 27 Hybrid")
	.replace(/description: \|-\n(?:  .*\n)+?compat_arguments:/, `description: |-
  自定义 Maps app
  添加国际版功能
  自定义服务版本
  iOS 27 中国大陆卫星 + 国际卫星与 3D
compat_arguments:`)
	.replace("author: patrickyanxxxxx; VirgilClyne; Codex", "author: patrickyanxxxxx; VirgilClyne")
	.replace("UrlInfoSet.Directions: AutoNavi", "UrlInfoSet.Directions: Apple")
	.replace("Hybrid.ServiceMode: APPLE", "Hybrid.ServiceMode: CN_POI")
	.replace("├ APPLE: Apple 前台服务，仅保留大陆反向地理编码及可选坐标修正（默认，国外完全国际化）", "├ CN_POI: 高德地点、POI 与反向地理编码，导航保留 Apple（默认）")
	.replace("├ CN_POI: 高德地点与反向地理编码，导航保留 Apple", "├ APPLE: Apple 前台服务，国外完全国际化")
	.replaceAll(`${archiveBase}/request.selective-hybrid-mainland-3d.v6.bundle.js`, request)
	.replaceAll(`${archiveBase}/response.selective-hybrid-mainland-3d.v6.bundle.js`, response)
	.replaceAll(`${archiveBase}/request.selective-hybrid-mainland-3d-route.v6.js`, route)
);

console.log("Wrote stable multi-client modules to", root);
