# Three.js 光源详解

## 1. 环境光 (AmbientLight)

### 作用
- 提供全局基础照明，照亮场景中所有物体
- 没有方向性，不会产生阴影
- 用于模拟环境中的散射光，避免完全黑暗的区域

### 基本用法
```ts
const ambientLight = new THREE.AmbientLight(color, intensity);
```
- `color`: 光照颜色 (默认 0xffffff)
- `intensity`: 光照强度 (默认 1)

### 特点
- 计算成本最低
- 无方向，无衰减
- 不支持阴影
- 适合作为基础照明

### 注意事项
- 强度不宜过高，否则场景会显得平淡
- 通常配合其他光源使用
- 过度依赖会导致缺乏立体感

---

## 2. 平行光 (DirectionalLight)

### 作用
- 模拟无限远的光源（如太阳光）
- 光线平行照射，强度不随距离衰减
- 支持阴影投射

### 基本用法
```ts
const directionalLight = new THREE.DirectionalLight(color, intensity);
```
- `color`: 光照颜色 (默认 0xffffff)
- `intensity`: 光照强度 (默认 1)

### 特点
- 有方向性，无衰减
- 支持阴影
- 适合模拟太阳光
- 需要设置 position 和 target

### 注意事项
- 通过 position 和 target 控制光照方向
- 阴影计算成本较高
- 适合户外场景

---

## 3. 半球光 (HemisphereLight)

### 作用
- 模拟天空和地面的反射光
- 上半球和下半球可以设置不同颜色
- 提供更自然的环境照明

### 基本用法
```ts
const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
```
- `skyColor`: 天空颜色 (默认 0xffffff)
- `groundColor`: 地面颜色 (默认 0x000000)
- `intensity`: 光照强度 (默认 1)

### 特点
- 有方向性（上下方向）
- 无衰减
- 不支持阴影
- 适合户外环境光

### 注意事项
- 只影响漫反射，不影响镜面反射
- 适合作为环境光替代方案
- 能提供更自然的色彩过渡

---

## 4. 点光源 (PointLight)

### 作用
- 从一个点向四周发光
- 模拟灯泡、蜡烛等点状光源
- 光强随距离衰减

### 基本用法
```ts
const pointLight = new THREE.PointLight(color, intensity, distance, decay);
```
- `color`: 光照颜色 (默认 0xffffff)
- `intensity`: 光照强度 (默认 1)
- `distance`: 光照距离 (默认 0，表示无限)
- `decay`: 衰减系数 (默认 2)

### 特点
- 全方向发光
- 支持距离衰减
- 支持阴影
- 适合室内光源

### 注意事项
- 距离衰减影响性能
- 阴影计算成本较高
- 适合模拟点状光源

---

## 5. 聚光灯 (SpotLight)

### 作用
- 从一个点向特定方向发射锥形光束
- 模拟手电筒、舞台灯光等
- 支持光束角度和边缘柔化

### 基本用法
```ts
const spotLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
```
- `color`: 光照颜色 (默认 0xffffff)
- `intensity`: 光照强度 (默认 1)
- `distance`: 光照距离 (默认 0，表示无限)
- `angle`: 光束锥角 (默认 Math.PI/3)
- `penumbra`: 半影区域 (0-1，默认 0)
- `decay`: 衰减系数 (默认 2)

### 特点
- 有方向性和锥形限制
- 支持距离衰减
- 支持阴影
- 可调节光束边缘柔化

### 注意事项
- 需要设置 target 控制照射方向
- 阴影计算成本高
- 适合局部重点照明

---

## 6. 矩形区域光 (RectAreaLight)

### 作用
- 从矩形平面均匀发光
- 模拟荧光灯、LED面板、摄影棚补光灯
- 提供柔和的面光源效果

### 基本用法
```ts
const rectAreaLight = new THREE.RectAreaLight(color, intensity, width, height);
```
- `color`: 光照颜色 (默认 0xffffff)
- `intensity`: 光照强度 (默认 1)
- `width`: 矩形宽度
- `height`: 矩形高度

### 特点
- 面光源，照明更柔和
- 无衰减
- 不支持阴影
- 只对标准材质和物理材质有效

### 注意事项
- 仅支持 MeshStandardMaterial 和 MeshPhysicalMaterial
- 不支持基础材质
- 计算成本相对较高
- 适合摄影棚效果

---

## 性能对比

### 从高到低排序
1. **环境光** - 最低成本
   - 简单颜色叠加
   - 无复杂计算

2. **半球光** - 低成本
   - 简单的方向性计算
   - 无衰减和阴影

3. **平行光** - 中等成本
   - 方向性计算
   - 可选阴影计算

4. **矩形区域光** - 中高成本
   - 面光源采样计算
   - 仅支持特定材质

5. **点光源** - 高成本
   - 距离衰减计算
   - 阴影贴图计算

6. **聚光灯** - 最高成本
   - 锥形区域计算
   - 距离衰减
   - 阴影贴图计算

### 优化建议
- 使用环境光作为基础照明
- 限制动态光源数量
- 合理设置光照距离
- 谨慎使用阴影
- 根据场景需求选择合适光源

### 使用场景推荐
- **户外场景**: 环境光 + 平行光 + 半球光
- **室内场景**: 环境光 + 点光源 + 矩形区域光
- **舞台效果**: 环境光 + 聚光灯
- **摄影棚**: 环境光 + 矩形区域光
