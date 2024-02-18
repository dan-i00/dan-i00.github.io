// Setup della scena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creazione di un cubo per rappresentare il terreno
const geometry = new THREE.BoxGeometry(10, 1, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(geometry, material);
scene.add(ground);

// Creazione di un'arancia
const orangeLoader = new THREE.OBJLoader();
orangeLoader.load(
    'path_to_orange_model.obj',
    function (orange) {
        orange.position.set(0, 1, 0); // Posizione iniziale dell'arancia
        scene.add(orange);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Errore nel caricamento dell\'arancia', error);
    }
);

// Impostazione della posizione della telecamera
camera.position.z = 5;

// Aggiunta di un controllo di orbita per muovere la telecamera
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Funzione di rendering
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();