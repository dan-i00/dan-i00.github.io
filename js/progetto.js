import * as CANNON from '../dist/cannon-es.js'
import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js'
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js'
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";
import {loadStructure} from "../js_old/nivelTres.js";
//import "./timer.js";
//      import { VoxelLandscape } from './js/VoxelLandscape.js'

/**
 * Example construction of a voxel world and player.
 */

//localStorage.setItem("alturaPiramide",  5);
//localStorage.setItem("nivel", 1);

// three.js variables
let camera, scene, renderer, stats
let floor
let boxMesh=[];

// Generic material
var materialFloor = new THREE.MeshLambertMaterial({ color: 0xdddddd })
var materialBall = new THREE.MeshLambertMaterial({ color: 0xFF0000 })

// cannon.js variables
let world
let controls
const timeStep = 1 / 60
let lastCallTime = performance.now() / 1000
let sphereShape
let sphereBody
let physicsMaterial
let voxels
let boxBody=[]
var tesoro = {body: ""}

// localStorage variables
var Snivel = localStorage.getItem("nivel");
var nivel = 1
if (Snivel) 
  nivel = parseInt(Snivel);


var StringaAlturaPiramide = localStorage.getItem("alturaPiramide");
var alturaPiramide = 5
if (StringaAlturaPiramide) 
  alturaPiramide = parseInt(StringaAlturaPiramide);

var StringMessage = localStorage.getItem("StringMessage");
if (!StringMessage)
  StringMessage = "<span>Nivel " + nivel +" </span> <h1>Encuentra el tesoro escondido en la pirámide </h1><br />(W,A,S,D = Move, SPACE = Jump, MOUSE = Look, CLICK = Shoot, Q = Ball's explosion)"


const balls = []
const ballMeshes = []

// Number of voxels
const nx = 50
const ny = 8
const nz = 50

// Scale of voxels
const sx = 0.5
const sy = 0.5
const sz = 0.5

// Variable para rastrear el tiempo transcurrido en milisegundos
let elapsedTime = 20 * 1000 * nivel;
let isRunning = true;
let intervalId;

initThree()
initCannon()
initPointerLock()
animate()

function initThree() {
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  // Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 0, 500)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(scene.fog.color)

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  document.body.appendChild(renderer.domElement)

  // Stats.js
  stats = new Stats()
  document.body.appendChild(stats.dom)

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

  // Floor
  const floorGeometry = new THREE.PlaneBufferGeometry(300, 300, 50, 50)
  floorGeometry.rotateX(-Math.PI / 2)
  floor = new THREE.Mesh(floorGeometry, materialFloor)
  floor.receiveShadow = true
  scene.add(floor)

  instructions.innerHTML = StringMessage

  if (localStorage.getItem("text_estadisticas"))
    Estadisticas.innerHTML = localStorage.getItem("text_estadisticas");
  else
    Estadisticas.innerHTML = ""

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function initCannon() {
  // Setup world
  world = new CANNON.World()

  // Tweak contact properties.
  // Contact stiffness - use to make softer/harder contacts
  world.defaultContactMaterial.contactEquationStiffness = 1e9

  // Stabilization time in number of timesteps
  world.defaultContactMaterial.contactEquationRelaxation = 4

  const solver = new CANNON.GSSolver()
  solver.iterations = 7
  solver.tolerance = 0.1
  world.solver = new CANNON.SplitSolver(solver)
  // use this to test non-split solver
  // world.solver = solver

  world.gravity.set(0, -20, 0)

  world.broadphase.useBoundingBoxes = true

  // Create a slippery material (friction coefficient = 0.0)
  physicsMaterial = new CANNON.Material('physics')
  const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
    friction: 0.0,
    restitution: 0.3,
  })

  // We must add the contact materials to the world
  world.addContactMaterial(physics_physics)

  // Create the user collision sphere
  const radius = 1.3
  sphereShape = new CANNON.Sphere(radius)
  sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
  sphereBody.addShape(sphereShape)
  sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5)
  sphereBody.linearDamping = 0.9
  world.addBody(sphereBody)

  // Create the ground plane
  const groundShape = new CANNON.Plane()
  const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(groundBody)

  loadStructure(scene, boxMesh, world, boxBody, tesoro, alturaPiramide);

  // The shooting balls
  const shootVelocity = 30
  const ballShape = new CANNON.Sphere(0.2)
  const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)

  // Returns a vector pointing the the diretion the camera is at
  function getShootDirection() {
    const vector = new THREE.Vector3(0, 0, 1)
    vector.unproject(camera)
    const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
    return ray.direction
  }

  window.addEventListener('click', (event) => {
    if (!controls.enabled) {
      return
    }

    const ballBody = new CANNON.Body({ mass: 5 })
    ballBody.addShape(ballShape)
    var ballMesh = new THREE.Mesh(ballGeometry, materialBall)

    ballMesh.castShadow = true
    ballMesh.receiveShadow = true

    world.addBody(ballBody)
    scene.add(ballMesh)
    balls.push(ballBody)
    ballMeshes.push(ballMesh)

    const shootDirection = getShootDirection()
    ballBody.velocity.set(
      shootDirection.x * shootVelocity,
      shootDirection.y * shootVelocity,
      shootDirection.z * shootVelocity
    )

    // Move the ball outside the player sphere
    const x = sphereBody.position.x + shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
    const y = sphereBody.position.y + shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
    const z = sphereBody.position.z + shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
    ballBody.position.set(x, y, z)
    ballMesh.position.copy(ballBody.position)
  })

  // Aggiungi un listener per l'evento keydown al documento
  document.addEventListener('keydown', function(event) {
    // Verifica se il tasto premuto è 'q' (il codice del tasto è 81)
    if (event.key === 'q') {
      if (!controls.enabled || balls.length == 0) {
        return
      }

      var potencia = 5
      //var ballMesh = ballMeshes.pop()
      var ballMesh = ballMeshes[ballMeshes.length - 1]
      ballMesh.scale.set(potencia,potencia,potencia);
      ballMesh.visible = false

      var ball = balls[balls.length - 1]
      const ballShape = new CANNON.Sphere(1)
      
      ball.shapes = []; // Rimuovi tutte le forme esistenti
      ball.addShape(ballShape);
      ball.velocity.set(
        ball.velocity.x * potencia,
        ball.velocity.y * potencia,
        ball.velocity.z * potencia
      )

      animate()

      //scene.remove(ballMeshes.pop());
      //world.removeBody(balls.pop());
    }
  });

  document.addEventListener('keyup', function(event) {
    // Verifica se il tasto premuto è 'q' (il codice del tasto è 81)
    if (event.key === 'q') {
      if (!controls.enabled || balls.length == 0) {
        return
      }
      scene.remove(ballMeshes.pop());
      world.removeBody(balls.pop());
    }
  })

  // Registra un gestore di eventi per l'evento di collisione
  world.addEventListener('beginContact', function(event){
    // Verifica se uno dei corpi è l'oggetto cannon che vuoi controllare
  if(event.bodyA === sphereBody && event.bodyB === tesoro.body){  
    var time = formatTime(20 * 1000 * nivel - elapsedTime)     
    var text_estadisticas = "<h2> Estadisticas </h2><br/>"
    for (let i = 1; i < nivel; i++) {
      text_estadisticas += "Nivel " + i +": " + localStorage.getItem("elapsedTime"+i) + "<br/>"
    }
    text_estadisticas += "Nivel " + nivel +": " + time + "<br/>"

    localStorage.setItem("text_estadisticas", text_estadisticas);

      if (nivel < 3){
        
        localStorage.setItem("elapsedTime"+nivel, time);
        localStorage.setItem("alturaPiramide", alturaPiramide + 3);
        localStorage.setItem("nivel", nivel+1);
        localStorage.setItem("StringMessage",'<span>¡Nivel ' + nivel + ' completado en '+ time +' !</span> <br /> Haga clic para ir al siguiente nivel');

        window.location.reload();
      }
      else{
        localStorage.setItem("alturaPiramide", 5);
        localStorage.setItem("nivel", 1);
        localStorage.setItem("StringMessage",'<span>¡Has completado todos los niveles!</span> <br /> Haga clic para rempezar el juego');
        
        window.location.reload();
      }
    }
  });


}

function initPointerLock() {
  controls = new PointerLockControlsCannon(camera, sphereBody)
  scene.add(controls.getObject())

  instructions.addEventListener('click', () => {  
    StringMessage = "<span>Nivel " + nivel +" </span> <h1>Encuentra el tesoro escondido en la pirámide </h1><br />(W,A,S,D = Move, SPACE = Jump, MOUSE = Look, CLICK = Shoot, Q = Ball's explosion)"
    localStorage.setItem("StringMessage", StringMessage)
    instructions.innerHTML = StringMessage
    
    if(nivel == 1){
      Estadisticas.innerHTML = ""
      localStorage.setItem("text_estadisticas", "");
    }

    isRunning = true
    controls.lock()
  })

  controls.addEventListener('lock', () => {
    controls.enabled = true
    instructions.style.display = 'none'
    isRunning = true
  })

  controls.addEventListener('unlock', () => {
    controls.enabled = false
    instructions.style.display = null
  })
  
}

function animate() {
  requestAnimationFrame(animate)

  const time = performance.now() / 1000
  const dt = time - lastCallTime
  lastCallTime = time

  if (controls.enabled) {
    world.step(timeStep, dt)

    // Update cox positions
    for (let i = 0; i < boxMesh.length; i++) {
      boxMesh[i].position.copy(boxBody[i].position);
      boxMesh[i].quaternion.copy(boxBody[i].quaternion);
    }

    // Update ball positions
    for (let i = 0; i < balls.length; i++) {
      ballMeshes[i].position.copy(balls[i].position)
      ballMeshes[i].quaternion.copy(balls[i].quaternion)
    }
  }
  else
    isRunning = false

  controls.update(dt)
  renderer.render(scene, camera)
  stats.update()
}



// Función para formatear el tiempo en minutos, segundos y milisegundos
function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const remainingMilliseconds = milliseconds % 1000;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${remainingMilliseconds.toString().padStart(3, '0')}`;
}

// Función para actualizar el temporizador y mostrarlo en tiempo real en la página
function updateTimer() {
  // Incrementar el tiempo transcurrido si el cronómetro está en ejecución
  if (isRunning) {
    elapsedTime -= 100;
    document.getElementById('timer').textContent = formatTime(elapsedTime);

    if (elapsedTime <= 10000){
      document.getElementById('timer').style.color = 'red';

      if (elapsedTime % 400 == 0)
        document.getElementById('timer').style.borderColor = 'red'; // Cambiar el color del borde a rojo
      if (elapsedTime % 400 == 200)
        document.getElementById('timer').style.borderColor = 'white'; // Cambiar el color del borde a rojo
    }

    if (elapsedTime <= 0){
      //elapsedTime = 0
      isRunning = false
      localStorage.setItem("StringMessage",'<span>¡Game over!</span> <br /> Haga clic para rempezar el nivel');
      window.location.reload();
    }
  }
}

// Iniciar el temporizador, actualizando el tiempo cada 100 milisegundos (10 veces por segundo)
intervalId = setInterval(updateTimer, 100);


// GUI 

// Define GUI parameters
const guiParams = {
  gravityX: 0,
  gravityY: -20,
  gravityZ: 0,
  shootVelocity: 30,
  showStats: true,
  showTimer: true,
  showEstadisticas: true,
  ballColor: '#ff0000', // Default red color
  floorColor: '#dddddd' // Default light gray color
};

let gui;

// Function to create GUI menu
function createGUI() {
  gui = new GUI();
  gui.add(guiParams, 'shootVelocity', 0, 50).name('Shoot Velocity');
  gui.addColor(guiParams, 'ballColor').name('Ball Color').onChange(updateBallColor);
  gui.addColor(guiParams, 'floorColor').name('Floor Color').onChange(updateFloorColor);
  gui.add(guiParams, 'showStats').name('Show Stats').onChange(showHideStats);
  gui.add(guiParams, 'showTimer').name('Show Timer').onChange(showHideTimer);
  gui.add(guiParams, 'showEstadisticas').name('Show Estadisticas').onChange(showHideEstadisticas);
}

// Function to update parameters
function showHideStats() {
  stats.dom.style.display = guiParams.showStats ? 'block' : 'none';
}

function showHideTimer() {
  if (guiParams.showTimer) {
    document.getElementById('timer').style.display = 'block';
  } else {
    document.getElementById('timer').style.display = 'none';
  }
}

function showHideEstadisticas() {
  if (guiParams.showEstadisticas) {
    document.getElementById('Estadisticas').style.display = 'block';
  } else {
    document.getElementById('Estadisticas').style.display = 'none';
  }
}

function updateBallColor() {
  for (let i = 0; i < ballMeshes.length; i++) {
    ballMeshes[i].material.color.set(guiParams.ballColor);
  }
}

function updateFloorColor() {
  floor.material.color.set(guiParams.floorColor);
}


createGUI()