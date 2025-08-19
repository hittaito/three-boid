import * as THREE from "three/webgpu";
import init from "./wgsl/init.wgsl";
import update from "./wgsl/update.wgsl";
import vert from "./wgsl/boid.vert.wgsl";
import vert2 from "./wgsl/boid_normal.vert.wgsl";
import frag from "./wgsl/boid.frag.wgsl";
import {
  instanceIndex,
  modelWorldMatrix,
  normalLocal,
  normalWorld,
  positionLocal,
  positionWorld,
  samplerComparison,
  texture,
  uniform,
  vec3,
  wgslFn,
} from "three/tsl";
import { debug } from "./Debug";
import { Fish } from "./Fish";

const COUNT = 1500;

export class Boids {
  mesh: THREE.InstancedMesh;
  position: THREE.StorageBufferNode;
  velocity: THREE.StorageBufferNode;
  color: THREE.StorageBufferNode;

  private initFn: ReturnType<typeof wgslFn>;
  private updateFn: ReturnType<typeof wgslFn>;

  private params = { sepRad: 0.6 };
  private uSepRad: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>;
  private uTime: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>;

  private shadowMaterial: THREE.NodeMaterial;
  private basicMaterial: THREE.NodeMaterial;

  private uniforms = {
    uProjectMat: uniform(new THREE.Matrix4()),
    uViewMat: uniform(new THREE.Matrix4()),
    uLightDir: uniform(vec3()),
  };

  constructor(scene: THREE.Scene, target: THREE.WebGLRenderTarget) {
    const position = new Float32Array(COUNT * 3 * 4);
    const velocity = new Float32Array(COUNT * 3 * 4);
    const color = new Float32Array(COUNT * 3 * 4);
    const positionAttr = new THREE.StorageBufferAttribute(position, 3);
    this.position = new THREE.StorageBufferNode(positionAttr, "vec3", COUNT);

    const velocityAttr = new THREE.StorageBufferAttribute(velocity, 3);
    this.velocity = new THREE.StorageBufferNode(velocityAttr, "vec3", COUNT);

    const colorAttr = new THREE.StorageBufferAttribute(color, 3);
    this.color = new THREE.StorageBufferNode(colorAttr, "vec3", COUNT);

    // 初期化関数
    this.initFn = wgslFn(init, [
      // uniforms
    ])({
      positions: this.position,
      velocities: this.velocity,
      colors: this.color,
      index: instanceIndex,
    }).compute(COUNT);

    // 更新関数
    const uSepRad = uniform(0.4).setName("uSepRad");
    const uAliRad = uniform(1.2).setName("uAliRad");
    const uCohRad = uniform(0.7).setName("uCohRad");
    const uSepWeight = uniform(0.1).setName("uSepWeight");
    const uAliWeight = uniform(0.02).setName("uAliWeight");
    const uCohWeight = uniform(0.013).setName("uCohWeight");
    const uVelFactor = uniform(0.02).setName("uVelFactor");
    this.uTime = uniform(0).setName("uTime");

    this.updateFn = wgslFn(update, [
      uSepRad,
      uAliRad,
      uCohRad,
      uSepWeight,
      uAliWeight,
      uCohWeight,
      uVelFactor,
      this.uTime,
    ])({
      positions: this.position,
      velocities: this.velocity,
      index: instanceIndex,
    }).compute(COUNT);

    const folder = debug.addFolder("Boid");
    folder.add(this.params, "sepRad", 0, 5, 0.01).name("separation rad");
    folder.add(uAliRad, "value", 0, 5, 0.01).name("alignment rad");
    folder.add(uCohRad, "value", 0, 5, 0.01).name("cohesion rad");
    folder.add(uSepWeight, "value", 0, 0.1, 0.01).name("separation weight");
    folder.add(uAliWeight, "value", 0, 0.1, 0.01).name("alignment weight");
    folder.add(uCohWeight, "value", 0, 0.1, 0.01).name("cohesion weight");
    folder.add(uVelFactor, "value", 0, 1, 0.01).name("factor");
    this.uSepRad = uSepRad;

    const fish = new Fish();

    fish.material.positionNode = wgslFn(vert)(
      modelWorldMatrix,
      positionLocal,
      this.position.element(instanceIndex),
      this.velocity.element(instanceIndex)
    );
    fish.material.normalNode = wgslFn(vert2)(
      modelWorldMatrix,
      normalLocal,
      this.velocity.element(instanceIndex)
    );

    const shadowMaterial = new THREE.MeshBasicNodeMaterial({});
    shadowMaterial.positionNode = wgslFn(vert)(
      modelWorldMatrix,
      positionLocal,
      this.position.element(instanceIndex),
      this.velocity.element(instanceIndex)
    );

    this.shadowMaterial = shadowMaterial;
    this.basicMaterial = fish.material;
    fish.material.fragmentNode = wgslFn(frag, [
      this.uniforms.uProjectMat.setName("uProjectMat"),
      this.uniforms.uViewMat.setName("uViewMat"),
      this.uniforms.uLightDir.setName("uLightDir"),
    ])(
      this.color.element(instanceIndex),
      positionWorld,
      normalWorld,
      texture(target.depthTexture!),
      samplerComparison(target.depthTexture!)
    );

    this.mesh = new THREE.InstancedMesh(fish.geometry, fish.material, COUNT);

    scene.add(this.mesh);
  }

  async initialize(renderer: THREE.Renderer) {
    await renderer.computeAsync(this.initFn);
  }
  update(renderer: THREE.Renderer, t: number) {
    this.uTime.value = t;
    this.uSepRad.value = this.params.sepRad + (Math.sin(t * 0.4) + 1) * 0.35;
    renderer.compute(this.updateFn);
  }

  setShadowMaterial() {
    this.mesh.material = this.shadowMaterial;
  }
  setBasicMaterial(camera: THREE.Camera) {
    this.uniforms.uProjectMat.value = camera.projectionMatrix;
    this.uniforms.uViewMat.value = camera.matrixWorldInverse;
    this.uniforms.uLightDir.value = camera.position;
    this.mesh.material = this.basicMaterial;
  }
}
