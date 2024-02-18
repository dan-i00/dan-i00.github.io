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

    // Caricamento dell'arancia
    const orangeLoader = new THREE.OBJLoader();
    orangeLoader.load(
        'path_to_orange_model.obj',
        function (orangeModel) {
            orange = orangeModel;
            orange.position.set(0, 1, 0);
            scene.add(orange);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% caricato');
        },
        function (error) {
            console.error('Errore nel caricamento dell\'arancia', error);
        }
    );

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

// Funzione per gestire il lancio dell'arancia
function launchOrange() {
    if (orange) {
        // Imposta la velocità e la direzione di lancio dell'arancia
        const velocity = new THREE.Vector3(0, 0, -5); // Esempio: lancia in avanti con velocità -5 lungo l'asse z
        const timeDelta = 1 / 60; // Delta tempo per la simulazione (esempio: 60 fps)
        orange.position.add(velocity.clone().multiplyScalar(timeDelta));
    }
}

// Chiamata alla funzione di inizializzazione quando il documento è pronto
init();
