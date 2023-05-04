import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";
import Canvas from "./Canvas.js";
import Car from "./Car.js";
import GLTFModels from "./GLTFModel.js";
//import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default class Engine {
  constructor() {

    // -- DOM ELEMENT
    this.zoomOutBtn = document.querySelector(".zoom-out");
    //마커 위치는 여기서 수정합니다.
    this.points = [
      {
        // 레드북(스토리)
        position: new THREE.Vector3(-0.8, 1, -0.79),
        element: document.querySelector(".point-0"),
      },
      {
        //원형테이블(견적)
        position: new THREE.Vector3(2.3, 0.7, 0.5),
        element: document.querySelector(".point-1"),
      },
      {
        //책장(자기개발)
        position: new THREE.Vector3(-2.5, 1, 2),
        element: document.querySelector(".point-2"),
      },
      {
        //우측의자(챌린지)
        position: new THREE.Vector3(2.7, 0.9, -1.5),
        element: document.querySelector(".point-3"),
      },
    ];

    //-- LOADING SETUP
    this.progressContainer = document.querySelector(".loading-container");
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onLoad = () => {
      this.points.forEach((el) => {
        el.element.classList.remove("hidden");
      });
      this.progressContainer.classList.add("hidden");
    };

    // -- CANVAS

    this.canvas = new Canvas();
    this.clock = new THREE.Clock();

    // -- 3D MODEL
    this.gltfModels = new GLTFModels(this.loadingManager);
    this.car = new Car();

    // -- HDRI
    //HDR 배경을 설정하는데 시간이 오래 걸리기 때문에, 로딩 후에 차를 로딩하도록 합니다.
    //this.rgbeLoader = new RGBELoader();
    //public폴더에서 마음에 드시는 저용량 hdr을 사용하세요(가장 고사양은 MR_INT입니다.)
    // this.rgbeLoader.load("/hdrs/MR_INT-005_WhiteNeons_NAD.hdr", (texture) => {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   this.canvas.scene.environment = texture;
    //   this.canvas.scene.background = "#000"; //이 부분을 추가하면 자동으로 배경 매핑이 됩니다. 색깔 배경을 쓰고 싶으시면 주석 처리 하세요
    //   // this.canvas.scene.background = texture; //이 부분을 추가하면 자동으로 배경 매핑이 됩니다. 색깔 배경을 쓰고 싶으시면 주석 처리 하세요
    // });
    this.car.LoadCarModel(this.gltfModels);
    this.canvas.scene.add(this.car.group);

    this.camPos = this.canvas.camera.position;
    const { x: carX, y: carY, z: carZ } = this.camPos;
    this.camPos.set(carX + 5, carY + 5, carZ + 5);
    this.canvas.controls.autoRotate = false;

    // -- SELECTIVE bloom effect

    // -- RAY CASTER
    this.raycaster = new THREE.Raycaster();
    this.intersects = [];

    // -- boolean states
    this.clicked = false;

    /**
     * Point 관련
     */
    //event listeners

    for (let point of this.points) {
      const { x, y, z } = point.position;
      let posX = x,
        posY = y,
        posZ = z;
      point.element.addEventListener("click", (e) => {
        let name = e.target.attributes.name.value;
        switch (name) {
          case "redbook":
            posX = x - 0.5;
            posY = y + 1;
            posZ = z - 1.3;
            break;
          case "pay":
            posX = x - 0.1;
            posY = y + 0.5;
            posZ = z + 1;
            break;
          case "books":
            posX = x + 1;
            posY = y + 0.5;
            posZ = z - 0.5;
            break;
          case "chair":
            posX = x - 0.3;
            posY = y + 0.6;
            posZ = z + 2.5;
            break;
        }
        this.clicked = true;
        if (x < 0 || y < 0 || z < 0) {
          gsap.to(this.canvas.camera.position, {
            x: posX,
            y: posY,
            z: posZ,
            duration: 2,
            onUpdate: () => {
              this.canvas.camera.lookAt(x, y, z);
            },
          });
        } else {
          gsap.to(this.canvas.camera.position, {
            x: x + 1,
            y: y + 1,
            z: z + 1,
            duration: 1,
            onUpdate: () => {
              this.canvas.camera.lookAt(x, y, z);
            },
          });
        }

        this.zoomOutBtn.classList.remove("hidden");
        for (let point of this.points) {
          point.element.classList.add("hidden");
        }

        //touch interaction off
        this.canvas.controls.enableRotate = false;
        this.canvas.controls.enableZoom = false;
        this.canvas.controls.enablePan = false;
      });
    }

    this.zoomOutBtn.addEventListener("click", () => {
      const { x, y, z } = this.car.group.position;
      const { x: camX, y: camY, z: camZ } = this.camPos.clone();

      if (camX < 0 || camZ < 0) {
        gsap.to(this.camPos, {
          x: x - 4,
          y: y + 4,
          z: z - 4,
          duration: 1.5,
          onUpdate: () => {
            this.canvas.camera.lookAt(x, y, z);
          },
          onComplete: () => {
            this.clicked = false;
          },
        });
      } else {
        gsap.to(this.camPos, {
          x: x + 4,
          y: y + 4,
          z: z + 4,
          duration: 1.5,
          onUpdate: () => {
            this.canvas.camera.lookAt(x, y, z);
          },
          onComplete: () => {
            this.clicked = false;
          },
        });
      }
      this.zoomOutBtn.classList.add("hidden");

      //touch interaction on
      this.canvas.controls.enableRotate = true;
      this.canvas.controls.enableZoom = true;
      this.canvas.controls.enablePan = true;
    });
  }

  EnableDebugUI() {
    // -- DEBUG
    const config = {
      bloom: true,
    };
    const gui = new GUI();
    //아래는 포인트 위치 디버깅 할때만 주석 풀어주세요
    // const position = gui.addFolder("Position");
    // const mat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    // const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    // const cube = new THREE.Mesh(geo, mat);
    // cube.position.set(0, 1, 0);
    // this.canvas.scene.add(cube);

    // const xPosControl = position
    //   .add(cube.position, "x", -100, 100, 0.01)
    //   .name("X");
    // const yPosControl = position
    //   .add(cube.position, "y", -100, 100, 0.01)
    //   .name("Y");
    // const zPosControl = position
    //   .add(cube.position, "z", -100, 100, 0.01)
    //   .name("Z");
    // xPosControl.onChange((v) => {
    //   cube.position.x = v;
    //   console.log(cube.position);
    // })
    // yPosControl.onChange((v) => {
    //   cube.position.y = v;
    //   console.log(cube.position);
    // });
    // zPosControl.onChange((v) => {
    //   cube.position.z = v;
    //   console.log(cube.position);
    // });

    gui.add(config, "bloom").onChange((v) => {
      if (v == true) {
        this.AddBloomPass();
      } else {
        this.RemoveBloomPass();
      }
    });
    // Control pannel
    const controlDistance = gui.addFolder("control distance");
    controlDistance
      .add(this.canvas.controls, "minDistance", 3, 4, 0.01)
      .name("Min")
      .onChange((v) => (this.canvas.controls.minDistance = v));
    controlDistance
      .add(this.canvas.controls, "maxDistance", 9, 9, 0.01)
      .name("max")
      .onChange((v) => (this.canvas.controls.maxDistance = v));

    //Bloom pannel
    const bloomConfig = gui.addFolder("Bloom effect");
    bloomConfig
      .add(this.canvas.BLOOM_PARAMS, "exposure", 0.1, 2)
      .name("exposure")
      .onChange(
        (v) => (this.canvas.renderer.toneMappingExposure = Math.pow(v, 4.0))
      );
    bloomConfig
      .add(this.canvas.BLOOM_PARAMS, "bloomThreshhold", 0.1, 2)
      .name("threshold")
      .onChange((v) => (this.canvas.bloomPass.threshold = Number(v)));
    bloomConfig
      .add(this.canvas.BLOOM_PARAMS, "bloomStrength", 0.1, 2)
      .name("strength")
      .onChange((v) => (this.canvas.bloomPass.strength = Number(v)));
    bloomConfig
      .add(this.canvas.BLOOM_PARAMS, "bloomRadius", 0.1, 2)
      .name("radius")
      .onChange((v) => (this.canvas.bloomPass.radius = Number(v)));
  }

  Run() {
    const Tick = () => {
      // const delta = this.clock.getDelta();
      //this.car.group.rotation.y += 0.01;

      //만약 마커가 클릭되지 않았다면 마커를 업데이트 합니다.
      if (!this.clicked) {
        this.canvas.controls.update();

        //tick에서 포인트 위치를 업데이트 해야합니다.
        for (let point of this.points) {
          const screenPos = point.position.clone();
          screenPos.project(this.canvas.camera); // 3차원 좌표를 카메라가 보는 시점의 scene으로 사영시킵니다

          const currentTime = Date.now();
          if (currentTime - this.lastRaycastTime > 100) {
            // update raycasting event for every 100ms
            this.raycaster.setFromCamera(screenPos, this.canvas.camera);
            this.intersects = this.raycaster.intersectObjects(
              this.canvas.scene.children,
              true
            );
            this.lastRaycastTime = currentTime;
          }

          if (this.intersects.length === 0) {
            point.element.classList.remove("hidden");
          } else {
            //교차점이 있다면
            const intersectionDist = this.intersects[0].distance; // 카메라와 물체 표면 사이의 거리를 구합니다
            const pointDist = point.position.distanceTo(
              // 카메라와 포인트 사이의 거리를 구합니다.
              this.canvas.camera.position
            );
            if (pointDist > intersectionDist) {
              // 포인트의 거리가 교차점 거리보다 짧다면 보이지 않도록 합니다.
              point.element.classList.add("hidden");
            } else {
              point.element.classList.remove("hidden");
            }
          }

          const translateX = screenPos.x * window.innerWidth * 0.5; //정규화된 값을 브라우저 창 크기로 변환
          const translateY = screenPos.y * window.innerHeight * 0.5;
          point.element.style.transform = `translateX(${translateX}px) translateY(${-translateY}px)`;
        }
      }

      this.canvas.OnWindowResize();
      this.canvas.composer.render(this.canvas.scene, this.canvas.camera);

      requestAnimationFrame(Tick);
    };

    //레이캐스팅 발생 횟수를 제한하는 최적화 기법을 확인했습니다.
    //
    this.lastRaycastTime = Date.now(); //initialize the last raycast time
    setInterval(() => {
      this.lastRaycastTime = 0;
    }, 100);

    Tick();
  }

  RemoveHiddenClass() {
    for (let point of this.points) {
      point.element.classList.remove("hidden");
    }
  }

  //bloom 효과 삭제
  RemoveBloomPass() {
    this.canvas.composer.removePass(this.canvas.bloomPass);
  }
  //bloom 효과 추가
  AddBloomPass() {
    this.canvas.composer.addPass(this.canvas.bloomPass);
  }

  UpdateAllMaterials() {
    this.canvas.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        // child.material.envMap = environmentMap
        child.material.envMapIntensity = debugObject.envMapIntensity;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
}
