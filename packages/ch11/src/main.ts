import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { Pane } from "tweakpane";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * 光源
 */
const ambientLight = new T.AmbientLight(0xffffff, 1); // 环境光
scene.add(ambientLight);

const pointLight = new T.PointLight(0xffffff, 30); // 点光源
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

/**
 * 环境贴图
 */
// const rgbeLoader = new HDRLoader();
// rgbeLoader.load("/environmentMaps/0/2k.hdr", (environmentMap) => {
//   environmentMap.mapping = T.EquirectangularReflectionMapping;
//   scene.background = environmentMap;
//   scene.environment = environmentMap;
// });

/**
 * 纹理
 */
const textureLoader = new T.TextureLoader();
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg");
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const mapcapTexture = textureLoader.load("/textures/matcaps/1.png");
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");

// 的作用是告诉 Three.js 这两张纹理图片使用的是 sRGB 色彩空间，
// 从而确保最终渲染出的颜色正确、不发白
doorColorTexture.colorSpace = T.SRGBColorSpace;
mapcapTexture.colorSpace = T.SRGBColorSpace;

// Objects

/** MeshBasicMaterial 基础材质 */
// const material = new T.MeshBasicMaterial({
//   map: doorColorTexture,
// });

// material.transparent = true;
// // // 要想opacity生效，必须先设置上面的 👆🏻 transparent 属性为true
// // material.opacity = 0.5;
// // alphaMap 白色部分可见，黑色部分隐藏
// material.alphaMap = doorAlphaTexture; // 透明图贴图
// material.side = T.DoubleSide;

/** MeshNormalMaterial 网格法线材质 */
// const material = new T.MeshNormalMaterial();
// material.flatShading = true; // 材质是否用平面着色渲染
// material.wireframe = true;

/** MeshMatcapMaterial 网格材质捕获材质 */
// Matcap -> Material Capture
// const material = new T.MeshMatcapMaterial();
// material.matcap = mapcapTexture;

/** MeshDepthMaterial 网格深度材质 */
// 多用于后期处理，阴影
// const material = new T.MeshDepthMaterial();

/** MeshLambertMaterial 网格拉伯特材质 */
// 它需要光源，它是使用光源中性能最好的材质
// const material = new T.MeshLambertMaterial();

/** MeshPhongMaterial 网格冯氏材质 */
// 它需要光源，但它比拉伯特材质性能更好
// const material = new T.MeshPhongMaterial();
// material.shininess = 100;
// material.specular = new T.Color("#118ab2"); // 点光源反射颜色

/** MeshToonMaterial 网格卡通材质 */
// 可实现 塞尔达 类似的材质效果
// const material = new T.MeshToonMaterial();
// gradientTexture.minFilter = T.NearestFilter;
// gradientTexture.magFilter = T.NearestFilter;
// gradientTexture.generateMipmaps = false;
// material.gradientMap = gradientTexture;

/** MeshStandardMaterial 网格标准材质 */
// const material = new T.MeshStandardMaterial();

// material.metalness = 0.7;
// material.roughness = 0.2;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(0.5, 0.5);

/** MeshPhysicalMaterial 网格物理材质 */
// 比较消耗性能的材质
const material = new T.MeshPhysicalMaterial();

material.metalness = 0.7;
material.roughness = 0.2;
material.map = doorColorTexture;
material.aoMap = doorAmbientOcclusionTexture;
material.aoMapIntensity = 1;
material.displacementMap = doorHeightTexture;
material.displacementScale = 0.1;
material.metalnessMap = doorMetalnessTexture;
material.roughnessMap = doorRoughnessTexture;
material.normalMap = doorNormalTexture;
material.normalScale.set(0.5, 0.5);

// 相比 MeshStandardMaterial 多的属性
material.clearcoat = 1; // 清漆 比较耗费性能
material.clearcoatRoughness = 0.1;

// Sheen 织物
// material.sheen = 1;
// material.sheenRoughness = 0.25;
// material.sheenColor.set(1, 1, 1); // 菲涅尔效应 边缘出现高亮

// 出现肥皂泡或者油在水面上出现的彩虹色🌈
// material.iridescence = 1;
// material.iridescenceIOR = 1;
// material.iridescenceThicknessRange = [100, 800];

// 透射
// material.transmission = 1; // 透射率
// material.ior = 1.5; // 折射率 index of refraction
// material.thickness = 0.5; // 透射厚度

// Tweakpane
const pane = new Pane();
const folder = pane.addFolder({
  title: "Material",
});
folder.addBinding(material, "metalness", {
  min: 0,
  max: 1,
  step: 0.001,
});
folder.addBinding(material, "roughness", {
  min: 0,
  max: 1,
  step: 0.001,
});

folder.addBinding(material, "clearcoat", {
  min: 0,
  max: 1,
  step: 0.001,
});
folder.addBinding(material, "clearcoatRoughness", {
  min: 0,
  max: 1,
  step: 0.001,
});

const sphere = new T.Mesh(new T.SphereGeometry(0.5, 16, 16), material);
sphere.position.x = -1.5;

const plane = new T.Mesh(new T.PlaneGeometry(1, 1), material);
plane.position.x = 0;

const torus = new T.Mesh(new T.TorusGeometry(0.3, 0.2, 16, 32), material);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

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

// 动画
const clock = new T.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  sphere.rotation.y = 0.1 * elapsedTime;
  plane.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = -0.15 * elapsedTime;
  plane.rotation.x = -0.15 * elapsedTime;
  torus.rotation.x = -0.15 * elapsedTime;

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
