import * as T from "three";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Objects
const group = new T.Group();
group.position.y = 1;
group.scale.y = 2;
group.rotation.y = Math.PI / 4;
scene.add(group);

const cube1 = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0xff0000 }));
group.add(cube1);

const cube2 = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0x00ff00 }));
cube2.position.x = -2;
group.add(cube2);

const cube3 = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0x0000ff }));
cube3.position.x = 2;
group.add(cube3);

// // Object
// const geometry = new T.BoxGeometry(1, 1, 1);
// const material = new T.MeshBasicMaterial({ color: 0xff0000 });
// const mesh = new T.Mesh(geometry, material);
// scene.add(mesh);

// // Position
// mesh.position.set(0.7, -0.6, 1);

// // Scale
// mesh.scale.x = 2;
// mesh.scale.y = 0.5;
// mesh.scale.z = 0.5;

// // Rotation
// mesh.rotation.reorder("YXZ"); // 改变旋转之前先进行reorder才会按照指定顺序旋转
// mesh.rotation.x = Math.PI / 4;
// mesh.rotation.y = Math.PI / 4;

// Axis Helper
const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera
const camera = new T.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
// camera.position.x = 1;
// camera.position.y = 1;
scene.add(camera);

// 相机看向哪里。默认看向坐标原点
// camera.lookAt(mesh.position);

// console.log(mesh.position.distanceTo(camera.position));

// Renderer
const renderer = new T.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
