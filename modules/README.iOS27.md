# Maps iOS 27 模块说明

## 推荐模块

当前推荐使用：

[`iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml`](./iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml)

远程导入地址：

```text
https://raw.githubusercontent.com/patrickyanxxxxx/Maps/main/modules/iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Local.v6.yaml
```

实机已验证：

- 中国大陆标准地图、道路、地点与 2D 卫星可显示。
- 中国大陆以外使用 Apple 国际地图和卫星数据。
- 国外 3D / Flyover 正常。
- 可以从国内卫星视图直接搜索并定位国外城市，不再要求先切换到标准地图。

## 工作方式

v6 只向 Apple 地图暴露一套国际卫星 selector，并为其补充中国大陆覆盖。国际 `style=98/v=226` 请求落在中国大陆坐标时，会转换为 CN `style=7/v=68`；国外请求保持不变。

这种方式用于规避 iOS 27 对重复 CN/国际卫星 selector 的会话级缓存和绑定。

## 推荐参数

```text
GeoManifest.Dynamic.Config.CountryCode = US
TileSet.Satellite = XX
TileSet.Flyover = XX
TileSet.Munin = XX
TileSet.Roads = XX
Hybrid.MainlandLayers = EXTENDED
Hybrid.ServiceMode = APPLE
UrlInfoSet.LocationShift = AutoNavi
```

## 其他配置

| 文件 | 用途 | 建议 |
| --- | --- | --- |
| `iRingo.Maps.iOS27.Selective-Hybrid.Local.v1.yaml` | 中国二维 + 国际 3D，不处理国内卫星路由 | 可作为回退基线 |
| `iRingo.Maps.iOS27.Selective-Hybrid.Mainland-3D.Native.Local.v4.yaml` | 并存 CN/国际 selector | 会触发切换绑定，不推荐日常使用 |
| `iRingo.Maps.China.Full.Local.yaml` | 完整 CN 优先模式 | 适合只重视中国数据时使用 |
| `iRingo.Maps.International.3D.Local.yaml` | 国际能力优先模式 | 中国数据可能缺失或偏移 |
| `iRingo.Maps.Satellite.Diagnostics.Local.v2.yaml` | 脱敏采集卫星请求 | 只在排查问题时临时启用 |

v2、v3、v5 和其他实验模块保留用于开发对比，不建议与 v6 同时启用。

## 更新模块后的操作

1. 停用并删除旧版 Selective Hybrid 模块。
2. 导入 v6，并确认只有这一份 Maps 混合模块启用。
3. 强制退出 Apple 地图和 Egern。
4. 若仍使用旧清单或旧 selector，重启设备后再测试。

更多实现细节和与上游的完整差异见仓库根目录 [`README.md`](../README.md)。
