# Maps International-All Test v2

这是根据 `iRingo.Maps.Only-For-Surge-v1.4.0` 的自适应清单思路，并结合本项目现有 iOS 27 实机结果制作的独立测试版本。当前以 **Egern 为主要测试入口**；稳定版 `modules/` 根目录及 `modules/assets/` 不会被替换或修改。

## 采用的参考逻辑

- `CountryCode=CN`：请求层保持国内服务身份并预热 US 清单；响应仍以国际原生主组承载卫星、3D、Flyover 与四处看看，但主组采用 Apple CN 原生监管坐标元数据解释大陆图层。
- CN 清单分支保留高德底图、POI、实时交通、导航、反向地理编码与 GCJ-02 修正。
- 国际 Munin、SPR、3D 卫星、Flyover、道路及区域能力选择器与大陆高德服务隔离。
- 不改写瓦片请求或复用 `accessKey`；国内标准道路、卫星道路和卫星影像直接使用 Apple CN 清单下发的原生描述符，国际瓦片保持原始请求链。

## 本项目额外保留

- 国内 2D 卫星与卫星道路使用 Apple 下发的 CN 原生描述符，并将覆盖范围收窄到中国大陆；系统直接生成对应 CN 授权请求，不再把国际授权改写到 CN 节点。
- CN 原生卫星、道路和 POI 描述符均保留原始坐标/数据集身份，不额外执行 WGS-84/GCJ-02 二次换算。
- 国际四处看看除 Munin/SPR/道路选择器外，同时保留国际 `muninBaseURL` 与资源入口，防止只出现入口但无法加载街景内容。
- `test.3` 修复 CN 主清单中同名卫星、Sputnik 3D 与 Flyover 描述符抢占国际资源的问题：这些视觉能力统一采用国际描述符，只有大陆 `style=98` 卫星瓦片按坐标路由回 CN。
- `test.4` 尝试同步国际 `tileGroup`，但在 iOS 27/Egern 实机上会导致国际 3D 无法显示。
- `test.5` 已回退不兼容的 `tileGroup` 替换，恢复 `test.3` 已确认可显示的国际 3D 组合；清晰度优化需取得实际 3D 瓦片请求后再单独判断。
- `test.6` 保持 `test.5` 的清单与路由逻辑不变，仅让国际卫星/3D 主瓦片域名 `gspe11-ssl.ls.apple.com` 直连，降低代理链路中断导致高层级纹理未加载、画面持续模糊的概率。Apple 服务端原始建模与影像清晰度仍无法由脚本提升。
- `test.7` 根据实机结果撤销 `test.6` 的国际瓦片直连：部分中国网络无法直连 Apple 国际 3D 服务，会导致国际 3D 完全消失。恢复 `test.5` 已确认可显示的网络路由，国际瓦片继续遵循用户现有代理规则。
- `test.8` 改用 US 原生清单作为默认主体，不再重排国际 `tileSet`、3D `tileGroup`、资源及署名索引；国内高德二维图层追加在国际描述符之后，并只补充国内 POI、导航、反向地理编码和坐标修正服务。目标是避免 Apple 高精度网格/DSM/JPEG/ASTC 纹理链因索引重建而退化为低细节显示。
- `test.8` 国内标准地图修正：保留高德二维瓦片原始 `dataSet` 标识及 `CN` 服务区域白名单，避免系统把 GCJ-02 图层当作全球 Apple 图层而产生道路、POI 与底图偏移；国际 3D 分组不变。
- `test.8-cnstandard3` 在不改动 POI、卫星、导航和国际 3D 清单逻辑的前提下，为 Egern 增加实际瓦片请求路由：大陆标准底图和道路强制使用同一套 CN 原生瓦片坐标系，解决 POI 正确但道路仍使用国际 WGS-84 瓦片造成的视觉偏移。
- `test.9-cn-native` 根据实机 DEBUG 日志调整主体：日志确认旧版实际返回 `CountryCode=US`、`releaseInfo=PROD (24.20)`，且没有请求路由命中记录。因此本版改由 CN 原生清单和 `PROD-CN` 身份负责国内道路、POI、交通、导航及定位坐标解释；US 仅追加国际卫星、3D、Flyover、Munin/SPR、全球覆盖与道路能力，不再改写国内标准底图请求坐标。
- `test.9-cn-satellite-native` 根据实机“标准地图正确、卫星定位偏移”结果，恢复 CN 清单原生 2D 卫星描述符作为大陆第一选择，并追加 US 卫星作为国外回退；国际 3D/Flyover 仍完全采用 US 描述符。模块不再引用 `satellite-route.js`，避免把 US `style 98` 的瓦片坐标直接改投 CN `style 7`。
- `test.9-cn-satellite-roads-native` 根据实机“卫星底图与定位正确、道路偏移”结果，继续保留 CN 原生 `VECTOR_SPR_ROADS` 作为大陆卫星道路覆盖层，同时追加 US 同名描述符供国外卫星地图及四处看看使用；不改变标准地图、POI、定位和国际 3D 逻辑。
- `test.9-cn-regional-hybrid` 根据实机“国外到处看看消失且卫星加载慢”结果，将 CN 2D 卫星描述符的覆盖范围收窄到中国大陆，避免国外先等待 CN 节点超时；清单恢复国际 `VECTOR_SPR_ROADS`，仅当道路瓦片坐标位于大陆时由 `cn-satellite-road.js` 原坐标路由到 CN 服务，国外道路和到处看看保持国际直连。
- `test.10-international-selector-route` 根据实机“只剩国内卫星、国外卫星加载慢、标准地图国外四处看看消失”结果，撤销同 style 的 CN/国际双卫星描述符。最终清单只保留国际卫星、Sputnik、Flyover、Munin 与完整 SPR/四处看看 selector，并保持国际清单原生顺序；仅当 `style=98` 卫星瓦片坐标位于中国大陆时，由 `satellite-route.js` 保留原 `x/y/z` 路由到 CN `style=7` 服务。这样国外标准地图与卫星地图均直接使用国际能力链，不再等待 CN selector 超时。
- `test.11-us-capability-cn-regional` 根据实机“国外四处看看仍无入口、国内卫星加载缓慢”结果，将默认主身份切回 US/`PROD`，保持国际清单的 tileSet 顺序、3D tileGroup、Munin/SPR、资源入口和国际能力判断不变。CN 标准地图、POI、交通、2D 卫星及卫星道路只作为大陆区域描述符追加；移除卫星请求改写脚本，避免错误 accessKey 导致 403/重试。导航继续使用上一实机版本已验证的高德组合，避免在没有导航请求日志的情况下改写二进制路线请求。
- `test.12-separated-native-groups` 根据 test11 实机反馈的“国内卫星漂移、国外无四处看看、国外 3D 质量差”，不再把任何 CN 描述符插入 iOS 27 唯一的国际综合组。国际原生组的标识、引用顺序和 Munin/SPR/Sputnik/Flyover 链保持不变；CN 标准地图、POI、交通和高缩放卫星描述符进入由 CN 原生组克隆的独立大陆组。暂不注入 CN `VECTOR_SPR_ROADS`，避免它再次抢占国际四处看看能力。
- `test.14-cn-owned-adaptive-group` 根据 test12 长时间运行后出现的“国际资源生效后国内标准地图与卫星同时偏移、POI 消失”，取消会延迟切换的 US/CN 双组结构。清单只保留一个由 CN 原生组克隆的坐标组，`PROD-CN`、`regulatoryRegionId=2`、国内标准地图、POI、交通和卫星优先；完整 US tileSet 按原顺序追加，提供国外标准地图、POI、卫星、Munin/SPR、Flyover 与 3D。国内卫星道路只按大陆坐标路由到 CN，国外请求保持国际链。国际 3D 以正常显示为当前目标，暂不继续增强清晰度。
- `test.15-cn-first-native-groups` 根据 test14 实机“只显示国内卫星，且国内标准/卫星道路偏移，但国外四处看看正常”的结果，停止在一个组内混合 CN/US 同名 selector，也移除 `cn-satellite-road.js` 二次请求改写。完整 CN 原生组保持首位并独占国内标准、POI、道路、卫星及坐标解释；完整 US 原生组按原索引追加，负责国外标准、卫星、3D、Munin/SPR 与四处看看。清单身份继续保持 `PROD-CN` 和 `regulatoryRegionId=2`。
- `test.16-international-primary-cn-regional` 根据 test15 实机“国外显示全局高德、无国际卫星；四处看看放大后仅出现图标但点击无图像”的结果，确认 iOS 27 实际只采用首个/主服务组。改为保留国际原生组、索引和资源引用作为唯一能力主体，将国内标准图、POI、交通和卫星严格区域化后插入国际基础组；不再建立 CN 首组，也不改写国际 Munin/SPR 请求。目标是让国外标准图、卫星、3D 与四处看看图像资源真正生效，同时防止 CN 描述符覆盖全球。
- `test.17-disjoint-satellite-cn-coordinate` 根据 test16 实机“国内 POI 正常但标准道路与卫星影像偏移；从国内卫星直接移动到国外不加载，必须先切回标准地图”的结果，将国内标准道路和卫星描述符显式设为与已对齐 POI 相同的 CN 坐标归属。国际卫星描述符从 z8 以上的中国大陆范围精确扣除，CN 卫星仅覆盖大陆，使两套同 style 卫星选择器不存在覆盖重叠，避免 iOS 27 在卫星模式中持续锁定国内源。国际主组、国外 3D 和已正常的四处看看链保持不变，且不增加任何瓦片请求改写。
- `test.18-cn-regulatory-international-capabilities` 根据 test17 实机仍出现“国内标准道路与卫星影像漂移，卫星模式跨区仍锁定国内源”的结果，不再依靠人为 `countryRegionWhitelist=CN` 决定坐标解释。实际生效的国际能力主组改为引用 Apple CN 清单原生 `offlineMetadata/regulatoryRegionId=2`；CN 标准道路、卫星道路和卫星影像恢复各自原始 provider metadata，并只在大陆范围加入主组。国际道路、卫星、Sputnik/Flyover 与完整 Munin/SPR 链仍由 US 清单提供，目标是在统一 CN 坐标语义下消除国内道路/影像漂移，同时保留境外卫星跨区回退、3D 与四处看看。
- 测试模块和脚本全部放在本目录，避免覆盖稳定 `modules/assets/`。
- Egern 只公开脚本真正读取的三个参数，其余服务组合固定，避免旧 BoxJs/持久化配置覆盖测试结果。
- 所有脚本地址指向远程 `test/international-all-v2` 分支；分支上传前不可直接通过远程链接导入。

## 文件

- `iRingo.Maps.yaml`：Egern 主测试模块，默认使用 US 国际清单主体并区域化注入 CN 数据。
- `iRingo.Maps.sgmodule`：Surge 兼容模块，采用与 Egern 相同的清单合并策略，不执行道路或卫星请求改写。
- `assets/request.bundle.js`：AUTO 清单分支与另一份清单预热。
- `assets/response.bundle.js`：自适应 CN/国际资源合并和环视隔离。
- `assets/cn-native-road.js`：保留的上一轮诊断脚本；`test.9-cn-native` 模块不再引用。
- `assets/satellite-route.js`：保留的 test10 请求改写脚本，仅供版本对比；test11/test12 模块不再引用。
- `assets/cn-satellite-road.js`：保留的 test14 诊断脚本；test18 模块不再引用，避免道路请求被二次改写。

## Egern 默认参数

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `GeoManifest.Dynamic.Config.CountryCode` | `CN` | 请求保持 CN 国内服务身份，并预热 US 清单作为实际国际能力主组 |
| `UrlInfoSet.RAP` | `Apple` | 使用国际评分、照片与反馈服务 |
| `LogLevel` | `WARN` | 仅记录警告和错误 |

Egern 固定使用以下组合：`Dispatcher/Directions/LocationShift=AutoNavi`，`Map/POI/Traffic=CN`，`Roads/Satellite=HYBRID`，`Flyover/Munin=XX`，`Storage=Argument`。国际原生主组负责国外标准地图、POI、卫星、3D、Flyover 与可交互四处看看；该主组引用 CN 原生 `regulatoryRegionId=2`，国内标准道路、POI、交通和卫星图层因此使用同一监管坐标语义。CN 道路与卫星描述符只覆盖大陆，国际同类描述符继续负责境外回退。导航沿用上一实机版本已确认“国内外均可导航”的服务组合。

## 建议测试方式

1. 只启用本目录的 Egern 模块，停用稳定 Maps 模块和旧测试模块。
2. 清理 Apple 地图后台并重新打开；首次加载需要分别取得 CN 与 US 清单缓存。
3. 依次测试：国内标准地图的道路/POI/定位对齐及导航；国内卫星模式的影像/道路/POI/定位对齐；国外标准地图 POI 与导航；国外 2D/3D 卫星、Flyover 和四处看看。
4. 若切换 `CountryCode`，重新启动地图 App，避免旧清单缓存造成表现混合。

## 已知风险

- 参考版本说明以 iOS 26 + Surge 为主要验证环境；本组合版针对 Egern 模块格式和 iOS 27 卫星路由进行了整合，但仍需实机验证所有组合能力。
- 国内与国外能力现在共用 iOS 27 实际采用的国际原生主组，并由 CN `regulatoryRegionId=2` 解释坐标；该组合能否同时修正道路/影像漂移并解除卫星跨区锁定仍需实机验证。
- 国内卫星数据较旧，仍可能存在数据源自身的清晰度、覆盖和固有偏移；本测试版本保留 Apple 原始 CN 描述符，不执行人工坐标换算。
- 国际卫星、3D 和四处看看依赖国际 Apple 地图节点；若用户网络或代理规则无法访问对应域名，仍可能加载缓慢或功能不可用。本模块不会强制将国际节点设为直连。
- 当前仅保证以 Egern 进行主要测试；Surge 模块属于兼容输出，其他代理软件暂未生成，也不保证功能完整。
- 不要与稳定 Maps 模块或其他 Maps 测试模块同时启用。

## 来源说明

自适应清单脚本和国内道路伴随脚本参考用户提供的 `iRingo.Maps.Only-For-Surge-v1.4.0.zip`，并在本项目中以独立测试资源形式保留；iOS 27 卫星路由来自本项目当前稳定实现。参考逻辑只用于测试分支，不覆盖稳定模块。
