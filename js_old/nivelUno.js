import * as CANNON from '../dist/cannon-es.js'
import * as THREE from "../lib/three.module.js";

export function loadStructure(scene, boxMesh, world, boxBody){
  const size = 0.2
  const mass = 1
  const gap = 0.03

  // Layers
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 3; j++) {
      if (j != 1){
          const body = new CANNON.Body({ mass })

          let boxGeometry
          let halfExtents
          let dx
          let dz
          if (i % 2 === 0) {
          halfExtents = new CANNON.Vec3(size, size*5, size * 6)
          //boxGeometry = new THREE.BoxGeometry(size, size*5, size * 6);
          dx = 1
          dz = 0
          } else {
          halfExtents = new CANNON.Vec3(size * 6, size*5, size)
          //boxGeometry = new THREE.BoxGeometry(size * 6, size*5, size);
          dx = 0
          dz = 1
          }

          const shape = new CANNON.Box(halfExtents)
          body.addShape(shape)
          body.position.set(
          2 * (size*2 + gap) * (j - 1) * dx,
          2 * (size*5 + gap) * (i + 1),
          2 * (size*2 + gap) * (j - 1) * dz
          )
          
          boxBody.push(body)
          world.addBody(body)
          
          boxGeometry = new THREE.BoxGeometry(halfExtents.x*2, halfExtents.y*2, halfExtents.z*2);
          const boxMaterial = new THREE.MeshPhongMaterial({color: 0xfafafa,});
          const mesh = new THREE.Mesh(boxGeometry, boxMaterial);

          mesh.position.copy(body.position)
          mesh.quaternion.copy(body.quaternion)
          mesh.castShadow = mesh.receiveShadow = true;

          boxMesh.push(mesh)
          scene.add(mesh);
      }
      
    }
  }
}