# ch12 笔记：用 `InstancedMesh` 优化大量重复物体渲染

## 背景：为什么要从 `for + Mesh` 改成 `InstancedMesh`

当场景中存在大量**相同几何体** + **相同材质**的物体（例如很多个甜甜圈）时：

- `for` 循环创建多个 `Mesh`：通常会产生 **N 次 draw call**（N = 物体数量）
- `InstancedMesh`：将这些物体合并为 **1 次 draw call**（同一几何体/材质，只是变换不同）

因此 `InstancedMesh` 在数量较大时可以显著提升性能。

## 适用条件

- **几何体相同**（同一个 `BufferGeometry`）
- **材质相同**（同一个 `Material`）
- 每个实例之间主要区别在于：
  - 位置（position）
  - 旋转（rotation）
  - 缩放（scale）
  - （可选）实例颜色等（需要额外 API 支持）

## 本章甜甜圈的实现思路

目标：用 `T.InstancedMesh` 生成 `donutCount` 个甜甜圈实例，并保留随机 position / rotation / scale。

核心步骤：

1. 创建 `donutGeometry`
2. 创建 `donutMesh = new T.InstancedMesh(donutGeometry, commonMaterial, donutCount)`
3. 用一个临时的 `dummy = new T.Object3D()` 反复写入每个实例的变换
4. `dummy.updateMatrix()` 后，把矩阵写入实例：`donutMesh.setMatrixAt(i, dummy.matrix)`
5. 完成后：`donutMesh.instanceMatrix.needsUpdate = true`
6. `scene.add(donutMesh)`

## 关键代码（来自 `src/main.ts`）

```ts
const donutGeometry = new T.TorusGeometry(0.3, 0.2, 20, 45);
const donutCount = 100;
const donutMesh = new T.InstancedMesh(donutGeometry, commonMaterial, donutCount);

const dummy = new T.Object3D();
for (let i = 0; i < donutCount; i++) {
  dummy.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
  );
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

  const scale = Math.random();
  dummy.scale.set(scale, scale, scale);

  dummy.updateMatrix();
  donutMesh.setMatrixAt(i, dummy.matrix);
}

donutMesh.instanceMatrix.needsUpdate = true;
scene.add(donutMesh);
```

## 常见坑

- **忘记 `instanceMatrix.needsUpdate = true`**：你写入的矩阵可能不会生效/不会更新。
- **材质切换是否能影响实例**：可以。`InstancedMesh` 仍然使用同一个 `material`，只要你更新共享材质（例如切换 matcap）实例会一起变。
- **每个实例要不同颜色**：需要 `setColorAt` 并设置 `instanceColor.needsUpdate = true`（并确保材质支持实例颜色）。
