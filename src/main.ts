import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";
import { Boids } from "./boids";
// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("#app")!;

// Scene
const scene = new THREE.Scene();
// #133e87ff
scene.background = new THREE.Color(0xf3f3e0);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 15);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const size = 15;

const orth = new THREE.OrthographicCamera(-size, size, size, -size, 0.1, 50);
orth.position.set(9 * 1.5, 15 * 1.5, 10 * 1.5);
orth.lookAt(0, 0, 0);
orth.updateMatrix();
orth.updateProjectionMatrix();

const depthTexture = new THREE.DepthTexture(2048, 2048);
depthTexture.compareFunction = THREE.LessCompare;
depthTexture.format = THREE.DepthFormat;
const map = new THREE.WebGLRenderTarget(2048, 2048, {
  stencilBuffer: false,
  depthTexture,
  colorSpace: THREE.SRGBColorSpace,
});

// Boid
const boids = new Boids(scene, map);

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  forceWebGL: false,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// initialize
await boids.initialize(renderer);

// clock
const clock = new THREE.Clock(true);

/**
 * Animate
 */

const tick = () => {
  // Update controls
  const t = clock.getElapsedTime();
  boids.update(renderer, t);
  controls.update();

  // shadow render
  renderer.setRenderTarget(map);

  boids.setShadowMaterial();
  renderer.render(scene, orth);

  // Render
  renderer.setRenderTarget(null);
  boids.setBasicMaterial(orth);

  renderer.render(scene, camera);
};

renderer.setAnimationLoop(tick);
