import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default class Canvas {
  constructor() {
    this.canvas = document.getElementById("app");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    // -- 카메라 세팅
    const fov = 80;
    const aspect = 400 / 647;
    const near = 0.1;
    const far = 100.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(1, 1, 1);
    // - scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#000");

    // 컨트롤러
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    //default min, max
    this.controls.minDistance = 0.2;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2.2;

    this.dirLight = new THREE.DirectionalLight(0xffffff);
    this.dirLight.position.set(0, 100, 50);
    this.dirLight.target.position.set(0, 0, 0);
    this.dirLight.intensity = 0.8;
    this.scene.add(this.dirLight);
    // - ambient light
    this.ambLight = new THREE.AmbientLight(0xffffff);
    this.ambLight.intensity = 0.5;
    this.scene.add(this.ambLight);

    //아래 세팅은 현실적인 렌더링을 위한 것입니다.
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    // this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener(
      "resize",
      () => {
        this.OnWindowResize();
      },
      false
    );

    // 포스트 프로세싱 configuration
    this.BLOOM_PARAMS = {
      exposure: 1.12,
      bloomThreshhold: 0.5,
      bloomStrength: 0.5,
      bloomRadius: 0.78,
    };
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), //해상도
      this.BLOOM_PARAMS.bloomStrength, //intensity
      this.BLOOM_PARAMS.bloomRadius, // bloom 반경
      this.BLOOM_PARAMS.bloomThreshhold // threshold
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
  }

  //동적 캔버스 사이즈
  OnWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();


    this.renderer.setSize(width, height);
  }

  // OrbitControls 최소 가시거리 설정
  SetMinControlMinDistance(dist) {
    this.controls.minDistance = dist;
  }

  // OrbitControls 최대 가시거리 설정
  SetControlMaxDistance(dist) {
    this.controls.maxDistance = dist;
  }
}
