# Maps iOS 27 local profiles

当前 iOS 27 会把资源清单地区同时用于地图数据集、坐标系和 3D 能力判断，因此不建议再使用 v5/v6/v7 实验性混合模块。

## 中国完整模式

`iRingo.Maps.China.Full.Local.yaml`

- 完整中国道路、POI、地点名称和 GCJ-02 坐标修正
- 高德地点与导航
- 不保证国际 Flyover/3D

## 国际 3D 模式

`iRingo.Maps.International.3D.Local.yaml`

- 国际 2D/3D 卫星、Flyover 和 Look Around
- 中国地图数据可能缺失或偏移

两个模块不能同时启用。切换模式后需要强制退出地图 App，必要时重启设备。
