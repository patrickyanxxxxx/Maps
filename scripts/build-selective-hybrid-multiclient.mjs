import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.argv[2] ?? "modules";
const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const version = "6.4.0";
const surgeVersion = version;
const request = `${base}/request.bundle.js?v=${version}`;
const response = `${base}/response.bundle.js?v=${version}`;
const route = `${base}/satellite-route.js?v=${version}`;
const homepage = "https://github.com/patrickyanxxxxx/Maps";
const icon = "https://developer.apple.com/assets/elements/icons/maps/maps-128x128.png";
const description = "自定义 Maps app\\n添加国际版功能\\n自定义服务版本\\niOS 27 中国大陆卫星 + 国际卫星与 3D";
const argument = 'GeoManifest.Dynamic.Config.CountryCode="US"&UrlInfoSet.Dispatcher="AutoNavi"&UrlInfoSet.Directions="AutoNavi"&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift="AutoNavi"&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="EXTENDED"&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode="CN_POI"&Storage="Argument"&LogLevel="WARN"';
const surgeArguments = 'GeoManifest.Dynamic.Config.CountryCode:"US",UrlInfoSet.Dispatcher:"AutoNavi",UrlInfoSet.Directions:"AutoNavi",UrlInfoSet.RAP:"Apple",UrlInfoSet.LocationShift:"AutoNavi",TileSet.Earth:"Apple",TileSet.Flyover:"XX",TileSet.Munin:"XX",TileSet.Roads:"XX",TileSet.Satellite:"XX",Hybrid.MainlandLayers:"EXTENDED",Hybrid.ServiceMode:"CN_POI",Storage:"Argument",LogLevel:"WARN"';
const surgeArgument = 'GeoManifest.Dynamic.Config.CountryCode="{{{GeoManifest.Dynamic.Config.CountryCode}}}"&UrlInfoSet.Dispatcher="{{{UrlInfoSet.Dispatcher}}}"&UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"&UrlInfoSet.RAP="{{{UrlInfoSet.RAP}}}"&UrlInfoSet.LocationShift="{{{UrlInfoSet.LocationShift}}}"&TileSet.Earth="{{{TileSet.Earth}}}"&TileSet.Flyover="{{{TileSet.Flyover}}}"&TileSet.Munin="{{{TileSet.Munin}}}"&TileSet.Roads="{{{TileSet.Roads}}}"&TileSet.Satellite="{{{TileSet.Satellite}}}"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="{{{Hybrid.MainlandLayers}}}"&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode="{{{Hybrid.ServiceMode}}}"&Storage="{{{Storage}}}"&LogLevel="{{{LogLevel}}}"';
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
    └ US: 国际清单（默认）；保留国际卫星、3D、Flyover 与四处看看能力
UrlInfoSet.Dispatcher: [URL信息集] 调度器
    ├ AutoNavi: 高德地点、搜索与 POI（默认）；国外仍使用混合清单中的国际数据
    └ Apple: Apple 国际地点服务；国内地点信息可能减少
UrlInfoSet.Directions: [URL信息集] 导航与ETA
    ├ AutoNavi: 中国大陆高德导航，国外 TomTom（默认）
    └ Apple: Apple/TomTom 导航与 ETA；中国大陆可能不可用
UrlInfoSet.RAP: [URL信息集] 评分和照片
    └ Apple: Apple 国际评分、照片与反馈服务（默认）
UrlInfoSet.LocationShift: [URL信息集] 定位漂移
    ├ AutoNavi: 中国大陆使用 GCJ-02 坐标修正（默认）
    └ Apple: 使用 WGS-84；中国道路与地点可能产生偏移
TileSet.Earth: [瓦片数据集] 地球图像
    └ Apple: 使用国际地球、城市与地貌资源（默认）
TileSet.Flyover: [瓦片数据集] 3D 城市
    └ XX: 使用 Apple 国际 Flyover / 3D 城市资源（默认）
TileSet.Munin: [瓦片数据集] 四处看看
    └ XX: 使用 Apple 国际 Munin / Look Around 资源（默认）
TileSet.Roads: [瓦片数据集] 卫星道路
    └ XX: 保留国际道路能力；大陆道路由混合图层补充（默认）
TileSet.Satellite: [瓦片数据集] 卫星图像
    └ XX: 保留国际卫星 selector；大陆坐标由路由脚本转到 CN 卫星（默认）
Hybrid.MainlandLayers: [瓦片数据集] 中国大陆二维图层
    ├ EXTENDED: 完整道路、地点、标签、交通与 2D 卫星（默认）
    └ CORE: 标准地图、建筑、POI 与地标
Hybrid.ServiceMode: [URL信息集] 中国服务范围
    ├ CN_POI: 中国地点、POI 与反向地理编码；导航遵循 Directions（默认）
    ├ APPLE: 国际前台服务优先
    └ CN_FULL: 中国地点、导航与交通
Storage: [储存] 配置来源
    └ Argument: 优先使用模块参数，缺失项再读取持久化配置（默认）
LogLevel: [调试] 日志等级
    ├ WARN: 警告（默认）
    ├ INFO: 信息
    └ DEBUG: 调试
固定内部参数:
    ├ Hybrid.Enabled=true: 启用混合清单
    └ Hybrid.Mainland3D=ROUTE: 大陆卫星按坐标路由到 CN，国外保持国际资源`;

const fixedParameterNotes = `# 参数与默认值（本格式无交互参数面板；修改下方 argument 或脚本内置参数后生效）
# GeoManifest.Dynamic.Config.CountryCode=US：国际清单主体，保留国际卫星、3D、Flyover 与四处看看
# UrlInfoSet.Dispatcher=AutoNavi：国内地点、搜索与 POI 使用高德
# UrlInfoSet.Directions=AutoNavi：中国大陆使用高德导航，国外仍使用 TomTom（默认）；Apple 在大陆可能不可用
# UrlInfoSet.RAP=Apple：国际评分、照片与反馈
# UrlInfoSet.LocationShift=AutoNavi：中国大陆使用 GCJ-02 坐标修正
# TileSet.Earth=Apple：国际地球、城市与地貌资源
# TileSet.Flyover=XX：国际 Flyover 与 3D 城市；CN 可能减少国外 3D
# TileSet.Munin=XX：国际 Munin/四处看看；CN 会失去国外四处看看
# TileSet.Roads=XX：国际道路与四处看看道路能力，大陆道路由混合图层补充
# TileSet.Satellite=XX：国际卫星 selector，大陆坐标自动路由到 CN 卫星
# Hybrid.MainlandLayers=EXTENDED：完整大陆二维道路、标签、交通、POI 与 2D 卫星
# Hybrid.ServiceMode=CN_POI：国内地点/POI/反向地理编码使用 CN，导航遵循 Directions（默认）
# Storage=Argument：优先模块参数，缺失项再读取持久化配置
# LogLevel=WARN：仅输出警告与错误；INFO/DEBUG 仅用于排错
# Hybrid.Enabled=true：固定启用混合清单
# Hybrid.Mainland3D=ROUTE：固定按坐标路由大陆卫星，国外保持国际资源`;

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
GeoManifest.Dynamic.Config.CountryCode = select,"US","US",tag=[动态配置] 资源清单地区,desc=默认 US。以国际清单为主体，保留国际卫星、3D、Flyover 与四处看看。
UrlInfoSet.Dispatcher = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 地点与POI,desc=默认 AutoNavi。国内地点、搜索和 POI 使用高德；Apple 会减少国内地点数据。
UrlInfoSet.Directions = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 导航与ETA,desc=默认 AutoNavi。中国大陆使用高德导航，国外仍使用 TomTom；Apple 在中国大陆可能不可用。
UrlInfoSet.RAP = select,"Apple","Apple","AutoNavi",tag=[URL信息集] 评分和照片,desc=默认 Apple。保留国际评分、照片和反馈服务；AutoNavi 相关能力未完全开放。
UrlInfoSet.LocationShift = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 坐标修正,desc=默认 AutoNavi。中国大陆使用 GCJ-02；Apple 使用 WGS-84，可能出现大陆道路和地点偏移。
TileSet.Earth = select,"Apple","Apple","AutoNavi",tag=[瓦片数据集] 地球图像,desc=默认 Apple。保留国际地球、城市和地貌资源。
TileSet.Flyover = select,"XX","XX","CN",tag=[瓦片数据集] 3D城市,desc=默认 XX。使用国际 Flyover 和 3D 城市资源；不建议改为 CN。
TileSet.Munin = select,"XX","XX","CN",tag=[瓦片数据集] 四处看看,desc=默认 XX。使用国际 Munin/Look Around 资源；CN 会失去国外四处看看。
TileSet.Roads = select,"XX","XX","CN",tag=[瓦片数据集] 卫星道路,desc=默认 XX。保留国际道路和四处看看能力，大陆道路由混合图层补充。
TileSet.Satellite = select,"XX","XX","CN",tag=[瓦片数据集] 卫星图像,desc=默认 XX。保留国际卫星 selector，大陆坐标自动路由至 CN 卫星。
Hybrid.MainlandLayers = select,"EXTENDED","EXTENDED","CORE",tag=[瓦片数据集] 大陆二维图层,desc=默认 EXTENDED。包含道路、地点、标签、交通与 2D 卫星；CORE 仅用于诊断。
Hybrid.ServiceMode = select,"CN_POI","CN_POI","APPLE","CN_FULL",tag=[URL信息集] 中国服务范围,desc=默认 CN_POI。恢复国内地点、POI 与反向地理编码，导航遵循 Directions；CN_FULL 还使用 CN 交通服务。
Storage = select,"Argument","Argument","PersistentStore","database",tag=[储存] 配置来源,desc=默认 Argument。优先读取插件参数，缺失项再读取持久化配置。
LogLevel = select,"WARN","WARN","INFO","DEBUG",tag=[调试] 日志等级,desc=默认 WARN。需要排错时临时选择 INFO 或 DEBUG。

# 固定内部参数（无需在参数面板修改）
# Hybrid.Enabled=true：启用国际主体 + 中国大陆图层的混合清单
# Hybrid.Mainland3D=ROUTE：大陆卫星按坐标路由到 CN，国外保持国际资源

[Rule]
# 🗺️ Amap
DOMAIN-SUFFIX,is.autonavi.com,DIRECT
# 🗺️ Maps
${ruleLines}

[Script]
# 🗺️ Network Defaults
http-request ${defaultsPattern} script-path=${request}, tag=🗺️ Maps.config.defaults.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
http-response ${defaultsPattern} script-path=${response}, requires-body=1, tag=🗺️ Maps.config.defaults.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
# 🗺️ Announcements
http-request ${announcementsPattern} script-path=${request}, tag=🗺️ Maps.config.announcements.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
http-response ${announcementsPattern} script-path=${response}, requires-body=1, binary-body-mode=1, tag=🗺️ Maps.config.announcements.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
# 🗺️ Resource Manifest
http-request ${manifestPattern} script-path=${request}, tag=🗺️ Maps.geo_manifest.dynamic.config.request, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
http-response ${manifestPattern} script-path=${response}, requires-body=1, binary-body-mode=1, tag=🗺️ Maps.geo_manifest.dynamic.config.response, argument=GeoManifest.Dynamic.Config.CountryCode=[{GeoManifest.Dynamic.Config.CountryCode}]&UrlInfoSet.Dispatcher=[{UrlInfoSet.Dispatcher}]&UrlInfoSet.Directions=[{UrlInfoSet.Directions}]&UrlInfoSet.RAP=[{UrlInfoSet.RAP}]&UrlInfoSet.LocationShift=[{UrlInfoSet.LocationShift}]&TileSet.Earth=[{TileSet.Earth}]&TileSet.Flyover=[{TileSet.Flyover}]&TileSet.Munin=[{TileSet.Munin}]&TileSet.Roads=[{TileSet.Roads}]&TileSet.Satellite=[{TileSet.Satellite}]&Hybrid.Enabled="true"&Hybrid.MainlandLayers=[{Hybrid.MainlandLayers}]&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode=[{Hybrid.ServiceMode}]&Storage=[{Storage}]&LogLevel=[{LogLevel}]
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

${fixedParameterNotes}

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

# 参数与默认值（Quantumult X snippet 无交互参数面板；默认值内置于 request/response bundle）
# GeoManifest.Dynamic.Config.CountryCode=US：国际清单主体，保留国际卫星、3D、Flyover 与四处看看；不建议改为 CN
# UrlInfoSet.Dispatcher=AutoNavi：国内地点、搜索与 POI 使用高德；Apple 会减少国内地点数据
# UrlInfoSet.Directions=AutoNavi：中国大陆高德导航、国外 TomTom；Apple 在大陆可能不可用
# UrlInfoSet.RAP=Apple：国际评分、照片与反馈；AutoNavi 相关能力未完全开放
# UrlInfoSet.LocationShift=AutoNavi：中国大陆使用 GCJ-02；Apple/WGS-84 可能造成道路与地点偏移
# TileSet.Earth=Apple：国际地球、城市与地貌资源
# TileSet.Flyover=XX：国际 Flyover 与 3D 城市；CN 可能减少国外 3D
# TileSet.Munin=XX：国际 Munin/四处看看；CN 会失去国外四处看看
# TileSet.Roads=XX：国际道路与四处看看道路能力，大陆道路由混合图层补充
# TileSet.Satellite=XX：国际卫星 selector，大陆坐标自动路由到 CN 卫星
# Hybrid.MainlandLayers=EXTENDED：完整大陆道路、地点、标签、交通与 2D 卫星；CORE 仅用于诊断
# Hybrid.ServiceMode=CN_POI：国内地点/POI/反向地理编码使用 CN，导航遵循 Directions
# Storage=Argument：优先模块内置参数，缺失项再读取持久化配置
# LogLevel=WARN：仅输出警告与错误；INFO/DEBUG 仅用于排错
# Hybrid.Enabled=true：固定启用混合清单
# Hybrid.Mainland3D=ROUTE：固定按坐标路由大陆卫星，国外保持国际资源；修改 bundle 内置 argument 后生效

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

# 参数与默认值（Stash override 无交互参数面板；可直接修改下方各 script 的 argument）
# GeoManifest.Dynamic.Config.CountryCode=US：国际清单主体，保留国际卫星、3D、Flyover 与四处看看；不建议改为 CN
# UrlInfoSet.Dispatcher=AutoNavi：国内地点、搜索与 POI 使用高德；Apple 会减少国内地点数据
# UrlInfoSet.Directions=AutoNavi：中国大陆高德导航、国外 TomTom；Apple 在大陆可能不可用
# UrlInfoSet.RAP=Apple：国际评分、照片与反馈；AutoNavi 相关能力未完全开放
# UrlInfoSet.LocationShift=AutoNavi：中国大陆使用 GCJ-02；Apple/WGS-84 可能造成道路与地点偏移
# TileSet.Earth=Apple：国际地球、城市与地貌资源
# TileSet.Flyover=XX：国际 Flyover 与 3D 城市；CN 可能减少国外 3D
# TileSet.Munin=XX：国际 Munin/四处看看；CN 会失去国外四处看看
# TileSet.Roads=XX：国际道路与四处看看道路能力，大陆道路由混合图层补充
# TileSet.Satellite=XX：国际卫星 selector，大陆坐标自动路由到 CN 卫星
# Hybrid.MainlandLayers=EXTENDED：完整大陆道路、地点、标签、交通与 2D 卫星；CORE 仅用于诊断
# Hybrid.ServiceMode=CN_POI：国内地点/POI/反向地理编码使用 CN，导航遵循 Directions
# Storage=Argument：优先模块参数，缺失项再读取持久化配置
# LogLevel=WARN：仅输出警告与错误；INFO/DEBUG 仅用于排错
# Hybrid.Enabled=true：固定启用混合清单
# Hybrid.Mainland3D=ROUTE：固定按坐标路由大陆卫星，国外保持国际资源

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
const embeddedArgument = `globalThis.$argument=globalThis.$argument??${JSON.stringify(argument)};`;
const patchLoonManifestDownload = source => {
	const original = 'class ti{static async download(e=$request,t="CN"){F.log("☑️ Download");let i={...e};i.url=new URL(i.url),i.url.searchParams.set("country_code","XX"===t?"US":t),i.url=i.url.toString(),i["binary-mode"]=!0;let a=await Y(i),n=a.bodyBytes?new Uint8Array(a.bodyBytes):a.body??new Uint8Array;';
	const replacement = 'class ti{static async download(e=$request,t="CN"){F.log("☑️ Download");let i=new URL(e.url);i.searchParams.set("country_code","XX"===t?"US":t);let a;if("$loon"in globalThis){let t=e.headers??{};a={url:i.toString(),method:"GET",headers:{Accept:"application/octet-stream","Accept-Language":t["Accept-Language"]??t["accept-language"]??"en-US","User-Agent":t["User-Agent"]??t["user-agent"]??"geod/1"},timeout:e.timeout??10,"binary-mode":!0}}else a={...e,url:i.toString(),"binary-mode":!0};let n=await Y(a),r=n.bodyBytes?new Uint8Array(n.bodyBytes):n.body??new Uint8Array;';
	if (!source.includes(original)) throw new Error("Stable request bundle no longer matches the Loon GeoManifest patch target");
	return source.replace(original, replacement).replace('return F.log("✅ Download"),{status:a.status??a.statusCode??0,eTag:a.headers?.Etag??a.headers?.etag,body:n}}static async getCache', 'return F.log("✅ Download"),{status:n.status??n.statusCode??0,eTag:n.headers?.Etag??n.headers?.etag,body:r}}static async getCache');
};
const patchMultiClientServices = source => {
	const navigationBefore = 'if (mode === "CN_FULL" || (X === "Egern" && settings?.UrlInfoSet?.Directions === "AutoNavi")) {';
	const navigationAfter = 'if (mode === "CN_FULL" || settings?.UrlInfoSet?.Directions === "AutoNavi") {';
	const lookAroundBefore = '// Keep Look Around on Apple\'s international Munin/resource endpoints even\n\t\t// while Egern uses AutoNavi for mainland places and navigation.\n\t\tif (X === "Egern") {\n\t\t\tcopyKeys(hybridUrlInfo, internationalUrlInfo, [\n\t\t\t\t"muninBaseURL",\n\t\t\t\t"alternateResourcesURL",\n\t\t\t]);\n\t\t}';
	const lookAroundAfter = '// Keep Look Around on Apple\'s international Munin/resource endpoints while\n\t\t// AutoNavi provides mainland places and navigation on every client.\n\t\tcopyKeys(hybridUrlInfo, internationalUrlInfo, [\n\t\t\t"muninBaseURL",\n\t\t\t"alternateResourcesURL",\n\t\t]);';
	if (!source.includes(navigationBefore)) throw new Error("Stable response bundle no longer matches the navigation patch target");
	if (!source.includes(lookAroundBefore)) throw new Error("Stable response bundle no longer matches the Look Around patch target");
	return source.replace(navigationBefore, navigationAfter).replace(lookAroundBefore, lookAroundAfter);
};
await Promise.all([
	writeFile(`${root}/assets/request.bundle.js`, embeddedArgument + patchLoonManifestDownload(await readFile(requestSource, "utf8"))),
	writeFile(`${root}/assets/response.bundle.js`, embeddedArgument + patchMultiClientServices(await readFile(responseSource, "utf8"))),
	writeFile(`${root}/assets/satellite-route.js`, await readFile(routeSource, "utf8")),
]);

await Promise.all([
	writeFile(`${root}/iRingo.Maps.sgmodule`, surge),
	writeFile(`${root}/iRingo.Maps.plugin`, loon),
	writeFile(`${root}/iRingo.Maps.srmodule`, shadowrocket),
	writeFile(`${root}/iRingo.Maps.snippet`, quantumultx),
	writeFile(`${root}/iRingo.Maps.stoverride`, stash),
]);

console.log("Wrote stable non-Egern client modules to", root);
