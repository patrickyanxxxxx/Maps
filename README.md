#  iRingo: 🗺 Maps

自定义 Maps app

添加国际版功能

自定义服务版本

本仓库基于 [NSRingo/Maps](https://github.com/NSRingo/Maps)，针对 iOS 27 的地图资源清单、卫星样式、导航、四处看看和地区切换行为进行适配。

> [!IMPORTANT]
> 本 Fork 不是 Apple、高德或 NSRingo 的官方项目。地图数据、3D、Flyover 与 Look Around 的覆盖范围仍由 Apple 服务器决定。

## 功能

- 中国大陆保留标准地图、道路、地点、POI、坐标修正和 CN 2D 卫星图像。
- 中国大陆以外使用 Apple 国际地图、2D 卫星、3D 卫星、Flyover、地球和 Look Around 数据。
- 支持从国内卫星视图直接搜索并定位国外城市，不需要先切换到标准地图。
- 默认使用 `CN_POI`：中国地点、POI 和反向地理编码使用 CN 服务。Egern 固定使用高德导航；其他客户端默认使用 Apple/TomTom，可改为 AutoNavi。
- 四处看看固定保留 Apple 国际 Munin、资源入口与元数据，不再被国内 POI/导航服务覆盖。
- 提供 Egern、Surge、Loon、Shadowrocket、Stash 和 Quantumult X 模块。
- 旧模块与诊断资源集中归档，不与当前稳定版混放。

## 安装

### Egern

[点击导入 Egern 模块](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.yaml)

### 其他代理软件

| 代理软件 | 模块 |
| --- | --- |
| Surge | [iRingo.Maps.sgmodule](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.sgmodule) |
| Loon | [iRingo.Maps.plugin](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.plugin) |
| Shadowrocket | [iRingo.Maps.srmodule](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.srmodule) |
| Stash | [iRingo.Maps.stoverride](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.stoverride) |
| Quantumult X | [iRingo.Maps.snippet](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.snippet) |

当前模块发布和缓存版本为 `6.3.0`；脚本内部仍显示原项目基础 bundle 版本 `4.6.1`，这是正常现象。

## 默认参数与效果

| 参数 | 默认值 | 默认效果 | 修改后的主要影响 |
| --- | --- | --- | --- |
| `GeoManifest.Dynamic.Config.CountryCode` | `US` | 以国际清单为主体，保留国际卫星、3D、Flyover 和四处看看 | 改为 `CN` 会减少或隐藏国际能力，不建议修改 |
| `UrlInfoSet.Dispatcher` | `AutoNavi` | 国内地点、搜索、公共指南和 POI 使用高德 | 改为 `Apple` 后国内 POI 和地点信息可能减少 |
| `UrlInfoSet.Directions` | Egern：`AutoNavi`；其他：`Apple` | Egern 国内高德导航、国外 TomTom；其他客户端默认 Apple/TomTom | 其他客户端改为 `AutoNavi` 后启用国内高德导航；Egern 为保持已验证导航效果而固定 |
| `UrlInfoSet.RAP` | `Apple` | 使用 Apple 国际评分、照片与反馈服务 | 改为 `AutoNavi` 的相关能力未完全开放，可能缺少评分或照片 |
| `UrlInfoSet.LocationShift` | `AutoNavi` | 中国大陆使用 GCJ-02 坐标修正 | 改为 `Apple` 使用 WGS-84，国内道路、地点和标注可能偏移 |
| `TileSet.Earth` | `Apple` | 使用国际地球、城市与地貌资源 | 改为高德版本后地球视图内容会更偏向国家和国界 |
| `TileSet.Flyover` | `XX` | 保留 Apple 国际 Flyover 和 3D 城市 | 改为 `CN` 可能减少国外 3D，不建议修改 |
| `TileSet.Munin` | `XX` | 保留 Apple 国际四处看看 | 改为 `CN` 可能使国外四处看看消失，不建议修改 |
| `TileSet.Roads` | `XX` | 保留国际卫星道路与四处看看道路能力，大陆道路由混合图层补充 | 改为 `CN` 会损失部分国外道路与四处看看能力 |
| `TileSet.Satellite` | `XX` | 保留国际卫星 selector；大陆坐标自动路由到 CN 卫星 | 改为 `CN` 可能导致国外 2D/3D 卫星不可用 |
| `Hybrid.MainlandLayers` | `EXTENDED` | 注入完整大陆二维道路、地点、标签、交通和 2D 卫星 | `CORE` 仅保留标准地图、建筑、POI 和地标，适合排错 |
| `Hybrid.ServiceMode` | `CN_POI` | 国内地点、POI 和反向地理编码使用 CN 服务 | `APPLE` 更偏国际服务、国内数据可能减少；`CN_FULL` 还会强制 CN 导航和交通 |
| `Storage` | `Argument` | 优先读取模块参数，缺失项再读取持久化配置；Egern 固定使用此值 | `PersistentStore` 或 `database` 会改变配置来源和优先级；仅支持该参数的客户端可调 |
| `LogLevel` | `WARN` | 仅输出警告与错误 | `INFO`/`DEBUG` 输出更多日志，仅建议排错时使用 |

固定内部参数：`Hybrid.Enabled=true` 启用混合清单；`Hybrid.Mainland3D=ROUTE` 让大陆卫星按坐标走 CN 端点，国外保持国际资源。

### 各客户端参数界面

| 客户端 | 参数样式 | 说明 |
| --- | --- | --- |
| Egern | `compat_arguments` + `compat_arguments_desc` | 每个参数均列出默认值、用途和修改影响；导航固定为 AutoNavi |
| Surge | `#!arguments` + `#!arguments-desc` | 全部可配置参数均显示在参数面板并附说明 |
| Loon | `[Argument]` | 每个可配置项均带 `tag`、`desc` 和默认值 |
| Shadowrocket | 模块注释 + Script `argument` | 格式无统一交互参数面板；头部列出全部默认值，可手动修改 argument |
| Stash | YAML 注释 + Script `argument` | 头部列出全部默认值和作用，可直接修改各脚本 argument |
| Quantumult X | snippet 注释 + bundle 内置参数 | 无交互参数面板；头部列出全部内置默认值与效果 |

设备日志中偶尔仍可能看到 `country_code=CN`。该参数表示当前请求的资源清单地区，不等于正在查看的地图位置；稳定版响应脚本会配合缓存的 CN/US 清单生成混合结果。

## 使用方法

1. 删除旧版 Maps、Selective Hybrid 和卫星诊断模块。
2. 重新导入 `modules/` 根目录中对应代理软件的稳定模块。
3. 确认只启用一份 Maps 混合模块。
4. Egern 用户确认响应脚本使用模块中固定的提交地址；其他客户端脚本缓存参数应为 `v=6.3.0`。
5. 强制退出 Apple 地图和代理软件后重新打开；若系统继续使用旧 GeoManifest，可重启设备。

## 实机验证

| 地区 | 标准地图与 POI | 卫星地图 | 3D / Flyover | Look Around |
| --- | --- | --- | --- | --- |
| 中国大陆 | CN 图层、道路、地点与坐标修正 | CN 2D 卫星 | 国内 3D 不作为稳定版保证目标 | 取决于 Apple 实际覆盖 |
| 中国大陆以外 | Apple 国际数据 | Apple 国际卫星 | Apple 国际 3D / Flyover | Apple 国际数据 |

已确认的 iOS 27 卫星请求：

```text
国际：gspe11-ssl.ls.apple.com/tile
      style=98, v=226

中国：gspe11-2-cn-ssl.ls.apple.com/2/tiles
      style=7, v=68, size=1, scale=2, vertical_datum=wgs84
```

稳定版只保留一套国际卫星 selector，并为其补充中国大陆覆盖。当 `z/x/y` 落在中国大陆时，`satellite-route.js` 将已确认的 `style=98/v=226` 请求转换为 CN `style=7/v=68`；国外请求保持原样。这样可以避免 iOS 27 在国内进入卫星模式后将整个会话锁定到 CN 数据源。

## 与原项目的区别

对比基准为上游 [NSRingo/Maps](https://github.com/NSRingo/Maps) `main` 分支提交 [`8f2c75c`](https://github.com/NSRingo/Maps/commit/8f2c75c4daa1f6eb46f35eba354bf0cd113367d7)。上游 README 仅保留项目标题，本说明根据源码、模块和当前稳定版的实际差异生成。

| 项目 | 原项目 | 本 Fork 当前稳定版 |
| --- | --- | --- |
| iOS 27 国际卫星样式 | 未单独处理 `style=98` | 识别当前协议中的 `UNUSED_98`，对应实机 `style=98/v=226` |
| 国内外卫星共存 | 依赖 CN/XX 清单和 selector 切换 | 单国际 selector，并按瓦片坐标将中国请求路由到 CN |
| 地区切换 | 可能在卫星会话中绑定当前数据源 | 支持从国内卫星视图直接定位国外城市 |
| 中国标准地图 | 使用原项目通用 CN/国际选择 | 注入大陆限定的二维图层，并默认恢复 CN POI/反向地理编码 |
| 国外能力 | 可能随 CN 主清单减少 | 保留国际卫星、3D、Flyover、地球与 Look Around 资源 |
| GeoManifest 编码 | 原始枚举转换流程 | 保持 v6 合并流程，并仅在编码阶段保护已为数字的枚举，避免 `invalid int 32: string` |
| iOS 27 缓存 | 完整查询字符串缓存 | 增加查询参数标准化和 CN/US 清单缓存回退 |
| 清单域名 | 主要面向 `.apple.com` | 同时匹配 `gspe35-ssl.ls.apple.com` 与 `.apple.cn` |
| Egern | 原项目通用配置 | 增加可本地编辑、带参数说明的稳定 Egern 模块 |
| 多客户端发布 | 原项目模板 | 同步生成 Surge、Loon、Shadowrocket、Stash、Quantumult X 版本 |
| 历史版本 | 无本 Fork 的实验记录 | 统一保存至 `modules/archive/legacy` 和 `modules/archive/assets` |

## 实现说明

### 国际清单主体

`src/function/InternationalHybrid.mjs` 保留国际地图的卫星、3D、Flyover、地球和 Look Around 能力，再加入中国大陆限定的二维图层及服务数据。大陆图层使用区域白名单和可用瓦片范围，避免影响国外地图。

### 中国服务范围

- `CN_POI`：默认值。中国地点、POI、搜索和反向地理编码使用 CN 服务；导航由 `Directions` 决定，Egern 固定为 AutoNavi，其他客户端默认 Apple。
- `APPLE`：优先使用 Apple 国际前台服务，中国 POI 可能减少。
- `CN_FULL`：地点、导航和交通尽量使用 CN 服务，但国外服务不再保证完全国际化。

### 安全编码

iOS 27/Egern 处理混合清单时，部分枚举字段可能已经是数字。若再次反向查表，会将数字转换为枚举名称字符串，protobuf 随后报错：

```text
Error: invalid int 32: string
```

当前稳定版保留原 v6 的解码和合并行为，只在 `GEOResourceManifestDownload.encode` 阶段判断字段类型：字符串枚举转换为数字，已有数字保持不变。

## 目录结构

```text
modules/
├── README.iOS27.md
├── iRingo.Maps.yaml
├── iRingo.Maps.sgmodule
├── iRingo.Maps.plugin
├── iRingo.Maps.srmodule
├── iRingo.Maps.stoverride
├── iRingo.Maps.snippet
├── assets/
│   ├── request.bundle.js
│   ├── response.bundle.js
│   └── satellite-route.js
└── archive/
    ├── legacy/
    └── assets/
```

`modules/` 根目录只放当前稳定版；历史模块和诊断脚本仅用于对比、回归和排错，不建议日常启用。

## 主要更改文件

| 文件 | 说明 |
| --- | --- |
| `src/function/InternationalHybrid.mjs` | 国际清单主体、中国二维图层注入、CN 服务选择和路由配置 |
| `src/class/GEOResourceManifest.mjs` | CN/US 清单缓存和资源选择兼容 |
| `src/process/Request.mjs` | iOS 27 清单请求、缓存预取和 `.apple.cn` 兼容 |
| `src/process/Response.mjs` | 混合清单响应处理 |
| `modules/assets/satellite-route.js` | 根据卫星瓦片坐标选择国际或 CN 端点 |
| `modules/assets/request.bundle.js` | 当前稳定请求脚本 |
| `modules/assets/response.bundle.js` | 当前稳定响应脚本，含安全枚举编码 |
| `scripts/build-selective-hybrid-egern.mjs` | 构建 Egern v6 混合模块和稳定 bundle |
| `scripts/build-selective-hybrid-multiclient.mjs` | 生成全部代理软件的当前稳定模块 |
| `scripts/test-selective-hybrid-route-v6.mjs` | 验证中国坐标路由和海外请求保持不变 |

## 历史版本

| 版本 | 状态 | 说明 |
| --- | --- | --- |
| Selective Hybrid v1 | 归档 | 中国二维 + 国际 3D 的早期基线 |
| Mainland 3D Route v3/v5 | 归档 | 早期坐标路由实验，国际 selector 的大陆覆盖不完整 |
| Mainland 3D Native v4 | 不推荐 | CN/国际 selector 并存，会触发 iOS 27 会话绑定 |
| Mainland 3D Route v6 / module 6.3.0 | **当前稳定版** | 国内外导航和 2D 卫星、国外 3D/四处看看、国内 POI 与跨地区直接切换均已确认 |

历史文件说明见 [`modules/archive/README.md`](modules/archive/README.md)。

## 验证

```bash
node --check modules/assets/request.bundle.js
node --check modules/assets/response.bundle.js
node --check modules/assets/satellite-route.js
node scripts/test-selective-hybrid-route-v6.mjs
node scripts/test-egern-mainland-navigation.mjs
node scripts/test-egern-look-around.mjs
```

稳定版构建时还会检查：

- decode 继续将数字枚举转换为名称，以供地图样式匹配。
- encode 仅转换字符串枚举，已有数字不会再次反向查表。
- 中国大陆卫星坐标转换到 CN 主机、路径、样式和版本。
- 东京等海外坐标保持国际请求不变。

## 已知限制

- 当前只路由实机确认的 iOS 27 `style=98/v=226` 卫星请求，不猜测转换未知的 3D、夜景、模型或材质样式。
- 国内 3D 模型不是本稳定版的保证目标。
- Look Around、Flyover 和 3D 的可用城市由 Apple 决定。
- Apple 可以随时调整服务端样式、版本、覆盖范围和访问控制。
- 多个 Maps 模块同时启用会导致重复改写、标签重叠、偏移、缺图或加载缓慢。
- 更新模块后 iOS 可能继续缓存旧清单；必要时需要删除旧模块、重启代理软件或设备。

## 免责声明

- 本项目仅用于学习与技术研究，请自行承担使用风险。
- 本项目不提供、存储或分发 Apple、高德的地图数据。
- 请遵守所在地区法律法规及相关服务条款。

## 鸣谢

- [NSRingo/Maps](https://github.com/NSRingo/Maps)
- [ iRingo](https://github.com/NSRingo)
- Apple Maps 与 AutoNavi 相关服务
- 参与 iOS 27 实机测试与日志验证的用户

## 许可证

本项目继续遵循原项目的 [Apache License 2.0](LICENSE)，原作者、贡献者信息及 Git 历史均予以保留。
