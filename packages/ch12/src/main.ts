import * as T from "three";
import { FontLoader } from "three/examples/jsm/Addons.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * 纹理
 */
const textureLoader = new T.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/8.png");

/**
 * 字体
 */
const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  console.log("font loaded");
  const textGeometry = new TextGeometry("Kobe Bryant", {
    font,
    size: 0.5,
    depth: 0.2, // 之前的旧版本使用的是 `height` 属性
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  // 居中方式1 - 手动计算
  // textGeometry.computeBoundingBox(); // 包围盒
  // console.log("包围盒", textGeometry.boundingBox);
  // textGeometry.translate(
  //   -(textGeometry.boundingBox!.max.x + textGeometry.boundingBox!.min.x) * 0.5,
  //   -(textGeometry.boundingBox!.max.y + textGeometry.boundingBox!.min.y) * 0.5,
  //   -(textGeometry.boundingBox!.max.z + textGeometry.boundingBox!.min.z) * 0.5,
  // );

  // 居中方式2 - 直接使用 center() 位移进行居中 （它内部已经调用了 computeBoundingBox()）
  textGeometry.center();

  const commonMaterial = new T.MeshMatcapMaterial({
    matcap: matcapTexture,
  });
  const textMesh = new T.Mesh(textGeometry, commonMaterial);
  scene.add(textMesh);

  /** 随机甜甜圈🍩 */
  console.time("donuts");
  // 🚀 材质和几何体是可以复用的，因此不要写在for循环中，这样性能更好
  const donutGeometry = new T.TorusGeometry(0.3, 0.2, 20, 45);

  for (let i = 0; i < 100; i++) {
    const donutMesh = new T.Mesh(donutGeometry, commonMaterial);
    donutMesh.position.x = (Math.random() - 0.5) * 10;
    donutMesh.position.y = (Math.random() - 0.5) * 10;
    donutMesh.position.z = (Math.random() - 0.5) * 10;

    // 随机旋转
    donutMesh.rotation.x = Math.random() * Math.PI;
    donutMesh.rotation.y = Math.random() * Math.PI;

    // 随机大小
    const scale = Math.random();
    donutMesh.scale.set(scale, scale, scale);

    scene.add(donutMesh);
  }
  console.timeEnd("donuts");
});

// Objects

const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// resize 事件
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
