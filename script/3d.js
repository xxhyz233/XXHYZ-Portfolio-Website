import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

// Setting up Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop( animate );


// We NEED a Scene, Camera, Geometry, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 5;

// Add post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// OutlinePass
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 100; // Thickness
outlinePass.edgeGlow = 0.1;
outlinePass.edgeThickness = 1.0;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set(0xffffff); // Outline color
outlinePass.hiddenEdgeColor.set(0xffffff); // Hidden edge color
composer.addPass(outlinePass);

// Load the glb model
const loader = new GLTFLoader();
let banana = null;
loader.load( './media/3d/banana.glb', function (gltf) {
    banana = gltf.scene;
    banana.position.z = 0;
    banana.rotation.y = 90;
    scene.add( banana );
    outlinePass.selectedObjects = [banana];
}, undefined, function ( error ) {
    console.error( error);
});

// Light
const light = new THREE.AmbientLight( 0xffffff , 4);
scene.add(light);

// Adding the rendere into our HTML body
document.body.appendChild(renderer.domElement);

// Calls every refresh rate 
function animate() {

    // Only rotate if banana is loaded
    if (banana) {
        banana.rotation.x -= 0.01;
    banana.rotation.y -= 0.02;
    }
    
    composer.render( scene, camera );
}

