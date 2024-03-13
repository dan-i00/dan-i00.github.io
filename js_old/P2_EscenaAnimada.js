/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
 * 
 * @author 
 * 
 */

// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/
// Modulos necesarios
//import * as THREE from '../lib/three.module.js';
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables de consenso
let renderer, scene, camera, cubo;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
var cameraControls, effectController;
var angulo = -0.01;
var material;

// Acciones
init();
loadScene();
loadGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render y el canvas
    *******************/
    renderer.setClearColor( new THREE.Color(0xFFFFFF) );
    document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( new THREE.Vector3(0,1,0) );

    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set( 0, 0, 0 );

    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('click', animate );

}

function loadScene()
{
    material = new THREE.MeshNormalMaterial( {wireframe:false} );
    const lado = 1.0;

    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/

    // Instancia el objeto BufferGeometry
	var malla = new THREE.BufferGeometry();
    // Construye la lista de coordenadas y colores por vertice
    var semilado = lado/2.0;
    var coordenadas = [ // 6caras x 4vert x3coor = 72float
                  // Front 
                  -semilado,-semilado, semilado, // 7 -> 0
                  semilado,-semilado, semilado,  // 0 -> 1
                  semilado, semilado, semilado,  // 3 -> 2
                  -semilado, semilado, semilado, // 4 -> 3
                  // Right
                  semilado,-semilado, semilado,  // 0 -> 4
                  semilado,-semilado,-semilado,  // 1 -> 5
                  semilado, semilado,-semilado,  // 2 -> 6
                  semilado, semilado, semilado,  // 3 -> 7
                  // Back
                  semilado,-semilado,-semilado,  // 1 -> 8
                  -semilado,-semilado,-semilado, // 6 -> 9
                  -semilado, semilado,-semilado, // 5 ->10
                  semilado, semilado,-semilado,  // 2 ->11
                  // Left
                  -semilado,-semilado,-semilado, // 6 ->12
                  -semilado,-semilado, semilado, // 7 ->13
                  -semilado, semilado, semilado, // 4 ->14
                  -semilado, semilado,-semilado, // 5 ->15
                  // Top
                  semilado, semilado, semilado,  // 3 ->16
                  semilado, semilado,-semilado,  // 2 ->17
                  -semilado, semilado,-semilado, // 5 ->18
                  -semilado, semilado, semilado, // 4 ->19
                  // Bottom
                  semilado,-semilado, semilado,  // 0 ->20
                  -semilado,-semilado, semilado, // 7 ->21 
                  -semilado,-semilado,-semilado, // 6 ->22
                  semilado,-semilado,-semilado   // 1 ->23
    ]
    var colores = [ // 24 x3
                  0,0,0,   // 7
                  1,0,0,   // 0
                  1,1,0,   // 3
                  0,1,0,   // 4
  
                  1,0,0,   // 0
                  1,0,1,   // 1
                  1,1,1,   // 2
                  1,1,0,   // 3
  
                  1,0,1,   // 1
                  0,0,1,   // 6
                  0,1,1,   // 5
                  1,1,1,   // 2
  
                  0,0,1,   // 6
                  0,0,0,   // 7
                  0,1,0,   // 4
                  0,1,1,   // 5
  
                  1,1,0,   // 3
                  1,1,1,   // 2
                  0,1,1,   // 5
                  0,1,0,   // 4
  
                  1,0,0,   // 0
                  0,0,0,   // 7
                  0,0,1,   // 6
                  1,0,1    // 1
    ]
    var normales = [ // 24 x3
                  0,0,1, 0,0,1, 0,0,1, 0,0,1,      // Front
                  1,0,0, 1,0,0, 1,0,0, 1,0,0,      // Right
                  0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,  // Back 
                  -1,0,0, -1,0,0, -1,0,0, -1,0,0,  // Left
                  0,1,0, 0,1,0, 0,1,0, 0,1,0,      // Top 
                  0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0   // Bottom
                  ];
    var uvs = [  // 24 x2
                 // Front
                  0/4,1/3 , 1/4,1/3 , 1/4,2/3 , 0/4,2/3 , // 7,0,3,4
                  1/4,1/3 , 2/4,1/3 , 2/4,2/3 , 1/4,2/3 , // 0,1,2,3
                  2/4,1/3 , 3/4,1/3 , 3/4,2/3 , 2/4,2/3 , // 1,6,5,2
                  3/4,1/3 , 4/4,1/3 , 4/4,2/3 , 3/4,2/3 , // 6,7,4,5
                  1/4,2/3 , 2/4,2/3 , 2/4,3/3 , 1/4,3/3 , // 3,2,5,4
                  1/4,1/3 , 1/4,0/3 , 2/4,0/3 , 2/4,1/3   // 0,7,6,1
              ];
    var indices = [ // 6caras x 2triangulos x3vertices = 36
                0,1,2,    2,3,0,    // Front
                4,5,6,    6,7,4,    // Right 
                8,9,10,   10,11,8,  // Back
                12,13,14, 14,15,12, // Left
                16,17,18, 18,19,16, // Top
                20,21,22, 22,23,20  // Bottom
                   ];
  
    scene.add( new THREE.DirectionalLight() );
  
    // Geometria por att arrays en r140
    malla.setIndex( indices );
    malla.setAttribute( 'position', new THREE.Float32BufferAttribute(coordenadas,3));
    malla.setAttribute( 'normal', new THREE.Float32BufferAttribute(normales,3));
    malla.setAttribute( 'color', new THREE.Float32BufferAttribute(colores,3));
    malla.setAttribute( 'uv', new THREE.Float32BufferAttribute(uvs,2));
  
    // Configura un material
    var textura = new THREE.TextureLoader().load( 'images/ilovecg.png' );
    //var material = new THREE.MeshLambertMaterial( { vertexColors: true, map: textura, side: THREE.DoubleSide } );
  
    // Construye el objeto grafico 
    console.log(malla);   //-> Puedes consultar la estructura del objeto
    cubo = new THREE.Mesh( malla, material );
  
      // Añade el objeto grafico a la escena
      scene.add( cubo );

}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir
    *   encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    *******************/

    // Definicion de los controles
	effectController = {
		animacion: function() {
            // Funzione di animazione
            // Eseguire le animazioni encadenadas
        },
        radioPentagono: 1.0,
        alambricoSolido: false
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control cubo");
	// Aggiunta di un pulsante per avviare le animazioni
    h.add(effectController, "animacion").name("Avvia Animazioni");
    
    // Aggiunta di uno slider per il controllo del raggio del pentagono
    h.add(effectController, "radioPentagono", 0, 10.0).name("Radio Pentagono");
    
    // Aggiunta di una checkbox per alambrico/solido
    h.add(effectController, "alambricoSolido").name("Alambrico/Solido");
}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animate(event)
{
    // Capturar y normalizar
    let x= event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = -( y / window.innerHeight ) * 2 + 1;

    // Construir el rayo y detectar la interseccion
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);
    let intersecciones = rayo.intersectObjects(cubo,true);

    console.log("click "+ intersecciones.length);

    if( intersecciones.length > 0 ){
        console.log("click cubo");

        // Genera valori casuali per i componenti RGB
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();
        const targetColor =  new THREE.Color(r, g, b);

        new TWEEN.Tween( cubo.position ).
        to( targetColor, 2000 ).
        onUpdate(function() {
            // Aggiorna il colore del materiale del cubo
            material.color.copy(startColor);
        }).
        start();
    }
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/

    // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();

  // Movimiento propio del cubo
  cubo.rotation.y += effectController.radioPentagono/50;
  cubo.rotation.x += (effectController.radioPentagono/50)/2;

  material.wireframe = effectController.alambricoSolido;

  TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}