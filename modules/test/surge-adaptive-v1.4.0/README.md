# Maps Surge Adaptive Test

这是根据 `iRingo.Maps.Only-For-Surge-v1.4.0` 思路制作的独立 Surge 实验版本。它不会替换 `modules/` 根目录稳定版，也不会修改现有 International-All 测试版。

## 采用的参考逻辑

- `CountryCode=AUTO`：保留设备当前 CN/国际清单分支，同时预热另一份清单。
- CN 清单分支保留高德底图、POI、实时交通、导航、反向地理编码与 GCJ-02 修正。
- 国际 Munin、SPR、3D 卫星、Flyover、道路及区域能力选择器与大陆高德服务隔离。
- Surge 观察 Apple 地图已取得的高德道路授权，仅在中国大陆坐标、`z12-z15` 范围内将国际 `VECTOR_ROADS/style 20` 请求转换为 CN 原生道路请求。

## 本项目额外保留

- 继续使用已在 iOS 27 验证的国内卫星坐标路由：国际 `style=98/v=226` 请求落在大陆坐标时转换为 CN `style=7/v=68`，国外请求保持不变。
- 测试模块和四个脚本全部放在本目录，避免覆盖稳定 `modules/assets/`。
- 所有脚本地址指向远程 `test/surge-adaptive-v1.4.0` 分支；上传前不可直接远程导入。

## 文件

- `iRingo.Maps.Surge-Adaptive-Test.sgmodule`：Surge 测试模块。
- `assets/request.bundle.js`：AUTO 清单分支与另一份清单预热。
- `assets/response.bundle.js`：自适应 CN/国际资源合并和环视隔离。
- `assets/cn-native-road.js`：Surge 国内道路授权观察与按坐标重写。
- `assets/satellite-route.js`：iOS 27 国内卫星按坐标重写。

## 默认参数

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `CountryCode` | `AUTO` | 保留设备当前 CN/国际分支并预热另一份清单 |
| `Dispatcher / Directions` | `AutoNavi` | 国内地点、POI 与导航使用高德 |
| `RAP` | `Apple` | 国际评分、照片与反馈 |
| `LocationShift` | `AutoNavi` | 国内 GCJ-02 坐标修正 |
| `Earth` | `AutoNavi` | CN 分支保留大陆地球/标准资源 |
| `Flyover / Munin / Roads` | `XX` | 国际 3D、四处看看和 Apple 道路能力 |
| `Map / POI / Traffic` | `CN` | 国内底图、地点与实时交通 |
| `Satellite` | `HYBRID` | 国内外卫星并存并启用 iOS 27 大陆路由 |
| `Announcements` | `CN` | 中国公告环境 |
| `Storage / LogLevel` | `Argument / WARN` | 模块参数优先，仅输出警告和错误 |

## 已知风险

- 参考版本说明以 iOS 26 + Surge 为主要验证环境；本组合版加入了 iOS 27 卫星路由，但仍需实机验证国内道路、导航、卫星、国外 3D 和四处看看能否同时工作。
- 国内道路重写依赖 Apple 地图先产生有效的 CN 道路请求并取得授权；没有有效授权时会原样放行国际道路请求。
- 道路重写只覆盖 `z12-z15`，其他缩放级别保持原请求。
- 国内卫星数据较旧，仍可能存在清晰度、覆盖和坐标偏移问题。
- 仅适用于 Surge。不要在其他代理软件中导入，也不要与稳定 Maps 模块同时启用。

## 来源说明

自适应清单脚本和国内道路伴随脚本来自用户提供的 `iRingo.Maps.Only-For-Surge-v1.4.0.zip`，在本项目中以独立测试资源形式保留；iOS 27 卫星路由来自本项目当前稳定实现。
