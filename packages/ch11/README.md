## 为什么需要设置colorSpace

```typescript
const textureLoader = new T.TextureLoader();
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");

doorColorTexture.colorSpace = T.SRGBColorSpace;
```

`colorSpace = T.SRGBColorSpace` 的作用是告诉 Three.js 这两张纹理图片使用的是 **sRGB 色彩空间**，从而确保最终渲染出的颜色正确、不发白。

### 为什么需要设置 sRGB？

1. **图片的固有属性**：普通的彩色图片（如 `color.jpg` 或 `matcap.png`）为了在标准显示器上看起来色彩正常，在保存时都经过了 Gamma 校正，属于 **sRGB 色彩空间**。
2. **物理正确的渲染**：Three.js 的底层渲染引擎在进行光照、阴影和颜色混合计算时，必须在**线性色彩空间 (Linear Space)** 中进行，才能得到符合真实物理规律的结果。
3. **自动色彩转换**：当你标记 `T.SRGBColorSpace` 时，Three.js 会在内部将这张图从 sRGB 解码为线性颜色进行渲染计算，最后输出到屏幕时再统一转回 sRGB。**如果不设置，Three.js 会把 sRGB 图片误当成线性数据处理，导致模型颜色看起来发白、偏灰或褪色。**

### 哪些贴图需要设置，哪些不需要？

在 PBR 材质工作流中，必须严格区分贴图的作用：

- **必须设置为 sRGB (`T.SRGBColorSpace`)**：
  - 代表我们眼睛直接看到的“颜色”的贴图。
  - 例如：`map` (颜色/基础色)、`matcap` (材质捕获)、`emissiveMap` (发光贴图)。

- **必须保持默认（Linear 线性空间）**：
  - 代表“物理数据”或“几何数据”的贴图。这些图片中的像素值是数学参数（如 0.8 代表 80% 粗糙度），不能进行色彩空间的 Gamma 转换。
  - 例如：`normalMap` (法线)、`roughnessMap` (粗糙度)、`metalnessMap` (金属度)、`ambientOcclusionMap` (AO)、`heightMap` (高度)。

## 什么是matcap? 以及和map的区别是什么

```typescript
/**
 * 纹理
 */
const textureLoader = new T.TextureLoader();
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");

/** MeshBasicMaterial 基础材质 */
const material = new T.MeshBasicMaterial({
  map: doorColorTexture,
});

/** MeshMatcapMaterial 网格材质捕获材质 */
// Matcap -> Material Capture
const material = new T.MeshMatcapMaterial();
material.matcap = mapcapTexture;
```

**什么是 Matcap？**

Matcap（Material Capture，材质捕获）是一种将**颜色、光照、阴影和反射信息**全部“烘焙”到一张单张图片（通常是一个球体图像）中的特殊纹理。

在 Three.js 中通过 `MeshMatcapMaterial` 使用它。渲染引擎会根据 3D 模型表面相对于相机的**法线方向**，去这张球形贴图上采样对应的颜色，从而伪造出极其逼真的光影和材质体积感。

---

**Matcap 和 Map 的核心区别**

- **包含信息**：
  - `map`（基础贴图）：仅包含物体表面的纯颜色或图案（如木纹、地砖），不含任何明暗光影。
  - `matcap`：同时包含了颜色、环境光、高光反射和阴影过渡。

- **对场景光源的依赖**：
  - `map`：在标准材质（如 `MeshStandardMaterial`）中使用时，**必须依赖场景光源**（如平行光、环境光）才能看出立体感，否则可能一片漆黑。
  - `matcap`：**完全不响应场景光源**（属于 Unlit 无光照模型）。它的光影直接来自图片本身，因此渲染性能极高，非常适合低端设备。

- **映射原理（极其重要）**：
  - `map`：基于模型的 **UV 坐标**映射。贴图像墙纸一样“死死粘在”模型上，模型怎么转，图案就跟着怎么转。
  - `matcap`：基于**相机视角和表面法线**映射。当你旋转相机或模型时，表面的高光和环境反射会产生流动感，给人一种真实的材质反射错觉。

- **典型使用场景**：
  - `map`：构建真实的、需要与环境光影产生动态交互的 3D 场景（PBR 工作流）。
  - `matcap`：常用于 ZBrush 等雕刻软件的材质预览、性能要求极度苛刻的 Web 3D 展示、或者需要特定艺术化风格（如卡通渲染、特定的金属/玉石质感）的场景。

## Three.js内置材质

在 Three.js 中，材质（Material）决定了物体的几何体（Geometry）如何与场景中的光线互动，以及最终在屏幕上呈现的视觉效果。

我们可以将这些材质分为几大类，以便于你根据性能需求和视觉效果进行选择：

---

### 1. 基础与实用型材质 (Basic & Utility)

这些材质通常不考虑光照，或者用于特定的调试目的。

- **`MeshBasicMaterial`**: 最简单的材质。不受光照影响，只显示颜色或贴图。性能开销最小。
- **`MeshNormalMaterial`**: 将法线向量映射到 RGB 颜色的材质。常用于调试法线方向，看起来像那种五颜六色的“独角兽”配色。
- **`MeshDepthMaterial`**: 根据物体距离摄像机的远近来渲染颜色（近白远黑）。通常用于制作阴影映射或后期处理。

---

### 2. 非物理渲染材质 (Non-PBR)

这些是经典的计算机图形学材质，基于经验模型（如 Phong 或 Lambert），计算速度快。

- **`MeshLambertMaterial`**: 用于非镜面反射的表面（漫反射）。比如木头、纸张。计算是在顶点上完成的，所以性能很好，但在大平面上可能会有锯齿。
- **`MeshPhongMaterial`**: 用于具有镜面高光的亮面。比如金属、塑料、磨光的木材。它比 Lambert 更细腻，支持高光分量。
- **`MeshToonMaterial`**: 这种材质会产生类似卡通/漫画的“色块”效果（Cell Shading）。

---

### 3. 物理渲染材质 (PBR - Physically Based Rendering)

这是现代 3D 渲染的标准，模拟真实世界中的物理规律。

- **`MeshStandardMaterial`**: **最推荐的通用材质**。使用“金属度/粗糙度”模型，能处理非常真实的反射和光影。
- **`MeshPhysicalMaterial`**: `MeshStandardMaterial` 的增强版。它提供了更高级的物理特性，例如：
- **Clearcoat**: 表面的一层清漆（类似汽车涂层）。
- **Transmission**: 透光性（类似毛玻璃）。
- **Sheen**: 表面绒毛感（类似丝绸、织物）。

---

### 4. 特殊用途材质

针对特定几何类型或特殊需求。

- **`PointsMaterial`**: 专门用于 `Points`（粒子系统）。
- **`LineBasicMaterial` / `LineDashedMaterial**`: 用于 `Line`（线段）物体。
- **`SpriteMaterial`**: 用于 `Sprite`，这种物体永远面向相机。
- **`ShadowMaterial`**: 这种材质是完全透明的，但可以接收阴影。常用于将虚拟物体的阴影投影到真实的底图上。

---

### 5. 自定义材质 (Custom Shaders)

如果你需要完全掌控渲染逻辑。

- **`ShaderMaterial`**: 允许你编写自定义的 GLSL 顶点着色器和片元着色器。它自带了 Three.js 的一些默认 Uniforms。
- **`RawShaderMaterial`**: 和 `ShaderMaterial` 类似，但不提供任何内置变量，一切从零开始，自由度最高。

---

### 材质性能对比参考

| 材质类型     | 性能开销 | 视觉效果               | 适用场景                 |
| ------------ | -------- | ---------------------- | ------------------------ |
| **Basic**    | 极低     | 平面、无光影           | UI、纯色背景、调试       |
| **Lambert**  | 低       | 柔和、无高光           | 大量重复的非金属背景物体 |
| **Phong**    | 中       | 有光泽、高光           | 简单的塑料、反光表面     |
| **Standard** | 高       | 真实、物理感强         | 游戏主角、核心展示模型   |
| **Physical** | 极高     | 极其真实（透明、清漆） | 珠宝、汽车展示、玻璃制品 |
