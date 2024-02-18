// Definizione di variabili globali
let scene, camera, renderer, orange;

// Funzione di inizializzazione della scena
function init() {
    // Inizializzazione della scena, della telecamera e del renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Creazione del terreno
    const geometry = new THREE.BoxGeometry(10, 1, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(geometry, material);
    scene.add(ground);

    // Creazione della sfera arancia
    const orangeGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orangeMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    orange.position.set(0, 1, 0);
    scene.add(orange);

    // Impostazione della posizione della telecamera
    camera.position.z = 5;

    // Aggiunta di un controllo di orbita per muovere la telecamera
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Aggiunta di un'illuminazione
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 10, 0);
    scene.add(light);

    // Funzione di rendering
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

// Chiamata alla funzione di inizializzazione quando il documento è pronto
init();
