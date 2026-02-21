import gsap from "gsap";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Objects
const geometry = new T.BoxGeometry(1, 1, 1);
const material = new T.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const mesh = new T.Mesh(geometry, material);
scene.add(mesh);

// --- Tweakpane 调试面板 ---
const pane = new Pane();
const cubeFolder = pane.addFolder({
  title: "Cube控制",
});

cubeFolder.addBinding(mesh.position, "y", {
  min: -3,
  max: 3,
  label: "Y方向",
});

cubeFolder.addBinding(mesh, "visible");
// 线框模式
cubeFolder.addBinding(material, "wireframe");
// 颜色
// https://tweakpane.github.io/docs/input-bindings/#color
// 创建颜色对象用于Tweakpane
const colorObject = {
  color: "#" + material.color.getHexString(),
};

cubeFolder
  .addBinding(colorObject, "color", {
    picker: "inline",
    expanded: true,
    // view 设置为 'color' 表示得到hex颜色值
    view: "color",
  })
  .on("change", (ev) => {
    material.color.set(ev.value);
  });

// 添加按钮，旋转一圈
cubeFolder
  .addButton({
    title: "Rotation",
  })
  .on("click", () => {
    gsap.to(mesh.rotation, {
      duration: 1,
      y: mesh.rotation.y + Math.PI * 2,
    });
  });

// 线框细分widthSegments, heightSegments, depthSegments
cubeFolder
  .addBinding(
    {
      subdivision: 2,
    },
    "subdivision",
    {
      min: 1,
      max: 10,
      step: 1,
    },
  )
  .on("change", (ev) => {
    // 只在用户完成交互时执行（ev.last 为 true）
    // 用于实现 lil-gui 中 `finishChange` 效果
    if (ev.last) {
      // 创建之前先销毁
      mesh.geometry.dispose();
      mesh.geometry = new T.BoxGeometry(1, 1, 1, ev.value, ev.value, ev.value);
    }
  });

const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// resize 事件
// 1. 调整画布尺寸
// 2. 更新相机
// 3. 更新渲染器
// 4. 更新像素比
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // 更新相机
  camera.aspect = sizes.width / sizes.height; // 更新宽高比
  camera.updateProjectionMatrix(); // 更新相机投影矩阵

  renderer.setSize(sizes.width, sizes.height); // 更新渲染器大小
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 进入和退出全屏
window.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    // 对特定元素申请进入全屏（比如video, canvas等）
    canvas?.requestFullscreen();
  }
});

// Camera

// 透视相机
const camera = new T.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // 必须在 tick() 中调用 controls.update()

// Renderer
const renderer = new T.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
// 如果 pixelRatio 设置大于2 会消耗更多性能，但实际效果也没那么明显
// 因此最大设置为2即可
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const tick = () => {
  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
