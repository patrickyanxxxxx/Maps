# Maps International-All Test v3（test20）

这是与 `test/international-all-v2` 并行的独立测试线，基于 test19（`e3f6c3f`）的代码继续修改。目标不变：国内标准地图 POI 完整且道路/POI 不偏移；国内卫星图影像/道路/POI/定位对齐、导航正常；国外标准地图 POI 完整、3D 卫星、四处看看与导航正常。

## test20-proven-satellite-route 的设计依据

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
- `assets/satellite-route.js`：与稳定版逐字一致的大陆卫星坐标路由脚本。

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
