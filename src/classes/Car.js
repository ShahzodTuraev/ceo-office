import * as THREE from "three";

export default class Car {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
  }

  LoadCarModel(gltfModel) {
    gltfModel.LoadGLTFModel(
      "/ceooffice/scene.gltf",
      "ceooffice",
      (gltf) => {
        const model = gltf.scene;
        this.group.add(model);

        this.group.traverse((obj) => {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.material && obj.material.map) {
            obj.material.map.encoding = THREE.sRGBEncoding;
          }
        });
      }
    );
  }
}
