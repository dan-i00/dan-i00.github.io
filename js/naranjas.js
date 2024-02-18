// Definizione di variabili globali
let scene, camera, renderer, orange, mouseDown = false, initialMousePosition;

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
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(ground);

    // Creazione della costruzione
    const buildingGeometry = new THREE.BoxGeometry(1, 2, 1);
    const buildingMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const building = new THREE.Group();
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

    // Gestione degli eventi del mouse
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
}

// Funzione chiamata quando il mouse viene premuto sopra la sfera
function onMouseDown(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouseDown = true;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([orange]);

    if (intersects.length > 0) {
        initialMousePosition = { x: event.clientX, y: event.clientY };
    }
}

// Funzione chiamata quando il mouse viene rilasciato
function onMouseUp() {
    if (mouseDown) {
        mouseDown = false;
        const finalMousePosition = { x: event.clientX, y: event.clientY };
        const velocity = calculateVelocity(initialMousePosition, finalMousePosition);
        launchOrange(velocity);
    }
}

// Funzione chiamata quando il mouse viene spostato
function onMouseMove(event) {
    if (mouseDown) {
        const currentPosition = { x: event.clientX, y: event.clientY };
        const distance = calculateDistance(initialMousePosition, currentPosition);
        orange.position.z = distance * -0.1; // Sposta la sfera lungo l'asse z
    }
}

// Funzione per calcolare la velocità del lancio in base alla distanza del trascinamento
function calculateVelocity(initialPosition, finalPosition) {
    const deltaX = finalPosition.x - initialPosition.x;
    const deltaY = finalPosition.y - initialPosition.y;
    const velocity = new THREE.Vector3(deltaX * 0.01, deltaY * 0.01, -10); // Imposta la velocità in base alla distanza del trascinamento
    return velocity;
}

// Funzione per calcolare la distanza del trascinamento del mouse
function calculateDistance(initialPosition, finalPosition) {
    const deltaX = finalPosition.x - initialPosition.x;
    return Math.sqrt(deltaX * deltaX);
}

// Funzione per "lanciare" la sfera
function launchOrange(velocity) {
    orange.position.set(0, 1, 0);
    orange.velocity = velocity;
}

// Chiamata alla funzione di inizializzazione quando il documento è pronto
init();
