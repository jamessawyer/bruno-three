// scripts/create-exercise.ts
import { write, $ } from "bun";
import { join } from "path";

const name = Bun.argv[2];
if (!name) {
  console.error("❌ 请输入练习名称");
  process.exit(1);
}

const targetDir = join(import.meta.dir, "../packages", name);

// 1. 创建目录结构
await $`mkdir -p ${targetDir}/src`;

// 2. 生成 package.json (引用 Vite 7 和 Tweakpane)
const pkgJson = {
  name: `@play/${name}`,
  private: true,
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  },
  dependencies: {
    three: "catalog:",
    tweakpane: "catalog:", // 引入 Tweakpane
    gsap: "catalog:",
  },
  devDependencies: {
    vite: "catalog:",
    "@types/three": "catalog:",
    typescript: "catalog:",
    "@tweakpane/core": "catalog:",
  },
};
await write(join(targetDir, "package.json"), JSON.stringify(pkgJson, null, 2));

// 3. 生成 tsconfig.json
await write(
  join(targetDir, "tsconfig.json"),
  JSON.stringify(
    {
      extends: "../../tsconfig.base.json",
      include: ["src"],
    },
    null,
    2,
  ),
);

// 4. 生成 HTML
await write(
  join(targetDir, "index.html"),
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Three.js + Vite 7: ${name}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        overflow: hidden;
        background: #111;
        display: grid;
        place-items: center;
      }
    </style>
  </head>
  <body>
    <canvas id="app"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
);

// 5. 生成包含 Tweakpane 的 main.ts 模板
await write(
  join(targetDir, "src/main.ts"),
  `
import * as THREE from 'three';
import { Pane } from 'tweakpane';

// --- 初始化场景 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('app') as HTMLCanvasElement, 
  antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 添加物体 ---
const geometry = new THREE.IcosahedronGeometry(1, 4);
const material = new THREE.MeshNormalMaterial({ wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 3;

// --- Tweakpane 调试面板 ---
const pane = new Pane({ title: '参数调试' });
const params = {
  rotationSpeed: 0.01,
  wireframe: true,
  color: '#ffffff'
};

pane.addBinding(params, 'rotationSpeed', { min: 0, max: 0.1, label: '旋转速度' });
pane.addBinding(params, 'wireframe', { label: '线框模式' }).on('change', (ev) => {
  material.wireframe = ev.value;
});

// --- 动画循环 ---
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += params.rotationSpeed;
  renderer.render(scene, camera);
}
animate();

// --- 适配窗口 ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
`,
);

console.log(`\n🚀 练习 "${name}" 已就绪！`);
console.log(`👉 运行: pnpm install && cd packages/${name} && bun dev`);
