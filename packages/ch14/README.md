## SpotLight.target

### `spotLight.target` 是什么？

`spotLight.target` 是 **Three.js 给 `SpotLight`（以及 `DirectionalLight`）配套的一个“目标对象”**，类型是 `THREE.Object3D`。

- **本质**：一个 `Object3D`（可以理解成场景里的一个“空物体/锚点”）
- **用途**：决定聚光灯“朝向哪里照”（灯光的方向向量是从 `spotLight.position` 指向 `spotLight.target.position`）

也就是说：`SpotLight` 自己只有“位置”，但要形成“手电筒式”的方向照射，就必须有一个“照向的点”，这就是 `target`。

### 它有什么作用？

- **控制光照方向**：你移动 `target`，灯光的方向就会跟着变
- **影响阴影方向**：如果你开了 `castShadow`，阴影的投射方向也会随 `target` 改变（因为灯朝向变了）

### 为什么要 `scene.add(spotLight.target)`？

Three.js 里 `spotLight.target` 虽然存在，但它**默认不一定在场景树里**。如果你只是用默认 target（通常在原点附近），可能看不出问题；但你一旦想改它的位置并让它稳定生效，最佳实践是把它加到 scene（或某个父节点）里：

```ts
spotLight.target.position.x = -0.75;
scene.add(spotLight.target);
```

这样 `target` 就成为场景的一部分：

- 它的 `position`、`matrixWorld` 会被正常更新
- 你以后如果把 `target` 挂到某个物体上（比如跟着角色走）也更自然

### 一个直观理解

- **`spotLight.position`**：手电筒在哪
- **`spotLight.target.position`**：手电筒照向哪里

如果你愿意，我也可以结合你 `ch14/main.ts` 里 `spotLight.position` 的设置，帮你判断当前这盏灯最终会照到场景的哪个区域，以及为什么要把 `x` 设成 `-0.75`。
