# Maps iOS 27 模块说明

## 推荐模块

`modules/` 根目录只保留当前稳定版，命名和模块头部遵循原项目的多客户端结构：

| 代理软件 | 文件 | 导入地址 |
| --- | --- | --- |
| Egern | [`iRingo.Maps.yaml`](./iRingo.Maps.yaml) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.yaml` |
| Surge | [`iRingo.Maps.sgmodule`](./iRingo.Maps.sgmodule) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.sgmodule` |
| Loon | [`iRingo.Maps.plugin`](./iRingo.Maps.plugin) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.plugin` |
| Shadowrocket | [`iRingo.Maps.srmodule`](./iRingo.Maps.srmodule) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.srmodule` |
| Stash | [`iRingo.Maps.stoverride`](./iRingo.Maps.stoverride) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.stoverride` |
| Quantumult X | [`iRingo.Maps.snippet`](./iRingo.Maps.snippet) | `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.snippet` |

实机已验证：

- 中国大陆标准地图、道路、地点与 2D 卫星可显示。
- 中国大陆以外使用 Apple 国际地图和卫星数据。
- 国外 3D / Flyover 正常。
- 可以从国内卫星视图直接搜索并定位国外城市，不再要求先切换到标准地图。

## 工作方式

v6 只向 Apple 地图暴露一套国际卫星 selector，并为其补充中国大陆覆盖。国际 `style=98/v=226` 请求落在中国大陆坐标时，会转换为 CN `style=7/v=68`；国外请求保持不变。

这种方式用于规避 iOS 27 对重复 CN/国际卫星 selector 的会话级缓存和绑定。

## 国际全功能测试版

需要测试更激进的国际能力时，可使用 [`test/international-all/`](./test/international-all/)。该目录提供 Egern、Surge、Loon、Shadowrocket、Stash 和 Quantumult X 六种模块格式，默认开启国际卫星、3D/Flyover、四处看看、地球和 SPR 资源，同时保留大陆 POI、导航、定位修正与 2D 卫星路由。

测试版只新增模块目录，不替换根目录稳定模块；请勿与稳定版或其他 Maps 模块同时启用。详细参数与限制见 [`test/international-all/README.md`](./test/international-all/README.md)。

## 推荐参数

| 参数 | 默认值 | 效果 |
| --- | --- | --- |
| `CountryCode` | `US` | 国际清单主体，保留国外卫星、3D、Flyover 与四处看看 |
| `Dispatcher` | `AutoNavi` | 国内地点、搜索与 POI 使用高德 |
| `Directions` | Egern `AutoNavi`；其他 `Apple` | Egern 国内高德导航；其他客户端可自行切换 |
| `LocationShift` | `AutoNavi` | 国内 GCJ-02 坐标修正 |
| `Earth` | `Apple` | 国际地球与地貌 |
| `Flyover / Munin / Roads / Satellite` | `XX` | 保留国际 3D、四处看看、道路与卫星能力 |
| `MainlandLayers` | `EXTENDED` | 完整大陆二维地图、交通、POI 与 2D 卫星 |
| `ServiceMode` | `CN_POI` | 国内地点、POI 与反向地理编码使用 CN |
| `Storage / LogLevel` | `Argument / WARN` | 优先模块参数，仅输出警告与错误 |

## 模块说明格式

各客户端模块继续沿用原项目写法：

- `#!name / #!desc / #!openUrl / #!author / #!homepage / #!icon / #!category / #!version`
- Surge 使用 `#!arguments` 和 `#!arguments-desc`
- Loon 使用 `[Argument] / [Rule] / [Script] / [MITM]`
- Egern 使用 `compat_arguments` 和 `compat_arguments_desc`
- Shadowrocket、Stash、Quantumult X 因格式没有统一交互参数面板，在模块头部用注释列出全部默认值与修改方式
- 参数按原项目的 `[动态配置]`、`[URL信息集]`、`[瓦片数据集]`、`[储存]`、`[调试]` 分类，并说明默认值和修改后的实际影响

## 旧版本

全部旧模块已移入 [`archive/legacy/`](./archive/legacy/)，旧脚本和 bundle 已移入 [`archive/assets/`](./archive/assets/)；它们只用于开发对比和回归测试。

旧版本定位：

| 文件 | 用途 | 建议 |
| --- | --- | --- |
| `iRingo.Maps.iOS27.Selective-Hybrid.Local.v1.yaml` | 中国二维 + 国际 3D，不处理国内卫星路由 | 回退基线 |
| `iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Native.Local.v4.yaml` | 并存 CN/国际 selector | 会触发切换绑定，不推荐 |
| `iRingo.Maps.China.Full.Local.yaml` | 完整 CN 优先模式 | 仅重视中国数据时使用 |
| `iRingo.Maps.International.3D.Local.yaml` | 国际能力优先模式 | 中国数据可能缺失或偏移 |
| `iRingo.Maps.Satellite.Diagnostics.Local.v2.yaml` | 脱敏采集卫星请求 | 仅排查问题时临时启用 |

v2、v3、v5 和其他实验模块保留用于开发对比，不建议与 v6 同时启用。

## 更新模块后的操作

1. 停用并删除旧版 Selective Hybrid 模块。
2. 按代理软件导入 `modules/` 根目录对应的当前稳定模块，并确认只有这一份 Maps 混合模块启用。
3. 强制退出 Apple 地图和 Egern。
4. 若仍使用旧清单或旧 selector，重启设备后再测试。

更多实现细节和与上游的完整差异见仓库根目录 [`README.md`](../README.md)。
