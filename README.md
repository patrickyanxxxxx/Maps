#  iRingo Maps — iOS 27 中国/国际混合地图

本仓库是 [NSRingo/Maps](https://github.com/NSRingo/Maps) 的个人 Fork，针对 iOS 27 上 Apple 地图资源清单、卫星瓦片样式和区域选择行为进行了适配。

项目的当前目标是：在同一份 Egern 本地模块中，让中国大陆继续使用适合国内坐标和数据环境的地图内容，同时保留中国大陆以外的 Apple 国际卫星、3D、Flyover 与 Look Around 能力。

> 本项目不是 Apple、高德或 NSRingo 的官方项目。Apple 地图服务能力、覆盖范围和接口版本可能随系统及服务器端配置变化。

## 当前推荐版本

### Selective Hybrid Mainland 3D Route Local v6

[点击导入 Egern 本地模块](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.yaml)

其他代理软件：

| 客户端 | 模块 |
| --- | --- |
| Surge | [`iRingo.Maps.sgmodule`](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.sgmodule) |
| Loon | [`iRingo.Maps.plugin`](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.plugin) |
| Shadowrocket | [`iRingo.Maps.srmodule`](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.srmodule) |
| Stash | [`iRingo.Maps.stoverride`](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.stoverride) |
| Quantumult X | [`iRingo.Maps.snippet`](https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.snippet) |

已经在 iOS 27 实机验证：

| 地区 | 标准地图 | 卫星地图 | 3D / Flyover | Look Around |
| --- | --- | --- | --- | --- |
| 中国大陆 | 中国地图图层、道路、地点和坐标修正 | 高德/CN 2D 卫星可显示 | 国内 3D 不作为本版本保证目标 | 使用国际能力，实际可用性取决于 Apple 覆盖 |
| 中国大陆以外 | Apple 国际数据 | Apple 国际卫星 | Apple 国际 3D / Flyover 正常 | Apple 国际数据 |

v6 的重点不是同时向地图 App 暴露两套卫星选择器，而是只保留一套国际选择器，再按瓦片坐标把中国大陆卫星请求转换到 CN 端点。这样可以避免 iOS 27 将当前会话永久绑定到国内卫星源，解决“必须先切回标准地图，移动到国外后再进入 3D”的问题。

## 安装方式

1. 在 Egern 中停用或删除旧的 Maps 混合模块，尤其是 v3、v4、v5 和卫星诊断模块。
2. 导入上方 v6 本地模块。
3. 保持推荐参数：

   - `GeoManifest.Dynamic.Config.CountryCode: US`
   - `TileSet.Satellite: XX`
   - `TileSet.Flyover: XX`
   - `TileSet.Munin: XX`
   - `TileSet.Roads: XX`
   - `Hybrid.MainlandLayers: EXTENDED`
   - `Hybrid.ServiceMode: APPLE`
   - `UrlInfoSet.LocationShift: AutoNavi`

4. 只启用一份 Selective Hybrid 模块。
5. 强制退出 Apple 地图和 Egern。首次更换资源清单时建议重启设备，以清除 iOS 缓存的 GeoManifest 和卫星选择状态。

本版本是本地可编辑 Egern 模块，不依赖 Cloudflare Worker。仓库中的 Worker 支持仅作为可选部署方式保留。

## 与原项目的主要区别

对比基准为原仓库 `NSRingo/Maps` 的 `main` 分支（对比时上游提交 `8f2c75c`）。本 Fork 保留原项目的请求/响应处理、资源清单解码、参数系统和多代理客户端模板，并增加以下内容：

| 项目 | 原项目 | 本 Fork |
| --- | --- | --- |
| iOS 27 新卫星样式 | 主要按旧版命名样式选择，例如 `RASTER_SATELLITE` | 识别 iOS 27 国际卫星 `style=98`（当前协议枚举名为 `UNUSED_98`） |
| 中国/国际卫星共存 | 传统 CN/XX selector 替换或并存 | 单国际 selector + 中国大陆坐标路由，避免会话绑定 |
| 已确认的瓦片转换 | 无专门转换 | `98/226 → 7/68`，并转换主机、路径和必要参数 |
| 中国覆盖 | 依赖原始国际清单范围 | 给国际卫星 selector 补充大陆覆盖，使地图能够实际发出国内请求 |
| 国外 3D | 可能受 CN 清单或 selector 选择影响 | 国际 3D、Flyover、地球和 Look Around 资源保持国际版 |
| Egern 使用方式 | 以通用模块和 Worker 模板为主 | 增加参数化、可直接导入的 iOS 27 本地模块 |
| 清单缓存 | 使用完整查询字符串作为缓存键 | 对 iOS 27 新增或重排的查询参数进行标准化回退 |
| Apple 清单域名 | 主要处理 `.apple.com` | 同时处理 `gspe35-ssl.ls.apple.com` 与 `.apple.cn` |
| 调试 | 通用日志 | 增加脱敏的卫星请求诊断模块和可重复的路由测试 |

## 核心实现

### 1. 国际资源清单作为主体

`src/function/InternationalHybrid.mjs` 以国际清单作为卫星、3D、Flyover、地球和 Look Around 能力的主体，只按需加入中国大陆二维地图图层与服务数据。

这避免了以 CN 清单作为主体时，国际 3D selector、覆盖元数据或 Munin 数据被裁掉的问题。

### 2. 单一卫星选择器

iOS 27 会在进入卫星/3D 模式时缓存所选 selector。若清单中同时存在国内和国际两套重复能力，地图可能在中国进入 3D 后一直锁定 CN 数据源，即使随后搜索东京等国外城市也不会重新选择国际源。

v6 因此不再插入第二套 CN 卫星 selector。它保留国际 `style=98` selector，并为它补充中国大陆的 `availableTiles` 覆盖，同时清除只允许特定国家使用的限制。

### 3. 按瓦片坐标路由

`modules/assets/satellite-route.js` 根据 `z/x/y` 判断请求是否位于中国大陆：

```text
国际请求
gspe11-ssl.ls.apple.com/tile
style=98, v=226

中国大陆坐标时转换为
gspe11-2-cn-ssl.ls.apple.com/2/tiles
style=7, v=68, size=1, scale=2, vertical_datum=wgs84
```

同时删除国际端点使用、但 CN 端点不需要的 `region` 与 `h` 参数。`z/x/y`、`preflight` 和临时授权参数保持不变。

中国大陆以外的请求不做修改，因此东京等海外城市继续访问 Apple 国际卫星端点。

目前只转换实机日志已经确认的 `style=98`。其他 iOS 27 新样式不会被批量猜测转换，以避免误伤 Flyover、夜景、模型或材质资源。

### 4. 中国地图与服务隔离

混合逻辑区分地图图层与前台服务：

- `Hybrid.MainlandLayers=EXTENDED`：加入较完整的中国二维道路、建筑、POI、标签、交通和卫星相关图层。
- `Hybrid.MainlandLayers=CORE`：仅保留标准地图、建筑、POI 和地标，用于排查重复标签等问题。
- `Hybrid.ServiceMode=APPLE`：国外服务最完整，也是当前推荐默认值。
- `Hybrid.ServiceMode=CN_POI`：中国地点与反向地理编码使用 CN 服务，导航仍使用 Apple。
- `Hybrid.ServiceMode=CN_FULL`：地点、反向地理编码、导航和交通尽量使用 CN 服务，但国外体验不再保证完全国际化。

### 5. 缓存和系统兼容

本 Fork 还增加了：

- iOS 27 GeoManifest 查询参数标准化缓存键。
- `.apple.cn` 清单域名支持。
- GeoManifest 响应禁用缓存，方便本地模块更新后尽快生效。
- 独立的 Egern 构建脚本和稳定配置生成脚本。
- Cloudflare Worker 独立构建入口及相关客户端模板。

## 主要新增和修改文件

| 路径 | 用途 |
| --- | --- |
| `src/function/InternationalHybrid.mjs` | 中国二维数据与国际 3D 的选择性合并、卫星路由配置和大陆覆盖扩展 |
| `modules/iRingo.Maps.yaml` | 当前推荐的 Egern 本地模块 |
| `modules/iRingo.Maps.sgmodule` | Surge 模块 |
| `modules/iRingo.Maps.plugin` | Loon 插件 |
| `modules/iRingo.Maps.srmodule` | Shadowrocket 模块 |
| `modules/iRingo.Maps.stoverride` | Stash 覆写 |
| `modules/iRingo.Maps.snippet` | Quantumult X 片段 |
| `modules/assets/satellite-route.js` | iOS 27 卫星瓦片坐标识别与 CN 路由 |
| `modules/assets/request.bundle.js` | 当前稳定请求处理 bundle，内置 v6 默认参数 |
| `modules/assets/response.bundle.js` | 当前稳定资源清单响应处理 bundle，内置 v6 默认参数 |
| `scripts/build-selective-hybrid-egern.mjs` | 生成 Selective Hybrid 本地模块和 bundle |
| `scripts/test-selective-hybrid-route-v6.mjs` | 回放中国与东京卫星请求，验证路由边界 |
| `src/class/GEOResourceManifest.mjs` | iOS 27 缓存兼容及国际 3D/Look Around 资源选择 |
| `src/process/Request.mjs` / `Response.mjs` | `.apple.com`、`.apple.cn` 清单请求与响应兼容 |
| `modules/archive/assets/diagnose.satellite-requests.v2.js` | 已归档的脱敏卫星请求诊断脚本 |

## 版本说明

| 版本 | 状态 | 说明 |
| --- | --- | --- |
| Selective Hybrid v1 | 保留 | 中国二维 + 国际 3D，不保留国内卫星路由；早期稳定基线 |
| Mainland 3D Route v3/v5 | 实验记录 | 完成早期坐标路由和 `style=98` 映射，但未解决国际 selector 的中国覆盖限制 |
| Mainland 3D Native v4 | 不推荐 | 国内卫星/3D selector 可用，但会触发 iOS 27 会话绑定，直接切换国外不可靠 |
| Mainland 3D Route v6 | **当前推荐** | 国内外卫星均可显示，国外 3D 正常，支持从国内直接定位国外城市 |

旧版本保留在仓库中用于对比和回归测试，不建议同时启用。

## 验证

路由测试使用两类实机请求：

- 中国大陆坐标必须转换为 CN 主机、路径、样式和版本。
- 东京坐标必须保持原始国际请求不变。

本地验证命令：

```bash
node --check modules/assets/satellite-route.js
node scripts/test-selective-hybrid-route-v6.mjs
```

## 已知限制

- 当前已确认并路由的是 iOS 27 `style=98` 的二维卫星瓦片；国内 3D 模型不是 v6 的保证范围。
- Apple 可能通过服务端清单改变样式、版本号、覆盖范围或访问控制，届时需要重新采集脱敏诊断日志。
- Look Around、Flyover 和 3D 的实际覆盖范围由 Apple 决定，模块只能保留能力，不能为没有数据的地区创建内容。
- 多个 Maps 模块同时启用会重复修改同一份清单，容易产生缺图、重复标签、偏移或加载缓慢。
- 更换配置后，iOS 可能继续使用已缓存的 GeoManifest 或 selector；必要时需要重启设备。

## 上游、署名与许可证

- 上游项目：[NSRingo/Maps](https://github.com/NSRingo/Maps)
- Fork：[patrickyanxxxxx/Maps](https://github.com/patrickyanxxxxx/Maps)
- 原项目作者与贡献者信息继续保留在模块、源码和 Git 历史中。
- 本仓库继续遵循原项目的 [Apache License 2.0](LICENSE)。
