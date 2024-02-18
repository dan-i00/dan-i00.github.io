// Definizione di variabili globali
let scene, camera, renderer, orange, building;

// Funzione di inizializzazione della scena
function init() {
    // Inizializzazione della scena, della telecamera e del renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Creazione del terreno
    const groundGeometry = new THREE.BoxGeometry(20, 1, 20);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(ground);

    // Creazione della costruzione
    const buildingGeometry = new THREE.BoxGeometry(1, 2, 1);
    const buildingMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    building = new THREE.Group();
    for (let i = 0; i < 5; i++) {
        const cube = new THREE.Mesh(buildingGeometry, buildingMaterial);
        cube.position.set((Math.random() - 0.5) * 5, 1, (Math.random() - 0.5) * 5);
        building.add(cube);
    }
    scene.add(building);

    // Creazione della sfera arancia
    const orangeGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orangeMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    orange.position.set(0, 1, 0);
    scene.add(orange);

    // Impostazione della posizione della telecamera
    camera.position.z = 10;
    camera.position.y = 5;

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

    // Gestione dell'evento di clic per "lanciare" la sfera
    window.addEventListener('click', launchOrange);
}

// Funzione per "lanciare" la sfera
function launchOrange() {
    if (orange) {
        const orangeVelocity = new THREE.Vector3(0, 0, -10); // Velocità di lancio
        orange.position.add(orangeVelocity.clone().multiplyScalar(0.1)); // Avanza la sfera
        checkCollision(); // Controlla se c'è stata una collisione
    }
}

// Funzione per controllare la collisione tra la sfera e la costruzione
function checkCollision() {
    if (orange && building) {
        const orangePosition = orange.position;
        building.children.forEach(cube => {
            if (orangePosition.distanceTo(cube.position) < 1.5) {
                scene.remove(cube); // Rimuove il cubo colpito
            }
        });
    }
}

// Chiamata alla funzione di inizializzazione quando il documento è pronto
init();
