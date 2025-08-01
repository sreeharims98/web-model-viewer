import { DEFAULT_LIGHT_SETTINGS } from "@/constants";
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Group,
  Material,
  Mesh,
  Object3DEventMap,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  Texture,
} from "three";
import {
  GLTF,
  GLTFLoader,
  OrbitControls,
  RGBELoader,
} from "three/examples/jsm/Addons.js";

/**
 * Initializes and returns a new THREE.Scene instance.
 * @returns {Scene} The created scene.
 */
export const initScene = () => {
  return new Scene();
};

/**
 * Initializes and returns a PerspectiveCamera configured for the given mount node.
 * @param {HTMLDivElement} mountNode - The DOM element to base camera aspect ratio on.
 * @returns {PerspectiveCamera} The created camera.
 */
export const initCamera = (mountNode: HTMLDivElement) => {
  const camera = new PerspectiveCamera(
    75,
    mountNode.clientWidth / mountNode.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 3, 5);
  return camera;
};

/**
 * Initializes and returns a WebGLRenderer configured for the given mount node.
 * @param {HTMLDivElement} mountNode - The DOM element to size the renderer to.
 * @returns {WebGLRenderer} The created renderer.
 */
export const initRenderer = (mountNode: HTMLDivElement) => {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer;
};

/**
 * Initializes and returns OrbitControls for the given camera and renderer.
 * @param {PerspectiveCamera} camera - The camera to control.
 * @param {WebGLRenderer} renderer - The renderer whose DOM element will be used.
 * @returns {OrbitControls} The created orbit controls.
 */
export const initOrbitControls = (
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  return controls;
};

/**
 * Applies environment map to a given scene
 */
export const setSceneEnvironment = (
  scene: Scene,
  texture: Texture,
  blurriness: number,
  useSkybox: boolean
) => {
  texture.mapping = EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = useSkybox ? texture : new Color(0xffffff);
  scene.backgroundBlurriness = blurriness;
};

/**
 * Loads HDR environment texture and applies it to the scene
 */
export const setupEnvironment = async (
  file: string | File,
  scene: Scene,
  blurriness: number = DEFAULT_LIGHT_SETTINGS.blurriness,
  useSkybox: boolean = DEFAULT_LIGHT_SETTINGS.useSkybox
): Promise<Texture> => {
  const rgbeLoader = new RGBELoader();
  let url = "";

  try {
    url = typeof file === "string" ? file : URL.createObjectURL(file);
    const texture = await rgbeLoader.loadAsync(url);
    setSceneEnvironment(scene, texture, blurriness, useSkybox);
    return texture;
  } catch (error) {
    console.error(`Error loading HDR environment: ${file}`, error);
    throw error;
  } finally {
    if (typeof file !== "string" && url) URL.revokeObjectURL(url);
  }
};

/**
 * Adds a directional key light to the scene and sets the background color.
 * @param {Scene} scene - The scene to add lighting to.
 * @return {DirectionalLight} The created directional light.
 */
export const setupLighting = (scene: Scene): DirectionalLight => {
  const light = new DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 5);
  light.castShadow = true;
  scene.add(light);
  return light;
};

//export  const addFloor = () => {
//   //add floor
//   const floor = new Mesh(
//     new PlaneGeometry(10, 10),
//     new MeshStandardMaterial({ color: 0xffffff })
//   );
//   floor.rotation.x = -Math.PI / 2;
//   floor.receiveShadow = true;
//   scene.add(floor);
// };

/**
 * Loads a GLTF model from a File object and returns its scene group.
 * @param {File} file - The GLTF file to load.
 * @returns {Promise<GLTF>} The loaded model.
 * @throws Will throw if the model fails to load.
 */
export const loadGLTFModel = async (file: File): Promise<GLTF> => {
  const url = URL.createObjectURL(file);
  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync(url);
    return gltf;
  } catch (error) {
    console.error("Error loading GLTF model:", error);
    throw error;
  } finally {
    URL.revokeObjectURL(url);
  }
};

/**
 * Centers and uniformly scales a model so its largest dimension fits a 3-unit box,
 * and positions it so its bottom sits at y=0.
 * @param {Group<Object3DEventMap>} model - The model to center and scale.
 */
export const centerAndScaleModel = (model: Group<Object3DEventMap>) => {
  const box = new Box3().setFromObject(model);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 3 / maxDim;

  model.scale.setScalar(scale);

  // Position model so its bottom sits on the floor
  model.position.set(
    -center.x * scale,
    -box.min.y * scale, // Position so bottom of model is at y=0 (floor level)
    -center.z * scale
  );
};

/**
 * Enables shadow casting and receiving for all meshes in the given model group.
 * @param {Group<Object3DEventMap>} model - The model to enable shadows for.
 */
export const enableModelShadows = (model: Group<Object3DEventMap>) => {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Returns an array of unique Material instances used by all meshes in the model group.
 * @param {Group<Object3DEventMap>} model - The model to extract materials from.
 * @returns {Material[]} Array of unique materials.
 */
export const getUniqueModelMaterials = (
  model: Group<Object3DEventMap>
): Material[] => {
  const materials = new Set<Material>();

  model.traverse((child) => {
    if (child instanceof Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => materials.add(mat));
      } else {
        materials.add(child.material);
      }
    }
  });

  return Array.from(materials);
};
