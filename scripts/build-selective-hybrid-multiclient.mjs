import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.argv[2] ?? "modules";
const base = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/assets";
const version = "6.3.0";
const surgeVersion = version;
const request = `${base}/request.bundle.js?v=${version}`;
const response = `${base}/response.bundle.js?v=${version}`;
const route = `${base}/satellite-route.js?v=${version}`;
const egernRequest = `${base}/request.bundle.js?v=${version}`;
const egernResponse = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/41741c3/modules/assets/response.bundle.js";
const homepage = "https://github.com/patrickyanxxxxx/Maps";
const icon = "https://developer.apple.com/assets/elements/icons/maps/maps-128x128.png";
const description = "自定义 Maps app\\n添加国际版功能\\n自定义服务版本\\niOS 27 中国大陆卫星 + 国际卫星与 3D";
const argument = 'GeoManifest.Dynamic.Config.CountryCode="US"&UrlInfoSet.Dispatcher="AutoNavi"&UrlInfoSet.Directions="Apple"&UrlInfoSet.RAP="Apple"&UrlInfoSet.LocationShift="AutoNavi"&TileSet.Earth="Apple"&TileSet.Flyover="XX"&TileSet.Munin="XX"&TileSet.Roads="XX"&TileSet.Satellite="XX"&Hybrid.Enabled="true"&Hybrid.MainlandLayers="EXTENDED"&Hybrid.Mainland3D="ROUTE"&Hybrid.ServiceMode="CN_POI"&Storage="Argument"&LogLevel="WARN"';
const surgeArguments = 'GeoManifest.Dynamic.Config.CountryCode:"US",UrlInfoSet.Dispatcher:"AutoNavi",UrlInfoSet.Directions:"Apple",UrlInfoSet.RAP:"Apple",UrlInfoSet.LocationShift:"AutoNavi",TileSet.Earth:"Apple",TileSet.Flyover:"XX",TileSet.Munin:"XX",TileSet.Roads:"XX",TileSet.Satellite:"XX",Hybrid.MainlandLayers:"EXTENDED",Hybrid.ServiceMode:"CN_POI",Storage:"Argument",LogLevel:"WARN"';
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
    ├ Apple: Apple/TomTom 导航与 ETA（默认）；中国大陆可能不可用
    └ AutoNavi: 中国大陆高德导航，国外 TomTom
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
    ├ CN_POI: 中国地点、POI 与反向地理编码，导航保持 Apple（默认）
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
# UrlInfoSet.Directions=Apple：默认 Apple/TomTom 导航；中国大陆若需高德导航改为 AutoNavi
# UrlInfoSet.RAP=Apple：国际评分、照片与反馈
# UrlInfoSet.LocationShift=AutoNavi：中国大陆使用 GCJ-02 坐标修正
# TileSet.Earth=Apple：国际地球与地貌；TileSet.Flyover=XX：国际 3D 城市
# TileSet.Munin=XX：国际四处看看；TileSet.Roads=XX：国际道路能力
# TileSet.Satellite=XX：国际卫星 selector，大陆坐标自动路由到 CN 卫星
# Hybrid.MainlandLayers=EXTENDED：完整大陆二维道路、标签、交通、POI 与 2D 卫星
# Hybrid.ServiceMode=CN_POI：国内地点/POI/反向地理编码使用 CN，导航遵循 Directions
# Storage=Argument：优先模块参数；LogLevel=WARN：仅输出警告与错误
# 固定：Hybrid.Enabled=true，Hybrid.Mainland3D=ROUTE`;

const egernArgumentsDesc = `compat_arguments_desc: |
  下列值均为模块当前默认值。建议先保持默认设置；CountryCode=US 是保留国际 3D、Flyover 与四处看看的关键。

  GeoManifest.Dynamic.Config.CountryCode: [动态配置] 资源清单地区
      └ US: 国际清单主体（默认），保留国际卫星、3D、Flyover 与四处看看

  UrlInfoSet.Dispatcher: [URL信息集] 地点与 POI
      ├ AutoNavi: 国内地点、搜索与 POI 使用高德（默认）
      └ Apple: Apple 国际地点服务，国内地点信息可能减少

  UrlInfoSet.RAP: [URL信息集] 评分和照片
      └ Apple: 保留国际评分、照片和反馈服务（默认）

  UrlInfoSet.LocationShift: [URL信息集] 坐标修正
      ├ AutoNavi: 中国大陆使用 GCJ-02（默认）
      └ Apple: 使用 WGS-84，中国道路和地点可能产生偏移

  TileSet.Earth: [瓦片数据集] 地球图像
      └ Apple: 国际地球、城市与地貌资源（默认）

  TileSet.Flyover: [瓦片数据集] 3D 城市
      └ XX: Apple 国际 Flyover / 3D 城市资源（默认）

  TileSet.Munin: [瓦片数据集] 四处看看
      └ XX: Apple 国际 Munin / Look Around 资源（默认）

  TileSet.Roads: [瓦片数据集] 卫星道路
      └ XX: 保留国际道路能力，大陆道路由混合图层补充（默认）

  TileSet.Satellite: [瓦片数据集] 卫星图像
      └ XX: 国际卫星 selector；大陆坐标自动路由到 CN 卫星（默认）

  Hybrid.MainlandLayers: [瓦片数据集] 大陆二维图层
      ├ EXTENDED: 完整道路、地点、标签、交通与 2D 卫星（默认）
      └ CORE: 仅标准地图、建筑、POI 与地标，用于诊断

  Hybrid.ServiceMode: [URL信息集] 中国服务范围
      ├ CN_POI: 国内地点、POI 与反向地理编码使用 CN（默认）
      ├ APPLE: 国际前台服务优先，国内地点可能减少
      └ CN_FULL: 国内地点、导航与交通全部使用 CN 服务

  LogLevel: [调试] 日志等级
      ├ WARN: 仅警告和错误（默认）
      ├ INFO: 输出一般运行信息
      └ DEBUG: 输出详细排错信息

  固定内部参数:
      ├ UrlInfoSet.Directions=AutoNavi: 国内高德导航，国外 TomTom
      ├ Hybrid.Enabled=true: 启用混合清单
      ├ Hybrid.Mainland3D=ROUTE: 大陆卫星按坐标转到 CN，国外保持国际资源
      └ Storage=Argument: 优先使用模块参数`;

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
UrlInfoSet.Directions = select,"Apple","Apple","AutoNavi",tag=[URL信息集] 导航与ETA,desc=默认 Apple。国外使用 TomTom；中国大陆需要高德导航时选择 AutoNavi。
UrlInfoSet.RAP = select,"Apple","Apple","AutoNavi",tag=[URL信息集] 评分和照片,desc=默认 Apple。保留国际评分、照片和反馈服务；AutoNavi 相关能力未完全开放。
UrlInfoSet.LocationShift = select,"AutoNavi","AutoNavi","Apple",tag=[URL信息集] 坐标修正,desc=默认 AutoNavi。中国大陆使用 GCJ-02；Apple 使用 WGS-84，可能出现大陆道路和地点偏移。
TileSet.Earth = select,"Apple","Apple","AutoNavi",tag=[瓦片数据集] 地球图像,desc=默认 Apple。保留国际地球、城市和地貌资源。
TileSet.Flyover = select,"XX","XX","CN",tag=[瓦片数据集] 3D城市,desc=默认 XX。使用国际 Flyover 和 3D 城市资源；不建议改为 CN。
TileSet.Munin = select,"XX","XX","CN",tag=[瓦片数据集] 四处看看,desc=默认 XX。使用国际 Munin/Look Around 资源；CN 会失去国外四处看看。
TileSet.Roads = select,"XX","XX","CN",tag=[瓦片数据集] 卫星道路,desc=默认 XX。保留国际道路和四处看看能力，大陆道路由混合图层补充。
TileSet.Satellite = select,"XX","XX","CN",tag=[瓦片数据集] 卫星图像,desc=默认 XX。保留国际卫星 selector，大陆坐标自动路由至 CN 卫星。
Hybrid.MainlandLayers = select,"EXTENDED","EXTENDED","CORE",tag=[瓦片数据集] 大陆二维图层,desc=默认 EXTENDED。包含道路、地点、标签、交通与 2D 卫星；CORE 仅用于诊断。
Hybrid.ServiceMode = select,"CN_POI","CN_POI","APPLE","CN_FULL",tag=[URL信息集] 中国服务范围,desc=默认 CN_POI。恢复国内地点、POI 与反向地理编码；CN_FULL 还强制使用 CN 导航和交通。
Storage = select,"Argument","Argument","PersistentStore","database",tag=[储存] 配置来源,desc=默认 Argument。优先读取插件参数，缺失项再读取持久化配置。
LogLevel = select,"WARN","WARN","INFO","DEBUG",tag=[调试] 日志等级,desc=默认 WARN。需要排错时临时选择 INFO 或 DEBUG。

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

# 参数与默认值（Quantumult X snippet 无交互参数面板，默认值内置于 request/response bundle）
# GeoManifest.Dynamic.Config.CountryCode=US：国际清单主体，保留国际卫星、3D、Flyover 与四处看看
# UrlInfoSet.Dispatcher=AutoNavi；UrlInfoSet.Directions=Apple；UrlInfoSet.LocationShift=AutoNavi
# TileSet.Earth=Apple；TileSet.Flyover/Munin/Roads/Satellite=XX
# Hybrid.MainlandLayers=EXTENDED；Hybrid.ServiceMode=CN_POI；Storage=Argument；LogLevel=WARN
# 固定：Hybrid.Enabled=true，Hybrid.Mainland3D=ROUTE；修改 modules/assets bundle 的内置 argument 后生效

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
# US 国际清单；AutoNavi 国内地点/POI；Apple 导航；AutoNavi GCJ-02 坐标修正
# Apple 地球；XX 国际 Flyover/Munin/道路/卫星；EXTENDED 大陆完整二维图层；CN_POI 国内地点服务
# Storage=Argument；LogLevel=WARN；固定 Hybrid.Enabled=true、Hybrid.Mainland3D=ROUTE

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
	.replace("  UrlInfoSet.Directions: AutoNavi\n", "")
	.replace("Hybrid.ServiceMode: APPLE", "Hybrid.ServiceMode: CN_POI")
	.replace("├ APPLE: Apple 前台服务，仅保留大陆反向地理编码及可选坐标修正（默认，国外完全国际化）", "├ CN_POI: 高德地点、POI 与反向地理编码；本 Egern 版本固定使用高德导航")
	.replace("├ CN_POI: 高德地点、POI 与反向地理编码，导航保留 Apple（默认）", "├ CN_POI: 高德地点、POI 与反向地理编码；本 Egern 版本固定使用高德导航")
	.replace("├ CN_POI: 高德地点与反向地理编码，导航保留 Apple", "├ APPLE: Apple 前台服务，国外完全国际化")
	.replace("  UrlInfoSet.LocationShift:\n", "  导航与 ETA:\n      └ 固定为 AutoNavi：中国大陆使用高德，国外仍使用 TomTom；不再读取旧模块缓存中的 Apple 参数。\n\n  UrlInfoSet.LocationShift:\n")
	.replace(/compat_arguments_desc: \|[\s\S]*?\nauthor:/, `${egernArgumentsDesc}\nauthor:`)
	.replaceAll('UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"', 'UrlInfoSet.Directions="AutoNavi"')
	.replaceAll(`${archiveBase}/request.selective-hybrid-mainland-3d.v6.bundle.js`, request)
	.replaceAll(`${archiveBase}/response.selective-hybrid-mainland-3d.v6.bundle.js`, response)
	.replaceAll(request, egernRequest)
	.replaceAll(response, egernResponse)
	.replaceAll(`${archiveBase}/request.selective-hybrid-mainland-3d-route.v6.js`, route)
);

console.log("Wrote stable multi-client modules to", root);
