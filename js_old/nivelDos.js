import * as CANNON from '../dist/cannon-es.js';
import * as THREE from "../lib/three.module.js";

export function loadStructure(scene, boxMesh, world, boxBody) {
  const sizeStart = 0.4;
  const mass = 1;
  const gap = 0.3;

  const layers = 10; // Numero di strati della piramide

  // Calcola l'altezza totale della piramide
  //const totalHeight = layers * (size * 2 + gap);

  for (let i = 0; i < layers; i++) {
    const numBlocks = layers - i; // Numero di blocchi per ogni strato
    //const layerSize = numBlocks * size * 2 + (numBlocks - 1) * gap;
    const size = sizeStart - (i/layers)*sizeStart/2

    for (let j = 0; j < numBlocks; j++) {
      const body = new CANNON.Body({ mass });

      const halfExtents = new CANNON.Vec3(size, size, size);
      const shape = new CANNON.Box(halfExtents);
      body.addShape(shape);

      const x = (j - (numBlocks - 1) / 2) * (size * 2 + gap);
      const y = i * (size * 2 + gap) + size; // Invertiamo l'ordine dei blocchi
      const z = 0;

      body.position.set(x, y, z);

      boxBody.push(body);
      world.addBody(body);
      
      const boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
      const boxMaterial = new THREE.MeshPhongMaterial({color: 0xfafafa});
      const mesh = new THREE.Mesh(boxGeometry, boxMaterial);

      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      boxMesh.push(mesh);
      scene.add(mesh);
    }
  }
}
