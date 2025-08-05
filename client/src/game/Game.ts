import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d";
import { Player } from "./entities";
import { Camera } from "./Camera";
import { InputManager } from "./input/InputManager";

export class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: Camera;
  private world: RAPIER.World | null = null;
  private player: Player | null = null;
  private inputManager: InputManager;
  private clock: THREE.Clock;
  private isRunning: boolean = false;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void>;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87ceeb, 1); // Sky blue

    // Initialize input manager
    this.inputManager = new InputManager();
    this.clock = new THREE.Clock();

    // Initialize camera
    this.camera = new Camera(this.renderer.domElement);

    this.setupBasicScene();

    // Handle window resize
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Initialize Rapier and the rest of the game
    this.initializationPromise = this.initializePhysics();

    this.renderer.setAnimationLoop(this.gameLoop.bind(this));
  }

  private setupBasicScene(): void {
    // Create ground (visual only, no physics yet)
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create grid helper
    const gridHelper = new THREE.GridHelper(400, 30, 0x9d4b4b, 0x9d4b4b);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Set up lighting immediately
    this.setupLighting();
  }

  public async waitForInitialization(): Promise<void> {
    return this.initializationPromise;
  }

  private async initializePhysics(): Promise<void> {
    try {
      this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
      this.player = new Player(this.world, this.scene);
      this.setupScene();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize physics:", error);
      throw error;
    }
  }
  private setupScene(): void {
    if (!this.world) return;

    // Create physics ground (visual ground already exists)
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(400, 0, 400);
    const groundCollider = this.world.createCollider(groundColliderDesc);
    groundCollider.setTranslation(new RAPIER.Vector3(0, 0, 0));
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 5000;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.threeCamera.aspect = width / height;
    this.camera.threeCamera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false); // false prevents CSS resizing
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  public start(): void {
    this.isRunning = true;
    this.gameLoop();
  }
  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta(); // Always render the scene, even if not fully initialized
    if (this.isInitialized && this.world && this.player) {
      // Update physics
      this.world.step();

      // Update camera first to get current direction
      this.camera.update(deltaTime, this.player.getPosition());

      // Update player with camera direction for relative movement
      const cameraDirection = this.camera.getForwardDirection();
      this.player.updatePlayer(
        this.inputManager.getInputState(),
        cameraDirection
      );
    } else {
      // If not initialized, just update camera with default position
      this.camera.update(deltaTime, new THREE.Vector3(0, 0, 0));
    }

    // Always render
    this.renderer.render(this.scene, this.camera.threeCamera);
  }

  public dispose(): void {
    this.stop();
    this.inputManager.dispose();
    this.camera.dispose();
    if (this.world) {
      this.world.free();
    }
    window.removeEventListener("resize", this.onWindowResize.bind(this));
  }
}
