# Maps iOS 27 International-All Test

这是一个独立的实验版本，用于测试在保留中国大陆数据的同时开启尽可能完整的 Apple 国际地图能力。测试模块位于 `modules/test/international-all/`，不会替换或修改 `modules/` 根目录的稳定模块。

## 默认效果

- `GeoManifest.Dynamic.Config.CountryCode=US`：以国际资源清单为主体。
- `TileSet.Satellite=XX`：启用国际 2D 卫星资源；大陆卫星请求继续由卫星路由脚本转到 CN 服务。
- `TileSet.Flyover=XX`：启用国外 Flyover、3D 城市和相关模型资源。
- `TileSet.Munin=XX`：启用国外 Munin / Look Around（四处看看）资源。
- `TileSet.Roads=XX`、`TileSet.Earth=Apple`：保留国际道路、地球和 SPR 城市资源。
- `Hybrid.MainlandLayers=EXTENDED`：保留中国大陆二维道路、标签、交通、POI 和 2D 卫星图层。
- `Hybrid.ServiceMode=CN_POI`、`UrlInfoSet.Dispatcher=AutoNavi`：保留中国大陆地点、搜索、POI 和反向地理编码能力。
- `UrlInfoSet.Directions=AutoNavi`：大陆导航使用高德，国外导航继续使用国际服务。
- `UrlInfoSet.LocationShift=AutoNavi`：大陆坐标按 GCJ-02 进行修正。

当前发布的响应 bundle 使用 `TileSet.Satellite`、`TileSet.Flyover` 和 `TileSet.Munin` 选择资源，因此测试版不额外暴露 `TileSet.Satellite3D` 或 `TileSet.LookAround` 参数；这两个能力分别由 `Flyover`、`Munin` 和混合清单逻辑覆盖。

## 文件

| 客户端 | 文件 |
| --- | --- |
| Egern | `iRingo.Maps.yaml` |
| Surge | `iRingo.Maps.sgmodule` |
| Loon | `iRingo.Maps.plugin` |
| Shadowrocket | `iRingo.Maps.srmodule` |
| Stash | `iRingo.Maps.stoverride` |
| Quantumult X | `iRingo.Maps.snippet` |

测试模块仍引用仓库 `main/modules/assets/` 下的稳定脚本，只改变模块默认参数和测试标识。这样可以把实验配置与稳定脚本隔离，降低对现有版本的影响；如果后续需要测试新 bundle，应另行发布测试资源并更新脚本地址。

## 已知限制

- 这是实验版本，最终显示仍受 Apple 服务端清单、账号、设备型号、系统版本和所在网络影响。
- 中国大陆卫星数据为较旧版本，可能存在清晰度、覆盖范围或坐标偏移问题。
- 本项目主要由 Egern 进行测试；Surge、Loon、Shadowrocket、Stash、Quantumult X 仅提供兼容格式，不保证全部功能完整或行为一致。
- iOS 27 以下系统的行为不稳定，不保证 3D、Flyover、Look Around 或混合图层可用。
- 请勿与稳定版或其他 Maps 模块同时启用。测试前停用旧模块并强制退出 Apple 地图，必要时重启设备以清除旧清单缓存。
