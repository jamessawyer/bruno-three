# Ch08 — BufferGeometry 与自定义几何体

## 思维导图

```mermaid
mindmap
  root((BufferGeometry))
    核心概念
      什么是 BufferGeometry
      顶点(Vertex)
      面(Face) = 三角形
      GPU 友好的数据结构
    属性 Attributes
      position 位置
      normal 法线
      uv 纹理坐标
      index 索引
    BufferAttribute
      Float32Array 类型化数组
      itemSize 每个顶点的分量数
      setAttribute 绑定属性
    创建自定义几何体
      手动填充顶点数组
      随机三角形
      count * 3 * 3
    内置几何体
      BoxGeometry
      SphereGeometry
      PlaneGeometry
      ConeGeometry
      TorusGeometry
      widthSegments 细分
    wireframe 线框模式
      调试几何体结构
      查看三角形面片
    性能考量
      共享顶点与索引
      内存布局优化
```

---

## 1. 什么是 BufferGeometry

`BufferGeometry` 是 Three.js 中所有几何体的基类。它使用 **类型化数组（TypedArray）** 存储顶点数据，直接映射到 GPU 缓冲区，因此渲染效率极高。

所有内置几何体（`BoxGeometry`、`SphereGeometry` 等）都继承自 `BufferGeometry`。

---

## 2. 创建自定义几何体

项目中通过手动创建随机三角形来演示 BufferGeometry 的原理：

```ts
// 来自 ch08/src/main.ts
const geometry = new T.BufferGeometry();

const count = 50; // 50 个三角形
// 每个三角形 3 个顶点，每个顶点 3 个坐标(x,y,z)
const positionArray = new Float32Array(count * 3 * 3);

for (let i = 0; i < count * 3 * 3; i++) {
  positionArray[i] = Math.random() - 0.5; // [-0.5, 0.5]
}

// itemSize=3 表示每 3 个数组成一个顶点坐标
const positionAttribute = new T.BufferAttribute(positionArray, 3);

// "position" 是着色器中预定义的属性名
geometry.setAttribute("position", positionAttribute);
```

### 理解 Float32Array 的数据布局

```
索引:  [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  ...
含义:   x1   y1   z1   x2   y2   z2   x3   y3   z3  ...
        ─── 顶点1 ───  ─── 顶点2 ───  ─── 顶点3 ───
        ─────────────── 三角形1 ──────────────────────
```

- **每 3 个数** = 一个顶点 (x, y, z)
- **每 3 个顶点** = 一个三角形
- **50 个三角形** = 50 × 3 × 3 = 450 个浮点数

### 为什么使用 Float32Array 而不是普通数组？

| 特性 | `Array` | `Float32Array` |
|------|---------|---------------|
| 内存布局 | 非连续，每个元素是装箱的对象 | 连续内存，每个元素固定 4 字节 |
| GPU 传输 | 需要转换 | 可直接上传到 GPU |
| 类型安全 | 可以混合类型 | 严格的 32 位浮点数 |
| 性能 | 慢 | 快 |

---

## 3. BufferAttribute 详解

`BufferAttribute` 将一维类型化数组解释为结构化的顶点数据。

```ts
new T.BufferAttribute(array, itemSize);
```

- **array**: `Float32Array`（或 `Uint16Array` 等）
- **itemSize**: 每个逻辑元素有几个分量

| 属性名 | itemSize | 含义 |
|--------|----------|------|
| `position` | 3 | (x, y, z) 顶点位置 |
| `normal` | 3 | (nx, ny, nz) 法线方向 |
| `uv` | 2 | (u, v) 纹理坐标 |
| `color` | 3 | (r, g, b) 顶点颜色 |

---

## 4. 内置几何体与细分段数

Three.js 提供了丰富的内置几何体，其构造函数通常支持 segments（细分段数）参数：

```ts
new T.BoxGeometry(
  1, 1, 1,    // width, height, depth
  2, 2, 2     // widthSegments, heightSegments, depthSegments
);
```

### 细分段数的影响

| 段数 | 三角形数（一个面） | 效果 |
|------|-------------------|------|
| 1 | 2 | 粗糙的平面 |
| 10 | 200 | 平滑，适合 displacement |
| 100 | 20,000 | 非常细腻但性能消耗大 |

> **应用场景**：使用高度贴图（displacementMap）时需要足够多的细分段数，否则位移效果看起来像折叠的纸板。但过度细分会严重影响性能，需要根据视觉需要找到平衡点。

---

## 5. wireframe 线框模式

`wireframe: true` 让材质以线框模式渲染，每个三角形只画出边线，方便调试几何体结构。

```ts
const material = new T.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
```

> **发散思考**：在生产项目中，wireframe 模式除了调试外，还可以作为一种艺术风格。配合后期处理（如 bloom 发光），可以创造出科幻风格的线框场景。

---

## 6. 常见内置几何体一览

| 几何体 | 形状 | 典型参数 |
|--------|------|---------|
| `BoxGeometry` | 长方体 | width, height, depth |
| `SphereGeometry` | 球体 | radius, widthSegments, heightSegments |
| `PlaneGeometry` | 平面 | width, height |
| `ConeGeometry` | 圆锥 | radius, height, radialSegments |
| `CylinderGeometry` | 圆柱 | radiusTop, radiusBottom, height |
| `TorusGeometry` | 圆环(甜甜圈) | radius, tube, radialSegments, tubularSegments |
| `TorusKnotGeometry` | 环面结 | radius, tube, tubularSegments, radialSegments |
| `RingGeometry` | 圆环面 | innerRadius, outerRadius |
| `CircleGeometry` | 圆形面 | radius, segments |

---

## 7. 性能优化：索引几何体

当多个三角形共享顶点时（如立方体的 8 个角被多个面共享），使用索引可以大幅减少数据量。

```ts
// 无索引：6个面 × 2个三角形 × 3个顶点 = 36 个顶点
// 有索引：只需 8 个唯一顶点 + 36 个索引

geometry.setIndex(new T.BufferAttribute(indices, 1));
```

Three.js 的内置几何体默认使用索引几何体（Indexed Geometry）。

> **发散思考**：在处理大型地形、粒子系统或程序化生成的几何体时，手动创建 BufferGeometry 是必不可少的技能。结合 Web Worker 可以在后台线程中计算顶点数据，避免阻塞主线程。

---

## 8. 相关面试/思考题

1. **`setAttribute("position", ...)` 中的 `"position"` 字符串是随意的吗？** 不是。`"position"` 是 GLSL 顶点着色器中预定义的属性名，Three.js 的默认着色器会读取这个名字。自定义名称需要自定义着色器。
2. **如何在运行时动态修改几何体的顶点？** 直接修改 `geometry.attributes.position.array` 中的值，然后设置 `geometry.attributes.position.needsUpdate = true`。
3. **为什么 Three.js 移除了旧版的 `Geometry` 类？** 旧版 `Geometry` 使用 JavaScript 对象存储顶点数据，在上传到 GPU 时需要转换，性能低下。`BufferGeometry` 直接使用类型化数组，避免了这个转换开销。
