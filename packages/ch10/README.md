在 `/public/textures/door/` 文件夹中，这些图片代表了一套完整的 **PBR（Physically Based Rendering，基于物理的渲染）材质纹理**。在 Three.js 中，它们组合起来可以创建一个极其逼真的门材质。

这是每种纹理的具体作用和代表的种类：

1. **color.jpg (基础色/反照率贴图 - Albedo/Base Color)**
   - **作用**：提供材质的基本颜色和图案，没有光照和阴影信息。
   - **在 Three.js 中的使用**：`map` 属性

2. **alpha.jpg (透明度贴图 - Alpha/Opacity)**
   - **作用**：控制材质的透明度。白色部分完全不透明，黑色部分完全透明。
   - **在 Three.js 中的使用**：`alphaMap` 属性（需要设置 `transparent: true`）

3. **ambientOcclusion.jpg (环境光遮蔽贴图 - AO)**
   - **作用**：增加缝隙和角落处的阴影细节，使模型看起来更有立体感。
   - **在 Three.js 中的使用**：`aoMap` 属性（需要第二套 UV 坐标 `aoMapIntensity`）

4. **height.jpg (高度/位移贴图 - Height/Displacement)**
   - **作用**：通过移动顶点来创建真实的物理凹凸感。白色凸起，黑色凹陷。
   - **在 Three.js 中的使用**：`displacementMap` 属性（需要几何体有足够的细分段数）

5. **normal.jpg (法线贴图 - Normal)**
   - **作用**：不改变几何体顶点，而是通过改变光照反射方向来伪造细节凹凸感，比高度贴图节省性能。
   - **在 Three.js 中的使用**：`normalMap` 属性

6. **metalness.jpg (金属度贴图 - Metalness)**
   - **作用**：控制材质的金属质感。白色表示金属（强反射），黑色表示非金属（漫反射）。
   - **在 Three.js 中的使用**：`metalnessMap` 属性

7. **roughness.jpg (粗糙度贴图 - Roughness)**
   - **作用**：控制材质表面的光滑程度。白色表示粗糙（光线散射），黑色表示光滑（像镜子一样反射）。
   - **在 Three.js 中的使用**：`roughnessMap` 属性

在 Three.js 中，通常会结合使用 `MeshStandardMaterial` 或 `MeshPhysicalMaterial` 来加载这套完整的 PBR 纹理，以达到最真实的效果。外层的 minecraft.png 和 checkerboard 等通常是用于基础测试的颜色贴图。

## 什么是UV unwrapping

**UV Unwrapping（UV 展开）** 是将3D模型的表面展开到2D平面的过程，以便将2D纹理（如图片）正确地映射（贴）到3D模型上。

你可以把它想象成**把一个纸盒拆开并摊平在桌子上**，或者**剥橘子皮并将其压平**。

### 为什么叫 "UV"？

- 3D 空间我们使用 **X, Y, Z** 坐标。
- 为了避免混淆，2D 纹理空间我们使用 **U** 和 **V** 坐标（相当于2D平面的 X 和 Y）。
  - U 代表水平方向（从左到右，通常是 0 到 1）
  - V 代表垂直方向（从下到上，通常是 0 到 1）

### UV Unwrapping 的作用

当你有一张纹理图片（如你代码中的 `color.jpg` 并将其应用到 3D 模型时，渲染引擎需要知道：**图片的哪个像素应该显示在模型的哪个位置？**

UV 坐标就提供了这个映射关系：

- 模型的每个顶点（Vertex）都会对应一个 2D 的 UV 坐标（如 `(0, 0)` 或 `(0.5, 1)`）。
- 引擎根据这些 UV 坐标，从图片中采样颜色，然后填充到模型表面的三角形中。

### 在 Three.js 中的表现

在你当前的代码中：

```typescript
const geometry = new T.BoxGeometry(1, 1, 1);
const material = new T.MeshBasicMaterial({ map: colorTexture });
```

Three.js 提供的内置几何体（如 `BoxGeometry`、`SphereGeometry`、`PlaneGeometry` 等）**已经默认包含了计算好的 UV 坐标**。

- 对于 `BoxGeometry`，它的每个面（共6个面）都默认映射了整张图片的完整 UV（即从 `(0,0)` 到 `(1,1)`）。
- 因此，你会看到 [color.jpg](cci:7://file:///Users/lucia/Documents/2026/learning-threejs/bruno-three/packages/ch10/public/textures/door/color.jpg:0:0-0:0) 的完整图案被分别贴在了立方体的 6 个面上。

### 什么时候需要手动 UV Unwrapping？

当你在 Blender、Maya、C4D 等 3D 建模软件中创建了**自定义的复杂模型**（如一个人物、一辆车）时。

- 软件不会自动知道如何完美地将图片贴到这个复杂形状上。
- 3D 艺术家必须在建模软件中手动进行 "UV Unwrapping"，在模型表面标记 "接缝"（Seams），然后将模型展开成 2D 贴图。
- 展开后导出的模型文件（如 `.gltf` / `.glb`）会包含这些 UV 数据，Three.js 读取时就能正确贴图了。

## 什么是 Texture Mipmapping

**Texture Mipmapping（纹理多级渐远）** 是一种用于优化3D渲染性能和提升视觉质量的技术。

你可以把它想象成**图像的“缩略图金字塔”**。

### 什么是 Mipmapping？

当 WebGL（Three.js 的底层）加载一张纹理（比如 1024x1024 的 `color.jpg` 时，如果启用了 Mipmapping，它会自动生成一系列分辨率逐渐减半的较小版本的纹理，直到 1x1 像素。

例如，对于一张 1024x1024 的图片，它会生成：

- Level 0: 1024x1024 (原始大小)
- Level 1: 512x512
- Level 2: 256x256
- Level 3: 128x128
  ...以此类推，直到 1x1。

### 为什么需要 Mipmapping？

1. **解决摩尔纹/闪烁（提升视觉质量）**：
   当一个带有高分辨率纹理的物体离相机很远时，它在屏幕上可能只占据几十个像素。如果直接从 1024x1024 的大图中采样这几十个像素，相邻像素的采样点在原图上会相距很远。当相机移动时，采样点会剧烈跳动，导致远处的纹理看起来闪烁、有噪点（这就是摩尔纹现象）。

2. **提升性能（减少带宽占用）**：
   如果远处的物体只占 64x64 的屏幕空间，直接使用 64x64 的 Mipmap 级别去渲染，GPU 只需要读取很少的纹理数据。这大大减少了内存带宽压力，提升了渲染帧率。

### 它是如何工作的？

在渲染时，GPU 会自动计算模型在屏幕上占据的像素大小，然后**智能地选择最合适分辨率的那一层 Mipmap**。

- 如果物体离得很近：使用最高清的原图（Level 0）。
- 如果物体离得很远：使用模糊的小图（比如 Level 4）。

### 在 Three.js 中的相关属性

你代码中注释掉的两行就与 Mipmap 密切相关：

```typescript
// colorTexture.minFilter = T.LinearFilter;
```

- **`minFilter` (Minification Filter)**：当纹理在屏幕上被**缩小**（物体离相机远）时使用的过滤方式。
- 默认值是 `THREE.LinearMipmapLinearFilter`，这意味着 Three.js 默认是**开启** Mipmapping 的。它会在两个最合适的 Mipmap 层级之间进行线性插值，效果最平滑。
- 如果你将其改为 `THREE.LinearFilter`（或 `THREE.NearestFilter`），就相当于**禁用了 Mipmapping**，强制在所有距离都使用原始大图进行采样，远处可能会出现闪烁。

Three.js 默认会自动为你加载的图片调用 `texture.generateMipmaps = true` 来生成这些缩略图。这就是为什么通常要求**纹理的宽高最好是 2 的次幂**（如 512、1024），因为这样才能完美地不断除以 2 直到 1x1。
