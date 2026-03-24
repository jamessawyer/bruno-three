import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * Galaxy
 */
const parameters: Record<string, any> = {};
parameters.count = 100_000;
parameters.size = 0.001;
parameters.radius = 5;
parameters.branches = 8; // 悬臂数量
parameters.spin = 1.0; // 悬臂旋转角度
parameters.randomness = 0.2; // 悬臂随机性(暂时没用，使用下面的randomnessPower来实现)
parameters.randomnessPower = 4; // 悬臂随机性强度
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let geometry: T.BufferGeometry;
let material: T.PointsMaterial;
let points: T.Points;

const generateGalaxy = () => {
  // 消除旧的Galaxy
  if (points !== undefined) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new T.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const colorInside = new T.Color(parameters.insideColor);
  const colorOutside = new T.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // 💡 通过 Math.pow() 来实现随机性的分布曲线
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // 颜色
    // 这里使用 clone() 避免修改colorInside的值
    const mixedColor = colorInside.clone().lerp(colorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new T.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new T.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true, // 根据相机距离缩放粒子大小
    depthWrite: false, // 停用深度写入，能够会遮挡其它物体
    blending: T.AdditiveBlending, // 添加混合，让粒子颜色叠加，而不是覆盖
    vertexColors: true,
  });

  points = new T.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

// --- Tweakpane 调试面板 ---
const pane = new Pane({ title: "参数调试", expanded: true });
pane.addBinding(parameters, "count", { min: 100, max: 1_000_000, step: 100 }).on("change", (ev) => {
  if (ev.last) {
    // 相当于onFinishChange
    generateGalaxy();
  }
});
pane.addBinding(parameters, "size", { min: 0.001, max: 0.1, step: 0.001 }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "radius", { min: 1, max: 20, step: 0.01 }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "branches", { min: 2, max: 20, step: 1 }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "spin", { min: -5, max: 5, step: 0.01 }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "randomness", { min: 0, max: 1, step: 0.01 }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane
  .addBinding(parameters, "randomnessPower", { min: 1, max: 10, step: 0.01 })
  .on("change", (ev) => {
    if (ev.last) {
      generateGalaxy();
    }
  });
pane.addBinding(parameters, "insideColor", { picker: "inline" }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "outsideColor", { picker: "inline" }).on("change", (ev) => {
  if (ev.last) {
    generateGalaxy();
  }
});

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.43, 5.0, 10);

const cameraFolder = pane.addFolder({ title: "Camera", expanded: true });
cameraFolder
  .addBinding(camera.position, "x", { min: -10, max: 10, step: 0.01 })
  .on("change", (ev) => {
    if (ev.last) {
      generateGalaxy();
    }
  });
cameraFolder
  .addBinding(camera.position, "y", { min: -10, max: 10, step: 0.01 })
  .on("change", (ev) => {
    if (ev.last) {
      generateGalaxy();
    }
  });
cameraFolder
  .addBinding(camera.position, "z", { min: -10, max: 10, step: 0.01 })
  .on("change", (ev) => {
    if (ev.last) {
      generateGalaxy();
    }
  });

// Renderer
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 动画循环 ---
const timer = new T.Timer();

function tick() {
  timer.update();

  controls.update();

  const elapsedTime = timer.getElapsed();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // 更新相机
  camera.aspect = sizes.width / sizes.height; // 更新宽高比
  camera.updateProjectionMatrix(); // 更新相机投影矩阵

  renderer.setSize(sizes.width, sizes.height); // 更新渲染器大小
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
