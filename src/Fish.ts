import * as THREE from "three/webgpu";

export class Fish {
  //   mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.NodeMaterial;

  constructor() {
    const geometry = this.createFishGeometry();

    const mat = new THREE.MeshBasicNodeMaterial({
      color: 0xcbdceb,
      side: THREE.DoubleSide,
    });
    const s = 3;
    geometry.scale(s, s, s);

    this.geometry = geometry;
    this.material = mat;
  }

  private createFishGeometry(): THREE.BufferGeometry {
    // 魚のプロファイル（半分）を定義
    const points: THREE.Vector2[] = [
      new THREE.Vector2(-0.001, 0.15),
      new THREE.Vector2(-0.08, 0.19),
      new THREE.Vector2(-0.06, 0.17), // 尻尾先端
      new THREE.Vector2(-0.01, 0.15),
      new THREE.Vector2(-0.04, 0.12),
      new THREE.Vector2(-0.075, 0.08),
      new THREE.Vector2(-0.095, 0.04), // 中央部
      new THREE.Vector2(-0.1, 0),
      new THREE.Vector2(-0.095, -0.04),
      new THREE.Vector2(-0.08, -0.08),
      new THREE.Vector2(-0.05, -0.12),
      new THREE.Vector2(-0.004, -0.15), // 頭先端
    ];

    const g = new THREE.LatheGeometry(points, 16, 0, Math.PI * 2);
    g.computeVertexNormals();

    return g;
  }

  update() {}
}
