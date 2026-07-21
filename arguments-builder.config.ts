import { defineConfig } from "@iringo/arguments-builder";
export default defineConfig({
	output: {
		surge: {
			path: "./dist/iRingo.Maps.sgmodule",
			transformEgern: {
				enable: true,
				path: "./dist/iRingo.Maps.yaml",
			},
		},
		loon: {
			path: "./dist/iRingo.Maps.plugin",
		},
		customItems: [
			{
				path: "./dist/iRingo.Maps.snippet",
				template: "./template/quantumultx.handlebars",
			},
			{
				path: "./dist/iRingo.Maps.stoverride",
				template: "./template/stash.handlebars",
			},
		],
		dts: { isExported: true, path: "./src/types.d.ts" },
		boxjsSettings: {
			path: "./template/boxjs.settings.json",
			scope: "@iRingo.Maps.Settings",
		},
	},
	args: [
		{
			defaultValue: "US",
			description: "默认 US。以国际清单为主体，保留国际卫星、3D、Flyover 与四处看看；本混合模式不建议改为 CN。",
			key: "GeoManifest.Dynamic.Config.CountryCode",
			name: "[动态配置] 资源清单的国家或地区代码",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（跟随用户当前所在地区）" },
				{ key: "CN", label: "🇨🇳中国大陆" },
				{ key: "HK", label: "🇭🇰中国香港" },
				{ key: "TW", label: "🇹🇼中国台湾" },
				{ key: "SG", label: "🇸🇬新加坡" },
				{ key: "US", label: "🇺🇸美国" },
				{ key: "JP", label: "🇯🇵日本" },
				{ key: "AU", label: "🇦🇺澳大利亚" },
				{ key: "GB", label: "🇬🇧英国" },
				{ key: "KR", label: "🇰🇷韩国" },
				{ key: "CA", label: "🇨🇦加拿大" },
				{ key: "IE", label: "🇮🇪爱尔兰" },
			],
			type: "string",
		},
		{
			defaultValue: "AutoNavi",
			description:
				"默认 AutoNavi。国内地点、搜索、公共指南与 POI 使用高德；选择 Apple 后国内地点数据可能减少。",
			key: "UrlInfoSet.Dispatcher",
			name: "[URL信息集] 调度器",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{
					key: "AutoNavi",
					label:
						"🧭高德（🇨🇳:互动百科/大众点评/携程 | 🇺🇳:维基百科/Yelp/Booking）",
				},
				{ key: "Apple", label: "Apple（维基百科/Yelp/Booking）" },
			],
			type: "string",
		},
		{
			defaultValue: "Apple",
			description: "默认 Apple。国际导航使用 TomTom；中国大陆如需高德导航请选择 AutoNavi。Egern 稳定模块固定为 AutoNavi。",
			key: "UrlInfoSet.Directions",
			name: "[URL信息集] 导航与ETA",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🇨🇳:高德地图 | 🇺🇳:TomTom）" },
				{ key: "Apple", label: "Apple（🇨🇳:🈚️ | 🇺🇳:TomTom）" },
			],
			type: "string",
		},
		{
			defaultValue: "Apple",
			description: "默认 Apple。保留国际评分、照片与反馈服务；高德相关评分和照片接口未完全开放。",
			key: "UrlInfoSet.RAP",
			name: "[URL信息集] 评分和照片",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🇨🇳:🈶️但未开放 | 🇺🇳:🈚️）" },
				{ key: "Apple", label: "Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）" },
			],
			type: "string",
		},
		{
			defaultValue: "AutoNavi",
			description:
				"默认 AutoNavi。中国大陆使用 GCJ-02 坐标修正；Apple 使用 WGS-84，可能出现大陆道路和地点偏移。",
			key: "UrlInfoSet.LocationShift",
			name: "[URL信息集] 定位漂移",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🈚️坐标，使用🇨🇳GCJ-02坐标）" },
				{ key: "Apple", label: "Apple（🈶️坐标，使用🇺🇳WGS-84坐标）" },
			],
			type: "string",
		},
		{
			defaultValue: "Apple",
			description: "默认 Apple。保留国际地球视图中的城市、行政区划与地貌资源。",
			key: "TileSet.Earth",
			name: "[瓦片数据集] 地球图像",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				//{ key: "HYBRID", label: "混合" },
				{ key: "AutoNavi", label: "🧭高德版（主要显示国家与国界）" },
				{ key: "Apple", label: "Apple（主要显示城市与地貌）" },
			],
			type: "string",
		},
		{
			defaultValue: "XX",
			description: "默认 XX。保留国际卫星道路与四处看看能力；中国大陆道路由混合二维图层补充。",
			key: "TileSet.Roads",
			name: "[瓦片数据集] 道路图像与四处看看",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				//{ key: "HYBRID", label: "混合" },
				{ key: "CN", label: "🇨🇳中国（🇨🇳:卫星视图道路正确 | 🇺🇳:无四处看看）" },
				{ key: "XX", label: "Apple（🇨🇳:卫星视图道路偏移 | 🇺🇳:有四处看看）" },
			],
			type: "string",
		},
		{
			defaultValue: "XX",
			description: "默认 XX。保留国际卫星 selector；落在中国大陆的卫星坐标由路由脚本自动转换为 CN 卫星请求。",
			key: "TileSet.Satellite",
			name: "[瓦片数据集] 卫星图像",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				//{ key: "HYBRID", label: "混合（🇨🇳:2D较新 | 🇺🇳:主要城市3D）" },
				{ key: "CN", label: "🇨🇳中国四维（仅🇨🇳）" },
				{ key: "XX", label: "🇺🇳DigitalGlobe（全球，但🇨🇳较旧）" },
			],
			type: "string",
		},
		{
			defaultValue: "XX",
			description: "默认 XX。保留 Apple 国际 Flyover 与 3D 城市资源；不建议在当前混合模式中选择 CN。",
			key: "TileSet.Flyover",
			name: "[瓦片数据集] 3D 城市与 Flyover",
			options: [
				{ key: "CN", label: "🇨🇳中国资源" },
				{ key: "XX", label: "🌐Apple 国际资源（默认）" },
			],
			type: "string",
		},
		{
			defaultValue: "XX",
			description: "默认 XX。保留 Apple 国际 Munin / Look Around 元数据、资源入口和可用路段。",
			key: "TileSet.Munin",
			name: "[瓦片数据集] 四处看看（Munin）",
			options: [
				{ key: "CN", label: "🇨🇳中国资源（国外四处看看可能消失）" },
				{ key: "XX", label: "🌐Apple 国际四处看看（默认）" },
			],
			type: "string",
		},
		{
			defaultValue: "EXTENDED",
			description: "默认 EXTENDED。向国际清单注入大陆限定的道路、地点、标签、交通与 2D 卫星；CORE 仅用于诊断。",
			key: "Hybrid.MainlandLayers",
			name: "[瓦片数据集] 中国大陆二维图层",
			options: [
				{ key: "EXTENDED", label: "完整大陆二维图层（默认）" },
				{ key: "CORE", label: "仅标准地图、建筑、POI 与地标" },
			],
			type: "string",
		},
		{
			defaultValue: "CN_POI",
			description: "默认 CN_POI。国内地点、POI 与反向地理编码使用 CN；APPLE 偏国际服务；CN_FULL 还强制使用 CN 导航与交通。",
			key: "Hybrid.ServiceMode",
			name: "[URL信息集] 中国服务范围",
			options: [
				{ key: "CN_POI", label: "国内地点/POI/反向地理编码（默认）" },
				{ key: "APPLE", label: "Apple 国际前台服务优先" },
				{ key: "CN_FULL", label: "国内地点、导航与交通全部使用 CN" },
			],
			type: "string",
		},
		{
			key: "Storage",
			name: "[储存] 配置类型",
			defaultValue: "Argument",
			type: "string",
			options: [
				{ key: "Argument", label: "优先使用插件选项与模块参数等，由 $argument 传入的配置，$argument 不包含的设置项由 PersistentStore (BoxJs) 提供" },
				{ key: "PersistentStore", label: "只使用来自 BoxJs 等，由 $persistentStore 提供的配置" },
				{ key: "database", label: "只使用由作者的 database.mjs 文件提供的默认配置，其他任何自定义配置不再起作用" },
			],
			description: "默认 Argument。优先使用模块或插件参数，未传入的项目再从 PersistentStore（BoxJs）读取。",
		},
		{
			key: "LogLevel",
			name: "[调试] 日志等级",
			type: "string",
			defaultValue: "WARN",
			description: "默认 WARN，仅输出警告与错误；排错时临时选择 INFO 或 DEBUG。",
			options: [
				{ key: "OFF", label: "关闭" },
				{ key: "ERROR", label: "❌ 错误" },
				{ key: "WARN", label: "⚠️ 警告" },
				{ key: "INFO", label: "ℹ️ 信息" },
				{ key: "DEBUG", label: "🅱️ 调试" },
				{ key: "ALL", label: "全部" },
			],
		},
	],
});
