import * as T from "three";
import { Pane } from "tweakpane";
import gsap from "gsap";

const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * Textures
 */
const textureLoader = new T.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
// gradientTexture.minFilter = T.NearestFilter;
gradientTexture.magFilter = T.NearestFilter;
// gradientTexture.generateMipmaps = false;

const parameters = {
  materialColor: "#ffeded",
};

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Meshes
 */
const objectsDistance = 4;

// 卡通材质，需要光照
const material = new T.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const mesh1 = new T.Mesh(new T.TorusGeometry(1, 0.4, 16, 64), material);
const mesh2 = new T.Mesh(new T.ConeGeometry(1, 2, 32), material);
const mesh3 = new T.Mesh(new T.TorusKnotGeometry(0.8, 0.35, 100, 16), material);

mesh1.position.y = 0;
mesh2.position.y = objectsDistance * -1;
mesh3.position.y = objectsDistance * -2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
const particlesGeometry = new T.BufferGeometry();
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
const particlesMaterial = new T.PointsMaterial({
  size: 0.03,
  color: parameters.materialColor,
  sizeAttenuation: true,
});
const particles = new T.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// --- Tweakpane 调试面板 ---
const panel = new Pane({ title: "参数调试" });
panel.addBinding(parameters, "materialColor", { picker: "inline" }).on("change", (ev) => {
  material.color.set(ev.value);
  particlesMaterial.color.set(ev.value);
});

/**
 * Lights
 */
// 平行光
const directionalLight = new T.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Camera
 */
const cameraGroup = new T.Group();
scene.add(cameraGroup);

const camera = new T.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

// Renderer
const renderer = new T.WebGLRenderer({
  canvas,
  // antialias: true,
  alpha: true, // 透明背景
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection]!.rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (evt) => {
  cursor.x = evt.clientX / sizes.width - 0.5;
  cursor.y = -(evt.clientY / sizes.height - 0.5);
});

/**
 * Animation
 */
const timer = new T.Timer();
let previousTime = 0;

function tick() {
  timer.update();

  const elapsedTime = timer.getElapsed();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // 移动相机
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  // 视差效果
  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.15;
    mesh.rotation.y += deltaTime * 0.12;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// 视口变化（含窗口 resize、移动端地址栏、DevTools 等）由 ResizeObserver 统一处理
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
