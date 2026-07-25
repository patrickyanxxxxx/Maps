# Maps International-All Test v3（当前：test25）

这是与 `test/international-all-v2` 并行的独立测试线，基于 test19（`e3f6c3f`）的代码继续修改。目标不变：国内标准地图 POI 完整且道路/POI 不偏移；国内卫星图影像/道路/POI/定位对齐、导航正常；国外标准地图 POI 完整、3D 卫星、四处看看与导航正常。

## test25-cache-proof-versioning（当前版本）

test24 实机反馈：请求记录里挂着 `Maps.InternationalAllV3.satellite-route.request` 规则名，但既无 `SatRoute` 日志也无改写，大陆 style=7 请求原样直发。已排除逻辑问题（同一 URL 在本地脚本中改写正确），且档案中当年实机可用的 v6 本地模块用的是完全相同的 `$done({url})` 机制——最自洽的解释是 **Egern 按 URL 路径缓存脚本体，`?v=` 查询参数变化不触发重新下载**：设备一直在执行 test20 时代的旧脚本（只匹配 style=98、无日志），遇到 style=7 静默放行，与观察完全一致。

test25 应对与自证：

- 路由脚本改名为 `satellite-route.v25.js`（URL 路径变化强制重新下载），规则名同步改为 `satellite-route.v25.request`；今后每次修改路由脚本都随版本改名。
- 地图左下角注释改为 ` iRingo: 📍 adaptive hybrid test.25`——把地图缩到最小即可确认设备用的清单版本，不再依赖日志。
- 路由逻辑与 test23/24 相同（style=98/7 大陆坐标 → CN 端点），决策日志保留（前缀 `[iRingo SatRoute test.25]`；注意 console.log 输出在 Egern 的“日志”面板，不在请求记录里）。

## test24-observable-satellite-route（已被 test25 继承）

test23 实机反馈：仍无 `gspe11-2-cn-ssl` 请求、大陆 `style=7` 请求原样发到国际端点。但把反馈中的失败 URL（z=15, x=25859, y=13463 → z8 折算 (202,105)，命中大陆网格）直接输入 test23 路由脚本，**它会被正确改写**——结论：设备当时执行的不是 test23 脚本（Egern 模块/脚本缓存未刷新，或脚本拉取失败被静默跳过）。

test24 不改路由逻辑，把脚本改造成**自证**：每个请求都输出一行决策日志（`rewrite` / `pass (foreign)` / `pass (style=…)` / `pass (bad coords)`），前缀 `[iRingo SatRoute test.24]`。在 Egern 日志里搜索该前缀：

- **搜不到** → 脚本根本没被执行（模块未更新/脚本拉取失败/规则未命中），问题在安装链路而不是逻辑；
- **看到 `rewrite` 行但没有 `gspe11-2-cn` 连接** → 改写结果被 Egern 丢弃，问题在客户端行为；
- **看到 `pass` 行** → 逻辑分支判断有误，按日志内容修。

## test23-satellite-style7-cn-roads（已被 test24 继承）

test22 实机结果：国外四处看看/3D 依旧正常；国内标准地图道路与 POI 漂移、卫星模式不贴合仍在——但 Egern 连接日志（2026-07-26 03:13-03:19）首次给出了直接证据：

1. **清单身份链路正常**：设备 CN 请求被正确改写为 US 上网（85 KB 原始 US 清单 + 83 KB CN 预热 → 交付 343 KB 混合清单）。
2. **国内标准地图两帧混画**：`gspe19-cn-ssl`（CN 图层，42 KB↓）与 `gspe19-ssl`（国际图层，65 KB↓）同时供图。国际流量来自被 test19 保持国际的道路能力样式——GCJ 偏移的国际中国道路叠在 CN 底图上。
3. **国内卫星请求实际失败**：geod 对大陆卫星发出 `gspe11-ssl/tile?style=7&v=10421`（国际 RASTER_SATELLITE 选择器）而非预期的 style=98，全部失败（0 KB）；路由脚本只匹配 98，从未触发（日志中无 `gspe11-2-cn` 卫星请求）。另见 style=100/v=226 大陆请求返回 200/223B 空响应（暂不路由，映射未确认）。

test23 按证据修两处：

- `satellite-route.js` 同时改写大陆 style=98 和 style=7 请求 → CN `style=7/v=68/size=1/scale=2`（保留 accessKey，去掉 region/h）。
- 恢复大陆限定的 CN `VECTOR_ROADS` 注入（稳定版同款；稳定版含此图层且四处看看正常）。`VECTOR_ROAD_NETWORK/VECTOR_ROAD_SELECTION/VECTOR_SPR_ROADS` 继续保持国际，保护 Munin/四处看看链。

## test22-mainland-first-order（已被 test23 继承）

test21 实机结果：`Hybrid.MainlandWhitelist` × `UrlInfoSet.LocationShift` 的 **2×2 四种组合结果完全相同**——卫星模式道路+底图偏移、标准地图道路偏移、POI 正常。结论：白名单标记和定位修正服务都不是坐标解释的开关，"混合身份"假设被实验排除。

复盘完整迭代史后发现一条强相关线索：

- 稳定版与上游项目把大陆图层**放在 tileSet 数组开头**（prepend），那个时期国内标准地图正常；
- test8 为保护国际 3D 组索引改为**追加到数组末尾**（append），紧接着的实机反馈就是"国内标准地图偏移了"，此后 append 结构贯穿 test8→test21，道路漂移也贯穿始终；
- 推断：iOS 27 按 tileSet 顺序解析同 style 描述符。国际 TomTom 版中国道路（几何自带 GCJ 偏移、按国际语义渲染）排在前面，把注入的高德图层挡住了；POI 正常是因为国际清单的中国 POI 稀疏、系统落回 CN POI 描述符。这同时解释卫星模式：影像来自 CN 端点、道路覆盖层却是国际数据，两帧错开。

test22 只改一件事（单变量实验）：**大陆图层移到 tileSet 数组最前**，全部原生组引用整体平移一个常量偏移（相对顺序与 identifier 逐字保留——不同于 test8 当年出问题的"重建索引"；稳定版同为 prepend 且国际 3D 正常，风险有先例背书）。组内引用顺序保持 test19 的"国际能力优先"，不改动已正常的国外侧。test21 的两个诊断开关保留。

## test21-uniform-coordinate-identity（已被 test22 继承）

test20 实机结果：**国外四处看看、3D 卫星、导航全部正常**（国际主组 + 单卫星选择器机制成立）；国内标准地图道路偏移、国内卫星模式影像/道路/POI/定位偏移仍在。

对 test16→test20 的证据复盘发现一个从未测过的状态：

| 版本 | 大陆道路图层白名单 | 大陆 POI 图层白名单 | 实机结果 |
| --- | --- | --- | --- |
| test16 | 原生 | 强制 CN | POI 对齐、道路漂移 |
| test17 | 强制 CN | 强制 CN | 仍漂移（当时 POI 资源重映射尚未就位） |
| test18~20 | 原生 | 强制 CN | POI 对齐、道路漂移 |
| test21 | 统一（NATIVE/CN 可切换） | 同左 | 2×2 四组合结果相同，假设排除 |

test21 保留的两个诊断开关：

- `Hybrid.MainlandWhitelist`：`NATIVE`（默认，全部大陆图层保留原生白名单）/ `CN`（全部统一标记 countryCode=CN）。
- `UrlInfoSet.LocationShift`：`AutoNavi`（默认，定位点 GCJ-02 修正）/ `Apple`（不修正）。

### 验证清单是否真正刷新

切换参数或更新模块后，把地图缩到最小，看左下角注释 ` iRingo: 📍 adaptive hybrid` 下方的时间戳是否更新为最近时间。若时间戳不变，说明 geod 仍在使用缓存清单，测试结果不反映新配置；强退地图与 Egern，必要时重启设备。

## test20-proven-satellite-route 的设计依据（已由 test21/22 继承）

19 轮实机迭代已确认的约束：

1. iOS 27 只激活清单中第一个/主服务组；国外功能正常的前提是国际主组 + `regulatoryRegionId=0`（test18 反例：主组指向 CN 监管元数据后，全球只剩国内卫星、四处看看消失）。
2. CN 主体方案（test14/15）会让国外变全局高德、无国际卫星、四处看看只剩图标。
3. test17 的「CN/国际双卫星描述符 + 覆盖互斥」**没能**解决卫星模式跨区锁定：从国内卫星直接移动到国外仍不加载，必须先切标准地图。
4. 稳定版 v6.4.0 的「单一国际卫星选择器（style 98）+ 大陆瓦片坐标请求改写（→ CN style 7/v68）」是唯一实机验证过「国内外卫星共存 + 跨区直切」的机制。

因此 test20 = test19 的清单结构 + 稳定版已验证的卫星机制 + 与稳定版一致的 US 请求身份：

| 子系统 | test19 | test20 |
| --- | --- | --- |
| 卫星描述符 | CN 原生卫星（大陆覆盖）+ 国际卫星（扣除大陆），双选择器 | **只保留国际卫星链**，清单中不含任何 CN 卫星描述符 |
| 大陆卫星影像 | 期望 iOS 按覆盖选择 CN 描述符 | style=98 选择器补充大陆 z8+ 覆盖；`satellite-route.js` 把大陆坐标的 style=98 请求改写到 `gspe11-2-cn-ssl`（style=7/v=68） |
| 请求身份 | `CountryCode=CN`（CN 身份 + US 内容错位） | **`CountryCode=US`**：请求改写为 US、US 清单为 body、CN 清单缓存预热，与稳定版一致 |
| 主组/监管身份 | 国际主组、`regulatoryRegionId=0` | 不变 |
| 国内标准地图/POI/交通 | CN 图层区域化注入 + 高德服务 | 不变 |
| 四处看看/3D | 国际链逐字保留 | 不变 |
| 导航 | 高德 Directions/ETA | 不变 |

已知代价：国内卫星影像走 CN style=7/v=68 端点，为较旧版本；这是目前唯一实机验证可用的国内卫星来源组合。

## 文件

- `iRingo.Maps.yaml`：Egern 主测试模块（默认 `CountryCode=US`，含卫星路由脚本规则与 `gspe11-ssl` MITM）。
- `iRingo.Maps.sgmodule`：Surge 兼容模块，同一策略。
- `assets/request.bundle.js`：完整清单请求管线；US 身份下自动预热 CN 清单缓存。
- `assets/response.bundle.js`：test20 合并逻辑（自检断言会在结构不符时抛错）。
- `assets/satellite-route.js`：大陆卫星坐标路由脚本；test23 起同时改写 style=98 与 style=7 请求。

## 验证

```bash
node --check modules/test/international-all-v3/assets/response.bundle.js
node --check modules/test/international-all-v3/assets/request.bundle.js
node --check modules/test/international-all-v3/assets/satellite-route.js
node scripts/test-international-all-v3.mjs
```

`scripts/test-international-all-v3.mjs` 除合成夹具外，还会在 `/tmp/maps-cn.json`、`/tmp/maps-us.json`（实机解码清单）存在时对真实数据跑全量断言：无 CN 卫星描述符、style=98 含大陆路由覆盖且原始覆盖逐字保留、国际 Munin/SPR 逐字保留、高德服务与 GCJ-02 修正就位、CN POI 资源文件索引重映射正确、主组监管身份为 0、组引用索引合法；并验证路由脚本对北京坐标改写、东京坐标与 Sputnik 请求放行。

## 实机测试步骤

1. Egern 只启用本目录模块（停用稳定版与 v2 测试模块），导入地址：
   `https://raw.githubusercontent.com/patrickyanxxxxx/Maps/test/international-all-v3/modules/test/international-all-v3/iRingo.Maps.yaml`
2. 强制退出 Apple 地图与 Egern 后重新打开；首次加载需分别取得 US 与 CN 清单缓存（可先打开地图等待十几秒再操作）。
3. 依次验证：
   - 国内标准地图：道路/POI/定位对齐，POI 完整，导航可用；
   - 国内卫星：影像加载（旧版影像）、道路与 POI 对齐、定位点位置正确；
   - 卫星模式下直接搜索并定位东京等国外城市（不先切标准地图）；
   - 国外：标准地图 POI、2D/3D 卫星、Flyover、四处看看进入实景、导航。
4. 若出现异常，把 `LogLevel` 改为 `DEBUG` 并抓取 Egern 日志中 `[iRingo Maps International-All Test v3 test.20]` 行与失败瓦片请求的 host/query。

## 与 v2 测试线的关系

本目录/分支独立于 `modules/test/international-all-v2` 与其分支，二者不要同时启用。v2 线的历史与结论见 [`../international-all-v2/README.md`](../international-all-v2/README.md)。
