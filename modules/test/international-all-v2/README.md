# Maps International-All Test v2

这是根据 `iRingo.Maps.Only-For-Surge-v1.4.0` 的自适应清单思路，并结合本项目现有 iOS 27 实机结果制作的独立测试版本。当前以 **Egern 为主要测试入口**；稳定版 `modules/` 根目录及 `modules/assets/` 不会被替换或修改。

## 采用的参考逻辑

- `CountryCode=AUTO`：保留设备当前 CN/国际清单分支，同时预热另一份清单。
- CN 清单分支保留高德底图、POI、实时交通、导航、反向地理编码与 GCJ-02 修正。
- 国际 Munin、SPR、3D 卫星、Flyover、道路及区域能力选择器与大陆高德服务隔离。
- Surge 兼容模块可观察 Apple 地图已取得的高德道路授权，仅在中国大陆坐标、`z12-z15` 范围内将国际 `VECTOR_ROADS/style 20` 请求转换为 CN 原生道路请求；此增强不在 Egern 中启用。

## 本项目额外保留

- 继续使用已在 iOS 27 验证的国内卫星坐标路由：国际 `style=98/v=226` 请求落在大陆坐标时转换为 CN `style=7/v=68`，国外请求保持不变。
- 大陆卫星路由保留原请求的 `x/y/z`，不额外执行 WGS-84/GCJ-02 二次换算，避免脚本自身引入新的瓦片漂移。
- 国际四处看看除 Munin/SPR/道路选择器外，同时保留国际 `muninBaseURL` 与资源入口，防止只出现入口但无法加载街景内容。
- `test.3` 修复 CN 主清单中同名卫星、Sputnik 3D 与 Flyover 描述符抢占国际资源的问题：这些视觉能力统一采用国际描述符，只有大陆 `style=98` 卫星瓦片按坐标路由回 CN。
- `test.4` 尝试同步国际 `tileGroup`，但在 iOS 27/Egern 实机上会导致国际 3D 无法显示。
- `test.5` 已回退不兼容的 `tileGroup` 替换，恢复 `test.3` 已确认可显示的国际 3D 组合；清晰度优化需取得实际 3D 瓦片请求后再单独判断。
- `test.6` 保持 `test.5` 的清单与路由逻辑不变，仅让国际卫星/3D 主瓦片域名 `gspe11-ssl.ls.apple.com` 直连，降低代理链路中断导致高层级纹理未加载、画面持续模糊的概率。Apple 服务端原始建模与影像清晰度仍无法由脚本提升。
- `test.7` 根据实机结果撤销 `test.6` 的国际瓦片直连：部分中国网络无法直连 Apple 国际 3D 服务，会导致国际 3D 完全消失。恢复 `test.5` 已确认可显示的网络路由，国际瓦片继续遵循用户现有代理规则。
- `test.8` 改用 US 原生清单作为默认主体，不再重排国际 `tileSet`、3D `tileGroup`、资源及署名索引；国内高德二维图层追加在国际描述符之后，并只补充国内 POI、导航、反向地理编码和坐标修正服务。目标是避免 Apple 高精度网格/DSM/JPEG/ASTC 纹理链因索引重建而退化为低细节显示。
- 测试模块和四个脚本全部放在本目录，避免覆盖稳定 `modules/assets/`。
- Egern 只公开脚本真正读取的三个参数，其余服务组合固定，避免旧 BoxJs/持久化配置覆盖测试结果。
- 所有脚本地址指向远程 `test/international-all-v2` 分支；分支上传前不可直接通过远程链接导入。

## 文件

- `iRingo.Maps.yaml`：Egern 主测试模块，不包含 Surge 专用道路授权脚本。
- `iRingo.Maps.sgmodule`：Surge 兼容模块，额外启用国内道路授权观察与坐标重写。
- `assets/request.bundle.js`：AUTO 清单分支与另一份清单预热。
- `assets/response.bundle.js`：自适应 CN/国际资源合并和环视隔离。
- `assets/cn-native-road.js`：Surge 国内道路授权观察与按坐标重写。
- `assets/satellite-route.js`：iOS 27 国内卫星按坐标重写。

## Egern 默认参数

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `GeoManifest.Dynamic.Config.CountryCode` | `US` | 以国际清单为主体并保留 Apple 原生 3D 索引/分组；同时预热 CN 清单用于国内图层和服务注入 |
| `UrlInfoSet.RAP` | `Apple` | 使用国际评分、照片与反馈服务 |
| `LogLevel` | `WARN` | 仅记录警告和错误 |

Egern 固定使用以下组合：`Dispatcher/Directions/LocationShift=AutoNavi`，`Map/POI/Traffic=CN`，`Flyover/Munin/Roads=XX`，`Satellite=HYBRID`，`Storage=Argument`。这样国内标准地图、POI、交通、导航和 GCJ-02 修正由 CN 分支保留，国外卫星、3D、Flyover、四处看看和 Apple 道路能力由国际分支补充。

## 建议测试方式

1. 只启用本目录的 Egern 模块，停用稳定 Maps 模块和旧测试模块。
2. 清理 Apple 地图后台并重新打开；首次加载需要分别取得 CN 与 US 清单缓存。
3. 依次测试国内标准地图/POI/导航、国内 2D 卫星、国外 2D/3D 卫星、Flyover 和四处看看。
4. 若切换 `CountryCode`，重新启动地图 App，避免旧清单缓存造成表现混合。

## 已知风险

- 参考版本说明以 iOS 26 + Surge 为主要验证环境；本组合版针对 Egern 模块格式和 iOS 27 卫星路由进行了整合，但仍需实机验证所有组合能力。
- 国内道路重写依赖 Apple 地图先产生有效的 CN 道路请求并取得授权；没有有效授权时会原样放行国际道路请求。
- 道路重写只覆盖 `z12-z15`，其他缩放级别保持原请求。
- 国内卫星数据较旧，仍可能存在数据源自身的清晰度、覆盖和固有坐标偏移；本测试版本只能保证不再由路由脚本二次改写瓦片坐标。
- 当前仅保证以 Egern 进行主要测试；Surge 模块属于兼容输出，其他代理软件暂未生成，也不保证功能完整。
- 不要与稳定 Maps 模块或其他 Maps 测试模块同时启用。

## 来源说明

自适应清单脚本和国内道路伴随脚本参考用户提供的 `iRingo.Maps.Only-For-Surge-v1.4.0.zip`，并在本项目中以独立测试资源形式保留；iOS 27 卫星路由来自本项目当前稳定实现。参考逻辑只用于测试分支，不覆盖稳定模块。
