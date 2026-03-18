import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Sky } from "three/addons/objects/Sky.js";
import { Pane } from "tweakpane";

// --- Tweakpane 调试面板 ---
const pane = new Pane({ title: "参数调试" });
// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * Textures
 */
const textureLoader = new T.TextureLoader();

// texture - floor
// alpha map
//    -> 控制物体的透明度，决定哪些部分可见，哪些部分不可见。
//    -> 黑白图像：白色 = 完全不透明，黑色 = 完全透明。
//    -> 通常用于创建镂空效果（如草地、树叶、栅栏等）
//    -> 需要配合 transparent: true 使用
// Diffuse/Color map -> (漫反射/颜色贴图) - *_diff_1k.webp
//    -> 定义物体表面的基础颜色（固有色），也就是材质在无光照条件下的本来颜色。
//    -> 包含完整的颜色信息（RGB）
//    -> 这是最直观的贴图类型，决定了材质"是什么颜色"
//    -> 颜色值会受光照影响最终呈现
// ARM map -> *_arm_1k.webp
//    -> (环境光遮蔽/粗糙度/金属度贴图)
//    -> 这是一张贴图存储三个通道数据，是现代 PBR 工作流的标准做法
//    -> R (Red)通道 - Ambient Occlusion (AO) - 环境光遮蔽，模拟缝隙、角落的阴影，增加深度感
//    -> G (Green)通道 - Roughness (粗糙度) - 控制表面光滑程度。黑色=镜面反射，白色=漫反射
//    -> B (Blue)通道 - Metallic (金属度) - 区分金属和非金属。白色=金属，黑色=非金属
//    -> 优点：一张图替代三张，减少内存占用和纹理采样次数。
// Normal map -> (法线贴图) - *_nor_gl_1k.webp
//    -> 在不增加多边形的情况下，通过改变表面法线方向来模拟凹凸细节。
//    -> 存储的是法线向量信息（RGB 对应 XYZ 方向）
//    -> 视觉上产生凹凸感，但几何体仍然是平的
//    -> gl 后缀表示使用 OpenGL 坐标系（Y轴向上），与 DirectX（Y轴向下）相反
//    -> vs Displacement：法线贴图是"欺骗眼睛"，位移贴图是真正改变几何形状。
// Displacement Map -> (位移/高度贴图) - *_dis_1k.webp
//    -> 根据贴图的灰度值真正改变网格的顶点高度。
//    -> 灰度图像：白色 = 最高，黑色 = 最低，灰色 = 中间
//    -> 真正改变几何体形状（而非法线贴图的视觉欺骗）
//    -> 需要足够的几何细分才能看出效果（PlaneGeometry 需要有足够的 segments）
//    -> 比法线贴图更消耗性能，但效果更真实（边缘有真实的凹凸轮廓）

const floorAlphaTexture = textureLoader.load("/textures/floor/alpha.webp");
const floorColorTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp",
);
const floorARMTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp",
);
const floorNormalTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp",
);
const floorDisplacementTexture = textureLoader.load(
  "/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp",
);

// 重复铺满整个平面
floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = T.RepeatWrapping;
floorARMTexture.wrapS = T.RepeatWrapping;
floorNormalTexture.wrapS = T.RepeatWrapping;
floorDisplacementTexture.wrapS = T.RepeatWrapping;

floorColorTexture.wrapT = T.RepeatWrapping;
floorARMTexture.wrapT = T.RepeatWrapping;
floorNormalTexture.wrapT = T.RepeatWrapping;
floorDisplacementTexture.wrapT = T.RepeatWrapping;

floorColorTexture.colorSpace = T.SRGBColorSpace;

// texture - Wall
const wallColorTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp",
);
const wallARMTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp",
);
const wallNormalTexture = textureLoader.load(
  "/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp",
);
wallColorTexture.colorSpace = T.SRGBColorSpace;

// texture - Roof
const roofColorTexture = textureLoader.load(
  "/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp",
);
const roofARMTexture = textureLoader.load(
  "/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp",
);
const roofNormalTexture = textureLoader.load(
  "/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp",
);
roofColorTexture.colorSpace = T.SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);

roofColorTexture.wrapS = T.RepeatWrapping;
roofARMTexture.wrapS = T.RepeatWrapping;
roofNormalTexture.wrapS = T.RepeatWrapping;

// texture - Bush
const bushColorTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp",
);
const bushARMTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp",
);
const bushNormalTexture = textureLoader.load(
  "/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp",
);
bushColorTexture.colorSpace = T.SRGBColorSpace;

bushColorTexture.repeat.set(2, 1);
bushARMTexture.repeat.set(2, 1);
bushNormalTexture.repeat.set(2, 1);

bushColorTexture.wrapS = T.RepeatWrapping;
bushARMTexture.wrapS = T.RepeatWrapping;
bushNormalTexture.wrapS = T.RepeatWrapping;

// texture - Graves
const graveColorTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp",
);
const graveARMTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp",
);
const graveNormalTexture = textureLoader.load(
  "/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp",
);
graveColorTexture.colorSpace = T.SRGBColorSpace;

graveColorTexture.repeat.set(0.3, 0.4);
graveARMTexture.repeat.set(0.3, 0.4);
graveNormalTexture.repeat.set(0.3, 0.4);

// texture - Door
const doorColorTexture = textureLoader.load("/textures/door/color.webp");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.webp");
const doorAmbientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.webp");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.webp");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.webp");
const doorNormalTexture = textureLoader.load("/textures/door/normal.webp");
const doorHeightTexture = textureLoader.load("/textures/door/height.webp");

doorColorTexture.colorSpace = T.SRGBColorSpace;

/**
 * Camera
 */
const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(4, 2, 5);
camera.position.set(4, 10, 10);

/**
 * House
 */

// Floor
const floor = new T.Mesh(
  new T.PlaneGeometry(20, 20, 100, 100),
  new T.MeshStandardMaterial({
    // color: "#a9c388",
    // wireframe: true,
    transparent: true,
    alphaMap: floorAlphaTexture, // 透明
    map: floorColorTexture, // 颜色
    aoMap: floorARMTexture, // 环境光遮蔽 (需设置 UV2)
    roughnessMap: floorARMTexture, // 粗糙度
    metalnessMap: floorARMTexture, // 金属度
    normalMap: floorNormalTexture, // 法线
    displacementMap: floorDisplacementTexture, // 位移
    displacementScale: 0.3, // 位移缩放
    displacementBias: -0.2, // 位移偏移
  }),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

const floorFolder = pane.addFolder({
  title: "Floor",
  expanded: true,
});
floorFolder.addBinding(floor.material, "displacementScale", {
  min: 0,
  max: 1,
  step: 0.01,
});
floorFolder.addBinding(floor.material, "displacementBias", {
  min: -1,
  max: 1,
  step: 0.01,
});

// House 房子
const house = new T.Group();
scene.add(house);

// Walls 墙壁
const walls = new T.Mesh(
  new T.BoxGeometry(4, 2.5, 4),
  new T.MeshStandardMaterial({
    // color: "#a9c388",
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture,
  }),
);
walls.position.y = 2.5 / 2;
house.add(walls);

// Roof 屋顶
const roof = new T.Mesh(
  new T.ConeGeometry(3.5, 1.5, 4),
  new T.MeshStandardMaterial({
    // color: "red",
    map: roofColorTexture,
    aoMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    metalnessMap: roofARMTexture,
    normalMap: roofNormalTexture,
  }),
);
roof.position.y = 2.5 + 1.5 / 2;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Door 房门
const door = new T.Mesh(
  new T.PlaneGeometry(2.2, 2.2, 100, 100),
  new T.MeshStandardMaterial({
    // color: "white",
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    roughnessMap: doorRoughnessTexture,
    metalnessMap: doorMetalnessTexture,
    normalMap: doorNormalTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.15,
    displacementBias: -0.04,
  }),
);
door.position.y = 1;
door.position.z = 2 + 0.01; // +0.01 是为了防止 z-fighting
house.add(door);

// Bushes
const bushGeometry = new T.SphereGeometry(1, 16, 16);
const bushMaterial = new T.MeshStandardMaterial({
  color: "#ccffcc",
  map: bushColorTexture,
  aoMap: bushARMTexture,
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
  normalMap: bushNormalTexture,
});

const bush1 = new T.Mesh(bushGeometry, bushMaterial);
bush1.scale.setScalar(0.5); // 缩放 0.5 倍
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = -0.75; // 用于隐藏顶部贴图的扭曲问题
house.add(bush1);

const bush2 = new T.Mesh(bushGeometry, bushMaterial);
bush2.scale.setScalar(0.25); // 缩放 0.25 倍
bush2.position.set(1.4, 0.1, 2.1);
bush2.rotation.x = -0.75;
house.add(bush2);

const bush3 = new T.Mesh(bushGeometry, bushMaterial);
bush3.scale.setScalar(0.4);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.rotation.x = -0.75;
house.add(bush3);

const bush4 = new T.Mesh(bushGeometry, bushMaterial);
bush4.scale.setScalar(0.15);
bush4.position.set(-1, 0.05, 2.6);
bush4.rotation.x = -0.75;
house.add(bush4);

// Graves 坟墓
const graveGeometry = new T.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new T.MeshStandardMaterial({
  // color: "pink",
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  normalMap: graveNormalTexture,
});

const graves = new T.Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 4;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const grave = new T.Mesh(graveGeometry, graveMaterial);
  grave.position.x = x;
  grave.position.y = Math.random() * 0.4;
  grave.position.z = z;
  grave.rotation.x = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  graves.add(grave);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new T.AmbientLight("#86cdff", 0.275);
const ambientLightFolder = pane.addFolder({
  title: "Ambient Light",
});
ambientLightFolder.addBinding(ambientLight, "intensity", {
  min: 0,
  max: 1,
  step: 0.001,
});
scene.add(ambientLight);

// Directional light
const moonLight = new T.DirectionalLight("#86cdff", 1);
moonLight.position.set(3, 2, -8);
const moonLightFolder = pane.addFolder({
  title: "Moon Light(平行光)",
});
moonLightFolder.addBinding(moonLight, "intensity", {
  min: 0,
  max: 5,
  step: 0.1,
});
moonLightFolder.addBinding(moonLight.position, "x", {
  min: -5,
  max: 5,
  step: 0.001,
});
moonLightFolder.addBinding(moonLight.position, "y", {
  min: -5,
  max: 5,
  step: 0.001,
});
moonLightFolder.addBinding(moonLight.position, "z", {
  min: -5,
  max: 5,
  step: 0.001,
});
scene.add(moonLight);

// add shadow helper
const moonLightShadowHelper = new T.CameraHelper(moonLight.shadow.camera);
moonLightShadowHelper.visible = false;
scene.add(moonLightShadowHelper);

moonLightFolder.addBinding(moonLightShadowHelper, "visible", {
  value: false,
  label: "Shadow Helper",
});

// Door Light
const doorLight = new T.PointLight("#ff7d46", 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

/**
 * Ghosts 幽灵 用灯光模拟
 */
const ghost1 = new T.PointLight("#8800ff", 6);
const ghost2 = new T.PointLight("#ff0088", 6);
const ghost3 = new T.PointLight("#ff0000", 6);
scene.add(ghost1, ghost2, ghost3);

// Axis Helper
const axisHelper = new T.AxesHelper(12);
scene.add(axisHelper);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;

// Cast and Receive Shadows
moonLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;
graves.children.forEach((grave) => {
  grave.castShadow = true;
  grave.receiveShadow = true;
});

moonLight.shadow.mapSize.set(256, 256);
// 平行光的阴影相机是正交摄像机
moonLight.shadow.camera.top = 8;
moonLight.shadow.camera.bottom = -8;
moonLight.shadow.camera.left = -8;
moonLight.shadow.camera.right = 8;
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 20;

ghost1.shadow.mapSize.set(256, 256);
ghost2.shadow.mapSize.set(256, 256);
ghost3.shadow.mapSize.set(256, 256);
ghost1.shadow.camera.far = 10;
ghost2.shadow.camera.far = 10;
ghost3.shadow.camera.far = 10;

/**
 * Sky
 */
const sky = new Sky();
sky.scale.setScalar(100);
scene.add(sky);
sky.material.uniforms["turbidity"]!.value = 10;
sky.material.uniforms["rayleigh"]!.value = 3;
sky.material.uniforms["mieCoefficient"]!.value = 0.1;
sky.material.uniforms["mieDirectionalG"]!.value = 0.95;
sky.material.uniforms["sunPosition"]!.value.set(0.3, -0.038, -0.95);

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * Frog
 */
// scene.fog = new T.Fog("#04343f", 10, 13);
scene.fog = new T.FogExp2("#04343f", 0.1);

/**
 * Animate
 */
// r163 中使用 Timer 来获取时间
const timer = new T.Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Ghost
  const ghost1Angle = elapsedTime * 0.5;
  const ghost1X = Math.cos(ghost1Angle) * 4;
  const ghost1Z = Math.sin(ghost1Angle) * 4;
  ghost1.position.x = ghost1X;
  ghost1.position.z = ghost1Z;
  // 让幽灵在空中飘动，产生一个随机的飘动效果
  ghost1.position.y =
    Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45);

  // 让Ghost2反方向运动
  const ghost2Angle = -elapsedTime * 0.38;
  const ghost2X = Math.cos(ghost2Angle) * 5;
  const ghost2Z = Math.sin(ghost2Angle) * 5;
  ghost2.position.x = ghost2X;
  ghost2.position.z = ghost2Z;
  ghost2.position.y =
    Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45);

  // Ghost3
  const ghost3Angle = elapsedTime * 0.23;
  const ghost3X = Math.cos(ghost3Angle) * 6;
  const ghost3Z = Math.sin(ghost3Angle) * 6;
  ghost3.position.x = ghost3X;
  ghost3.position.z = ghost3Z;
  ghost3.position.y =
    Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
