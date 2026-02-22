import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 加载纹理 ---

/** 纹理加载 - 方式1 */
// const image = new Image();
// const texture = new T.Texture(image);
// image.onload = () => {
//   texture.needsUpdate = true;
// };
// image.src = "/textures/door/color.jpg";

/** 纹理加载 - 方式2 */
const loadingManager = new T.LoadingManager();

loadingManager.onStart = () => {
  console.log("onStart");
};
loadingManager.onLoad = () => {
  console.log("onLoad");
};
loadingManager.onProgress = () => {
  console.log("onProgress");
};
loadingManager.onError = () => {
  console.log("onError");
};

const textureLoader = new T.TextureLoader(loadingManager);
const minecraftTexture = textureLoader.load("/textures/minecraft.png");
const checkerboardTexture = textureLoader.load("/textures/checkerboard-8x8.png");
const colorTexture = textureLoader.load("/textures/door/color.jpg");
const alphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const heightTexture = textureLoader.load("/textures/door/height.jpg");
const normalTexture = textureLoader.load("/textures/door/normal.jpg");
const ambientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg");
const roughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const metalnessTexture = textureLoader.load("/textures/door/metalness.jpg");

colorTexture.repeat.x = 2; // 控制 U(水平) 方向的重复
colorTexture.repeat.y = 3; // 控制 V(垂直) 方向的重复
// S 代表水平 (U/X) 轴的包裹模式
colorTexture.wrapS = T.RepeatWrapping; // 设置 U(水平) 方向的重复方式
// T 代表垂直 (V/Y) 轴的包裹模式
colorTexture.wrapT = T.RepeatWrapping; // 设置 V(垂直) 方向的重复方式

colorTexture.offset.x = 0.5;
colorTexture.offset.y = 0.5;

colorTexture.rotation = Math.PI * 0.25;
colorTexture.center.x = 0.5;
colorTexture.center.y = 0.5;

// 如果不需要mipmapping 可以关闭 mipmap 提升性能
colorTexture.generateMipmaps = false;
// 缩小时使用的纹理（默认值 THREE.LinearMipmapLinearFilter,即开启mipmapping，设置为其它值将禁用mipmapping）
colorTexture.minFilter = T.NearestFilter;
// 放大时使用的纹理
colorTexture.magFilter = T.NearestFilter;

// const texture = textureLoader.load(
//   "/textures/door/color.jpg",
//   () => {
//     console.log("onLoaded");
//   },
//   () => {
//     // 这个 progress 没有效果，实际项目中一般不会用到这个
//     // 一般用到的是 LoadingManager
//     console.log("onProgress");
//   },
//   () => {
//     console.log("onError");
//   },
// );

// --- 初始化场景 ---
const scene = new T.Scene();

// Objects
const geometry = new T.BoxGeometry(1, 1, 1);
// console.log("attributes", geometry.attributes); // 可以看到uv属性
const material = new T.MeshBasicMaterial({ map: colorTexture });
const mesh = new T.Mesh(geometry, material);
scene.add(mesh);

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
