import * as CANNON from '../dist/cannon-es.js'
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import {loadStructure} from "./nivelDos.js"
import { PointerLockControlsCannon } from '../js/PointerLockControlsCannon.js'

// Variables de consenso
let renderer, scene, camera, world;

// Otras globales
let sphereBody, sphereShape
let boxBody=[], boxMesh=[];
let ballsBody=[], ballsMesh=[];
let controls

let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo;
let video;

var angulo = -0.01;
var material;

let lastCallTime = performance.now() / 1000
let onKeyPress 

// Acciones
init();
loadScene();
//loadGUI();
render();
animate();

function init(){
  // physics world
  world = new CANNON.World({gravity: new CANNON.Vec3(0,-8, 0)});

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  /*camera.position.z = 5;
  camera.position.y = 2;
  camera.position.x = 0;*/
  camera.position.z = 12;
  camera.position.y = 20;
  camera.position.x = 10;

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  document.getElementById('container').appendChild( renderer.domElement );
  renderer.antialias = true;
  renderer.shadowMap.enabled = true

  //document.getElementById('p').innerText="Heyy"
  
  // light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
  scene.add(ambientLight)

  const spotLight = new THREE.SpotLight(0xffffff, 0.9, 0, Math.PI / 8, 1)
  spotLight.position.set(-30, 40, 30)
  spotLight.target.position.set(0, 0, 0)

  spotLight.castShadow = true

  spotLight.shadow.camera.near = 10
  spotLight.shadow.camera.far = 100
  spotLight.shadow.camera.fov = 30

  // spotLight.shadow.bias = -0.0001
  spotLight.shadow.mapSize.width = 2048
  spotLight.shadow.mapSize.height = 2048

  scene.add(spotLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15)
  directionalLight.position.set(-30, 40, 30)
  directionalLight.target.position.set(0, 0, 0)
  scene.add(directionalLight)

  const title = `
    <div class="page-title">
      <span>ooo</span> - aaa
    </div>
  `

  const titleNode = createElementFromHTML(title)
  document.body.appendChild(titleNode)
  setupCameraMovement()
}

function createElementFromHTML(htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

function loadScene(){
  loadStructure(scene, boxMesh, world, boxBody);
  

  // ground body
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
  world.addBody(groundBody)

  // plane mesh
  const PlaneGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshPhongMaterial();
  const planeMesh = new THREE.Mesh(PlaneGeometry, planeMaterial);

  planeMesh.position.copy(groundBody.position);
  planeMesh.quaternion.copy(groundBody.quaternion);
  planeMesh.receiveShadow = true;
  scene.add(planeMesh);

  // Create the user collision sphere
  const radius = 1.3
  sphereShape = new CANNON.Sphere(radius)
  sphereBody = new CANNON.Body({ mass: 5, material: new CANNON.Material('physics') })
  sphereBody.addShape(sphereShape)
  sphereBody.position.set(camera.position.x, camera.position.y + radius * 2, camera.position.z)
  sphereBody.linearDamping = 0.9
  world.addBody(sphereBody)

/*
  // orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Opzionale: abilita smorzamento per un movimento fluido
  // Aggiorna la visualizzazione della scena quando i controlli cambiano
  controls.addEventListener('change', function () {
      renderer.render(scene, camera);
  });*/

  loadShot();

  controls = new PointerLockControlsCannon(camera, sphereBody)
  controls.enabled = true
  scene.add(controls.getObject())

  instructions.addEventListener('click', () => {
    controls.lock()
  })

  controls.addEventListener('lock', () => {
    controls.enabled = true
    instructions.style.display = 'none'
  })

  controls.addEventListener('unlock', () => {
    controls.enabled = false
    instructions.style.display = null
  })


  // Eventos
  window.addEventListener('resize', updateAspectRatio );
  renderer.domElement.addEventListener('dblclick', animate );
  document.addEventListener('keypress', onKeyPress)
  
}

function loadShot(){
  // The shooting balls
  const shootVelocity = 20
  const ballShape = new CANNON.Sphere(0.2)
  const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)

  // Returns a vector pointing the the diretion the camera is at
  function getShootDirection() {
    const vector = new THREE.Vector3(0, 0, 1)
    vector.unproject(camera)
    const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
    return ray.direction
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      const ballBody = new CANNON.Body({ mass: 1 })
      ballBody.addShape(ballShape)
      const ballMesh = new THREE.Mesh(ballGeometry, material)

      ballMesh.castShadow = true
      ballMesh.receiveShadow = true

      world.addBody(ballBody)
      scene.add(ballMesh)
      ballsBody.push(ballBody)
      ballsMesh.push(ballMesh)

      const vector = new THREE.Vector3(0, 0, 1)
      vector.unproject(camera)
      const ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize())
      const shootDirection = getShootDirection()
      ballBody.velocity.set(
        shootDirection.x * shootVelocity,
        shootDirection.y * shootVelocity,
        shootDirection.z * shootVelocity
      )

      // Move the ball outside the player
      //const x = camera.position.x + shootDirection.x * ( 1.02 + ballShape.radius)
      //const y = camera.position.y + shootDirection.y * ( 1.02 + ballShape.radius)
      //const z = camera.position.z + shootDirection.z * ( 1.02 + ballShape.radius)
      const x = camera.position.x
      const y = camera.position.y
      const z = camera.position.z
      ballBody.position.set(x, y, z)
      ballMesh.position.copy(ballBody.position)
    }
  })
}

function setupCameraMovement() {
  // Aggiungi un listener per l'evento di pressione dei tasti sulla finestra
/*  window.addEventListener('keydown', function(event) {
      // Movimento avanti
      if (event.key === 'w') {
          camera.position.z -= 0.5;
      }
      // Movimento indietro
      if (event.key === 's') {
          camera.position.z += 0.5;
      }
      // Movimento a sinistra
      if (event.key === 'a') {
          camera.position.x -= 0.5;
      }
      // Movimento a destra
      if (event.key === 'd') {
          camera.position.x += 0.5;
      }
      console.log(event.key)

      // Aggiorna la visualizzazione della scena
      renderer.render(scene, camera);
  });*/
}
// function for rendering animation
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() / 1000
  const dt = time - lastCallTime
  lastCallTime = time


    for (let i = 0; i < boxMesh.length; i++) {
      boxMesh[i].position.copy(boxBody[i].position);
      boxMesh[i].quaternion.copy(boxBody[i].quaternion);
    }

    for (let i = 0; i < ballsMesh.length; i++) {
      ballsMesh[i].position.copy(ballsBody[i].position);
      ballsMesh[i].quaternion.copy(ballsBody[i].quaternion);
    }


  
  world.fixedStep();
  controls.update(dt);
  renderer.render(scene, camera);
};

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}



function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/

        // Cambios para actualizar la camara segun mvto del raton
    //cameraControls.update();

    // Movimiento propio del cubo
    //cubo.rotation.y += effectController.radioPentagono/50;
    //cubo.rotation.x += (effectController.radioPentagono/50)/2;

    //material.wireframe = effectController.alambricoSolido;
    controls.update();
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}