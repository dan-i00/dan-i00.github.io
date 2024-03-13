import * as CANNON from '../dist/cannon-es.js';
import * as THREE from "../lib/three.module.js";

var stampa="\n"
var tesoroPositionado = false

export function loadStructure(scene, boxMesh, world, boxBody) {
  const size = 0.5
  const mass = 1
  const gap = 0.01
  var dimensionLinea = 7
  const yTesoro = Math.floor(Math.random() * (dimensionLinea - 2))
  var xTesoro = Math.floor(Math.random() * (dimensionLinea - yTesoro - 2)) + 1
  var zTesoro = Math.floor(Math.random() * (dimensionLinea - yTesoro - 2)) + 1
  
  const materialTesoro = new THREE.MeshLambertMaterial({ color: 0xdddddd })

      // Layers
      for (let i = 0; i < 7; i++) {
        dimensionLinea --
        for (let j = 0; j < dimensionLinea; j++) {
          var dimLineaRestante = dimensionLinea
          
          creaLíneaAlterna (dimLineaRestante, mass, size, gap, i, j, dimensionLinea, scene, boxMesh, world, boxBody, 1)
          stampa += " | "
          /*if (i % 2 == 0)
            creaLíneaAlterna (dimLineaRestante/2-1, mass, size, gap, i, j, dimensionLinea/2, scene, boxMesh, world, boxBody, 2)
          else
            creaLíneaAlterna (dimLineaRestante/2, mass, size, gap, i, j, dimensionLinea/2, scene, boxMesh, world, boxBody, 2)*/

          /*if (i == yTesoro && tesoroPositionado == false && (i % 2 == 0 && j == xTesoro || i % 2 == 1 && j == zTesoro)){
              let dimLineaPrimeraParte
              if (i % 2 == 0)
                dimLineaPrimeraParte = zTesoro
              else
                dimLineaPrimeraParte = xTesoro
              
              creaLíneaAlterna (dimLineaPrimeraParte - 1, mass, size, gap, i, j, dimensionLinea, scene, boxMesh, world, boxBody)
              
              const ballShape = new CANNON.Sphere(0.2)
              const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)
              const ballBody = new CANNON.Body({ mass: 5 })
              ballBody.addShape(ballShape)
              var ballMesh = new THREE.Mesh(ballGeometry, materialTesoro)
              world.addBody(ballBody)
              scene.add(ballMesh)
              boxBody.push(ballBody)
              boxMesh.push(ballMesh)
              ballBody.position.set(xTesoro - dimensionLinea/2, yTesoro, zTesoro-dimensionLinea/2)
              ballMesh.position.copy(ballBody.position)
              tesoroPositionado=true
  
              creaLíneaAlterna (dimLineaRestante - dimLineaPrimeraParte, mass, size, gap, i, j, dimLineaRestante - dimLineaPrimeraParte, scene, boxMesh, world, boxBody)
            }
            else
              creaLíneaAlterna (dimLineaRestante, mass, size, gap, i, j, dimensionLinea, scene, boxMesh, world, boxBody)*/
        }
        stampa += "\n"
      }
      console.log(stampa)
}

function getRandomColor() {
  // Genera valori casuali per i componenti RGB
  var r = Math.floor(Math.random() * 256); // Intensità del rosso da 0 a 255
  var g = Math.floor(Math.random() * 256); // Intensità del verde da 0 a 255
  var b = Math.floor(Math.random() * 256); // Intensità del blu da 0 a 255

  // Formatta i valori RGB in notazione esadecimale
  var hexR = r.toString(16).padStart(2, '0'); // Converte il valore decimale in esadecimale e assicura che abbia almeno due cifre
  var hexG = g.toString(16).padStart(2, '0');
  var hexB = b.toString(16).padStart(2, '0');

  // Unisce i valori esadecimali per creare il colore in formato "#RRGGBB"
  var hexColor = '#' + hexR + hexG + hexB;

  return hexColor;
}

function creaLíneaAlterna (dimLineaRestante, mass, size, gap, i, j, dimensionLinea, scene, boxMesh, world, boxBody, n) {
  
  while (dimLineaRestante > 0) {
    const body = new CANNON.Body({ mass })
    var dimObjeto =  Math.floor(Math.random() * (dimLineaRestante)) + 1;
    var halfExtents = new CANNON.Vec3(size, size, size * dimObjeto)
    let dx
    let dz
    let shape, boxGeometry, boxMaterial

    if (i % 2 === 0) {
      halfExtents = new CANNON.Vec3(size, size, size * dimObjeto)
      dx = 1
      dz = 0
    } else {
      halfExtents = new CANNON.Vec3(size * dimObjeto, size, size)
      dx = 0
      dz = 1
    }

    if (dimObjeto == 1 && !tesoroPositionado && dimLineaRestante != dimensionLinea && dimLineaRestante != 1 && j != dimensionLinea - 1 && j != 0){
      shape = new CANNON.Sphere(0.5)
      boxGeometry = new THREE.SphereBufferGeometry(shape.radius, 32, 32)
      
      boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Colore giallo oro
        emissive: 0xFFD700, // Colore luminoso giallo oro
        emissiveIntensity: 25, // Intensità della luce emessa
        side: THREE.DoubleSide // Renderizza entrambi i lati del cubo
      });
      stampa += "0"
      tesoroPositionado=true
    }
    else{
      shape = new CANNON.Box(halfExtents)
      boxGeometry = new THREE.BoxGeometry(halfExtents.x*2, halfExtents.y*2, halfExtents.z*2);
      boxMaterial = new THREE.MeshPhongMaterial({color: getRandomColor(),});

      for (let h = 0; h < dimObjeto; h++) 
        stampa += "*"
    }


    shape = new CANNON.Box(halfExtents)
    body.addShape(shape)
    body.position.set(
      2 * (size + gap) * (j - dimensionLinea/2 + 0.5) * dx + (1 - dx) * (dimLineaRestante - dimObjeto / 2 - dimensionLinea/2),
      2 * (size + gap) * (i + 1),
      2 * (size + gap) * (j - dimensionLinea/2 + 0.5) * dz + (1 - dz) * (dimLineaRestante - dimObjeto / 2 - dimensionLinea/2)
    )

    boxBody.push(body)
    world.addBody(body)

    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);

    mesh.position.copy(body.position)
    mesh.quaternion.copy(body.quaternion)
    mesh.castShadow = mesh.receiveShadow = true;

    boxMesh.push(mesh)
    scene.add(mesh);

    

    dimLineaRestante -= dimObjeto
  }
}


