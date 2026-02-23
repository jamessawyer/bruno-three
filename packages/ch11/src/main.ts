import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
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

// 准备 gradient 纹理用于 Toon 材质
gradientTexture.minFilter = T.NearestFilter;
gradientTexture.magFilter = T.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * 材质工厂函数
 */
function createMaterial(type: string): T.Material {
  switch (type) {
    case "MeshBasicMaterial":
      /** MeshBasicMaterial 基础材质 */
      const basicMat = new T.MeshBasicMaterial({
        map: doorColorTexture,
      });
      basicMat.transparent = true;
      // 要想opacity生效，必须先设置上面的 👆🏻 transparent 属性为true
      basicMat.alphaMap = doorAlphaTexture; // 透明图贴图 - 白色部分可见，黑色部分隐藏
      basicMat.side = T.DoubleSide;
      return basicMat;

    case "MeshNormalMaterial":
      /** MeshNormalMaterial 网格法线材质 */
      const normalMat = new T.MeshNormalMaterial();
      normalMat.flatShading = true; // 材质是否用平面着色渲染
      return normalMat;

    case "MeshMatcapMaterial":
      /** MeshMatcapMaterial 网格材质捕获材质 */
      // Matcap -> Material Capture
      const matcapMat = new T.MeshMatcapMaterial();
      matcapMat.matcap = mapcapTexture;
      return matcapMat;

    case "MeshDepthMaterial":
      /** MeshDepthMaterial 网格深度材质 */
      // 多用于后期处理，阴影
      return new T.MeshDepthMaterial();

    case "MeshLambertMaterial":
      /** MeshLambertMaterial 网格拉伯特材质 */
      // 它需要光源，它是使用光源中性能最好的材质
      return new T.MeshLambertMaterial();

    case "MeshPhongMaterial":
      /** MeshPhongMaterial 网格冯氏材质 */
      // 它需要光源，但它比拉伯特材质性能更好
      const phongMat = new T.MeshPhongMaterial();
      phongMat.shininess = 100;
      phongMat.specular = new T.Color("#118ab2"); // 点光源反射颜色
      return phongMat;

    case "MeshToonMaterial":
      /** MeshToonMaterial 网格卡通材质 */
      // 可实现 塞尔达 类似的材质效果
      const toonMat = new T.MeshToonMaterial();
      toonMat.gradientMap = gradientTexture;
      return toonMat;

    case "MeshStandardMaterial":
      /** MeshStandardMaterial 网格标准材质 */
      const standardMat = new T.MeshStandardMaterial();
      standardMat.metalness = 0.7;
      standardMat.roughness = 0.2;
      standardMat.map = doorColorTexture;
      standardMat.aoMap = doorAmbientOcclusionTexture;
      standardMat.aoMapIntensity = 1;
      standardMat.displacementMap = doorHeightTexture;
      standardMat.displacementScale = 0.1;
      standardMat.metalnessMap = doorMetalnessTexture;
      standardMat.roughnessMap = doorRoughnessTexture;
      standardMat.normalMap = doorNormalTexture;
      standardMat.normalScale.set(0.5, 0.5);
      return standardMat;

    case "MeshPhysicalMaterial":
      /** MeshPhysicalMaterial 网格物理材质 */
      // 比较消耗性能的材质
      const physicalMat = new T.MeshPhysicalMaterial();
      physicalMat.metalness = 0.7;
      physicalMat.roughness = 0.2;
      physicalMat.map = doorColorTexture;
      physicalMat.aoMap = doorAmbientOcclusionTexture;
      physicalMat.aoMapIntensity = 1;
      physicalMat.displacementMap = doorHeightTexture;
      physicalMat.displacementScale = 0.1;
      physicalMat.metalnessMap = doorMetalnessTexture;
      physicalMat.roughnessMap = doorRoughnessTexture;
      physicalMat.normalMap = doorNormalTexture;
      physicalMat.normalScale.set(0.5, 0.5);
      // 相比 MeshStandardMaterial 多的属性
      physicalMat.clearcoat = 1; // 清漆 比较耗费性能
      physicalMat.clearcoatRoughness = 0.1;
      // Sheen 织物
      // physicalMat.sheen = 1;
      // physicalMat.sheenRoughness = 0.25;
      // physicalMat.sheenColor.set(1, 1, 1); // 菲涅尔效应 边缘出现高亮
      // 出现肥皂泡或者油在水面上出现的彩虹色🌈
      // physicalMat.iridescence = 1;
      // physicalMat.iridescenceIOR = 1;
      // physicalMat.iridescenceThicknessRange = [100, 800];
      // 透射
      // physicalMat.transmission = 1; // 透射率
      // physicalMat.ior = 1.5; // 折射率 index of refraction
      // physicalMat.thickness = 0.5; // 透射厚度
      return physicalMat;

    default:
      return new T.MeshStandardMaterial();
  }
}

// 初始材质
let currentMaterial = createMaterial("MeshPhysicalMaterial");

const sphere = new T.Mesh(new T.SphereGeometry(0.5, 64, 64), currentMaterial);
sphere.position.x = -1.5;

const plane = new T.Mesh(new T.PlaneGeometry(1, 1, 100, 100), currentMaterial);
plane.position.x = 0;

const torus = new T.Mesh(new T.TorusGeometry(0.3, 0.2, 64, 128), currentMaterial);
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

/**
 * Tweakpane 控制面板
 */
const pane = new Pane();

// 材质选择器
const materialParams = {
  materialType: "MeshPhysicalMaterial",
};

const materialFolder = pane.addFolder({
  title: "Material Type",
  expanded: true,
});

materialFolder
  .addBinding(materialParams, "materialType", {
    label: "Type",
    options: {
      Basic: "MeshBasicMaterial",
      Normal: "MeshNormalMaterial",
      Matcap: "MeshMatcapMaterial",
      Depth: "MeshDepthMaterial",
      Lambert: "MeshLambertMaterial",
      Phong: "MeshPhongMaterial",
      Toon: "MeshToonMaterial",
      Standard: "MeshStandardMaterial",
      Physical: "MeshPhysicalMaterial",
    },
  })
  .on("change", (ev) => {
    // 销毁旧材质
    currentMaterial.dispose();
    // 创建新材质
    currentMaterial = createMaterial(ev.value);
    // 更新所有网格的材质
    sphere.material = currentMaterial;
    plane.material = currentMaterial;
    torus.material = currentMaterial;
    // 更新控制面板
    updateMaterialControls(ev.value);
  });

// 材质属性控制文件夹
let controlsFolder = pane.addFolder({
  title: "Material Properties",
  expanded: true,
});

/**
 * 更新材质控制选项
 */
function updateMaterialControls(materialType: string) {
  // 移除旧的控制项
  controlsFolder.dispose();
  controlsFolder = pane.addFolder({
    title: "Material Properties",
    expanded: true,
  });

  const mat = currentMaterial as any;

  switch (materialType) {
    case "MeshBasicMaterial":
      controlsFolder.addBinding(mat, "opacity", { min: 0, max: 1, step: 0.01 });
      controlsFolder.addBinding(mat, "transparent");
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshNormalMaterial":
      controlsFolder.addBinding(mat, "flatShading");
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshMatcapMaterial":
      controlsFolder.addBinding(mat, "flatShading");
      break;

    case "MeshDepthMaterial":
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshLambertMaterial":
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshPhongMaterial":
      controlsFolder.addBinding(mat, "shininess", { min: 0, max: 200, step: 1 });
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshToonMaterial":
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshStandardMaterial":
      controlsFolder.addBinding(mat, "metalness", { min: 0, max: 1, step: 0.001 });
      controlsFolder.addBinding(mat, "roughness", { min: 0, max: 1, step: 0.001 });
      controlsFolder.addBinding(mat, "aoMapIntensity", { min: 0, max: 2, step: 0.01 });
      controlsFolder.addBinding(mat, "displacementScale", { min: 0, max: 1, step: 0.01 });
      controlsFolder.addBinding(mat, "wireframe");
      break;

    case "MeshPhysicalMaterial":
      controlsFolder.addBinding(mat, "metalness", { min: 0, max: 1, step: 0.001 });
      controlsFolder.addBinding(mat, "roughness", { min: 0, max: 1, step: 0.001 });
      controlsFolder.addBinding(mat, "aoMapIntensity", { min: 0, max: 2, step: 0.01 });
      controlsFolder.addBinding(mat, "displacementScale", { min: 0, max: 1, step: 0.01 });

      const advancedFolder = controlsFolder.addFolder({
        title: "Advanced (Physical)",
        expanded: false,
      });
      advancedFolder.addBinding(mat, "clearcoat", { min: 0, max: 1, step: 0.001 });
      advancedFolder.addBinding(mat, "clearcoatRoughness", { min: 0, max: 1, step: 0.001 });
      // 可选：取消注释以启用更多高级属性
      // advancedFolder.addBinding(mat, "sheen", { min: 0, max: 1, step: 0.001 });
      // advancedFolder.addBinding(mat, "sheenRoughness", { min: 0, max: 1, step: 0.001 });
      // advancedFolder.addBinding(mat, "iridescence", { min: 0, max: 1, step: 0.001 });
      // advancedFolder.addBinding(mat, "transmission", { min: 0, max: 1, step: 0.001 });
      // advancedFolder.addBinding(mat, "ior", { min: 1, max: 2.333, step: 0.001 });

      controlsFolder.addBinding(mat, "wireframe");
      break;
  }
}

// 初始化控制面板
updateMaterialControls("MeshPhysicalMaterial");

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
