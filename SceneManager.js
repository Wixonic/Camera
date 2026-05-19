import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export class SceneManager {
	constructor(canvas3D, canvas2D) {
		this.canvas3D = canvas3D;
		this.canvas2D = canvas2D;

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.composer = null;

		this.cameraPosition = [0, 0.15, 1.5];
		this.primaryLightPos = [4, 15, 3];
		this.secondaryLightPos = [-5, -5, 5];

		this.resizeObserver = null;
	}

	init() {
		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D });
		this.renderer.setClearAlpha(0);

		this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		this.camera.position.set(...this.cameraPosition);
		this.scene.add(this.camera);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);

		const primaryDirectionalLight = new THREE.DirectionalLight(0xffffff, 2);
		primaryDirectionalLight.position.set(...this.primaryLightPos);

		const secondaryDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
		secondaryDirectionalLight.position.set(...this.secondaryLightPos);

		this.scene.add(ambientLight, primaryDirectionalLight, secondaryDirectionalLight);

		const renderPass = new RenderPass(this.scene, this.camera);

		const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
		bloomPass.threshold = 1.0;
		bloomPass.strength = 0.2;
		bloomPass.radius = 0.1;

		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(renderPass);
		this.composer.addPass(bloomPass);

		this._handleResize();
		window.addEventListener("resize", () => this._handleResize());
	}

	_handleResize() {
		const width = window.innerWidth * window.devicePixelRatio;
		const height = window.innerHeight * window.devicePixelRatio;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
		this.composer.setSize(width, height);

		if (this.canvas2D) {
			this.canvas2D.width = width * window.devicePixelRatio;
			this.canvas2D.height = height * window.devicePixelRatio;
		}
	}

	add(object) {
		this.scene.add(object);
	}

	render() {
		this.composer.render();
	}
}