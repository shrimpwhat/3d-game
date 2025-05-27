import * as THREE from "three";

interface CameraState {
  spherical: {
    radius: number;
    phi: number; // vertical angle (polar)
    theta: number; // horizontal angle (azimuth)
  };
  mouseSensitivity: number;
}

export class Camera {
  public threeCamera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private isPointerLocked: boolean = false;

  private cameraState: CameraState = {
    spherical: {
      radius: 8,
      phi: Math.PI / 3, // 60 degrees down
      theta: 0,
    },
    mouseSensitivity: 0.002,
  };

  // Camera constraints
  private readonly minPolarAngle = 0.1;
  private readonly maxPolarAngle = Math.PI * 0.9;
  private readonly smoothingFactor = 0.15;
  private readonly minZoom = 3;
  private readonly maxZoom = 20;
  private readonly zoomSpeed = 0.5;
  // Temporary vectors for calculations
  private tempVector = new THREE.Vector3();
  private lookAtTarget = new THREE.Vector3();

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;

    // Initialize camera
    this.threeCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.threeCamera.position.set(0, 5, 10);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Pointer lock event listeners
    document.addEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this)
    );
    document.addEventListener(
      "pointerlockerror",
      this.onPointerLockError.bind(this)
    );

    // Mouse movement
    document.addEventListener("mousemove", this.onMouseMove.bind(this));

    // Mouse wheel for zoom
    this.domElement.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });

    // Click to request pointer lock
    this.domElement.addEventListener(
      "click",
      this.requestPointerLock.bind(this)
    );

    // ESC to exit pointer lock
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;

    if (!this.isPointerLocked) {
      console.log("Click on the canvas to enable camera controls");
    } else {
      console.log("Use mouse to look around, scroll to zoom, ESC to exit");
    }
  }

  private onPointerLockError(): void {
    console.error("Pointer lock failed");
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked) return;

    const { movementX, movementY } = event;

    // Update spherical coordinates based on mouse movement
    this.cameraState.spherical.theta -=
      movementX * this.cameraState.mouseSensitivity;
    this.cameraState.spherical.phi +=
      movementY * this.cameraState.mouseSensitivity;

    // Constrain phi (vertical angle)
    this.cameraState.spherical.phi = THREE.MathUtils.clamp(
      this.cameraState.spherical.phi,
      this.minPolarAngle,
      this.maxPolarAngle
    );
  }

  private onWheel(event: WheelEvent): void {
    if (!this.isPointerLocked) return;

    event.preventDefault();
    const delta = event.deltaY > 0 ? this.zoomSpeed : -this.zoomSpeed;
    this.cameraState.spherical.radius = THREE.MathUtils.clamp(
      this.cameraState.spherical.radius + delta,
      this.minZoom,
      this.maxZoom
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isPointerLocked) {
      document.exitPointerLock();
    }
  }

  private requestPointerLock(): void {
    this.domElement.requestPointerLock();
  }

  public update(_deltaTime: number, playerPosition: THREE.Vector3): void {
    const { radius, phi, theta } = this.cameraState.spherical;

    // Convert spherical to cartesian coordinates relative to player
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Set target position relative to player
    this.tempVector.set(x, y, z).add(playerPosition);

    // TODO: Add collision detection with raycasting if needed
    // For now, just use the calculated position
    const finalPosition = this.tempVector;

    // Smooth camera movement
    this.threeCamera.position.lerp(finalPosition, this.smoothingFactor);

    // Always look at the player (third-person behavior)
    this.lookAtTarget.copy(playerPosition);
    // Add a slight vertical offset to look at player's center/head
    this.lookAtTarget.y += 1.5;
    this.threeCamera.lookAt(this.lookAtTarget);

    // Update camera matrix
    this.threeCamera.updateMatrixWorld();
  }

  public dispose(): void {
    document.removeEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this)
    );
    document.removeEventListener(
      "pointerlockerror",
      this.onPointerLockError.bind(this)
    );
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    this.domElement.removeEventListener("wheel", this.onWheel.bind(this));
    this.domElement.removeEventListener(
      "click",
      this.requestPointerLock.bind(this)
    );
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
  }
}
