//*********************d
//Canvas and cameras
//*********************

let canvas = document.getElementById("gl-canvas");
let context = canvas.getContext('webgl2', { alpha: false });
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xaac0dd);
scene.fog = new THREE.Fog(0xcce0ff, 50, 2000);

let width = canvas.clientWidth, height = canvas.clientHeight;

// --- EXTRA CREDIT: Setup for ArrayCamera ---
const AMOUNT = 4;
const ASPECT_RATIO = (width / 2) / (height / 2); 
let subCameras = [];

// 1. User View (Perspective)
let cam1 = new THREE.PerspectiveCamera(75, ASPECT_RATIO, 0.1, 10000);
cam1.viewport = new THREE.Vector4(0, height/2, width/2, height/2);
cam1.position.z = 200;
subCameras.push(cam1);

// 2. Top Down View (Orthographic)
let cam2 = new THREE.OrthographicCamera(-400, 400, 400, -400, 1, 10000);
cam2.viewport = new THREE.Vector4(width/2, height/2, width/2, height/2);
cam2.position.set(0, 0, 500);
cam2.lookAt(0, 0, 0);
subCameras.push(cam2);

// 3. Side View (Perspective)
let cam3 = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 10000);
cam3.viewport = new THREE.Vector4(0, 0, width/2, height/2);
cam3.position.set(0, -400, 50);
cam3.lookAt(0, 0, 50);
cam3.up.set(0, 0, 1);
subCameras.push(cam3);

// 4. Cannon POV (Perspective)
let cam4 = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 10000);
cam4.viewport = new THREE.Vector4(width/2, 0, width/2, height/2);
cam4.position.set(160, 0, 40);
cam4.lookAt(-100, 0, 20);
cam4.up.set(0, 0, 1);
subCameras.push(cam4);

let arrayCamera = new THREE.ArrayCamera(subCameras);
arrayCamera.position.z = 200;

let cameras = {
    perspective: new THREE.PerspectiveCamera(75, width / height, 0.1, 10000),
    orthographic: new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 10000),
    array: arrayCamera
};

cameras.perspective.position.z = 200;
cameras.orthographic.position.z = 200;
let camera = cameras.perspective;

let renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
renderer.setSize(width, height, false);
renderer.shadowMap.enabled = true;
let dpr = window.devicePixelRatio || 1;
renderer.setPixelRatio(dpr);

function resizeCanvas(forceResize = false) {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (width != w || height != h || forceResize) {
        width = w; height = h;
        renderer.setSize(w, h, false);
        
        cameras.perspective.aspect = w / h;
        cameras.perspective.updateProjectionMatrix();
        
        cameras.orthographic.left = w / -2;
        cameras.orthographic.right = w / 2;
        cameras.orthographic.top = h / 2;
        cameras.orthographic.bottom = h / -2;
        cameras.orthographic.updateProjectionMatrix();

        let subW = w/2;
        let subH = h/2;
        subCameras[0].viewport.set(0, subH, subW, subH);
        subCameras[0].aspect = subW/subH;
        subCameras[0].updateProjectionMatrix();

        subCameras[1].viewport.set(subW, subH, subW, subH);
        subCameras[2].viewport.set(0, 0, subW, subH);
        subCameras[2].aspect = subW/subH;
        subCameras[2].updateProjectionMatrix();

        subCameras[3].viewport.set(subW, 0, subW, subH);
        subCameras[3].aspect = subW/subH;
        subCameras[3].updateProjectionMatrix();
    }
}
resizeCanvas(true);

let controls = new THREE.OrbitControls(camera, canvas);

//*********************
//Add lights and background
//*********************
let ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);
let hemisphereLight = new THREE.HemisphereLight(0x303F9F, 0x000000, 0.5);
scene.add(hemisphereLight);
let directionalLight = new THREE.DirectionalLight(0xdfebff, 1);
directionalLight.position.set(20, 20, 100);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -300;
directionalLight.shadow.camera.right = 300;
directionalLight.shadow.camera.top = 300;
directionalLight.shadow.camera.bottom = -300;
scene.add(directionalLight);

let groundGeometry = new THREE.PlaneBufferGeometry(800, 800);
let groundMaterial = new THREE.MeshLambertMaterial({ color: 0x444422 });
let ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(0, 0, -1);
ground.receiveShadow = true;
scene.add(ground);

//*********************
//Add cannons
//*********************
let cannonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffaa, metalness: 0.8, roughness: 0.6 });
cannonMaterial.side = THREE.DoubleSide;
let cannonBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xddddaa, metalness: 0.1, roughness: 0.9 });
let cannonBaseGeometry = new THREE.BoxBufferGeometry(20, 40, 10);
let cannonSideGeometry = new THREE.BoxBufferGeometry(4, 40, 15);

let cannonTubePoints = [];
let cannonEndRadius = 5, cannonBodyOffset = 15;
let cannonMainLength = 35, cannonRadiusDiff = 2, cannonOpeningLength = 5, cannonOpeningRadiusDiff = 1;
let cannonballStartingLength = cannonEndRadius + cannonMainLength + cannonOpeningLength - cannonBodyOffset;

for (let i = 0; i < 10; i++) {
    cannonTubePoints.push(new THREE.Vector2(cannonEndRadius * Math.sin((Math.PI / 2) * i / 10), cannonEndRadius * (1 - Math.cos((Math.PI / 2) * i / 10)) - cannonBodyOffset));
}
for (let i = 0; i < 10; i++) {
    cannonTubePoints.push(new THREE.Vector2(cannonEndRadius - cannonRadiusDiff * i / 10, cannonMainLength / 10 * i + cannonEndRadius - cannonBodyOffset));
}
for (let i = 0; i < 10; i++) {
    cannonTubePoints.push(new THREE.Vector2(cannonEndRadius - cannonRadiusDiff + cannonOpeningRadiusDiff * i / 10, cannonOpeningLength * i / 10 + cannonMainLength + cannonEndRadius - cannonBodyOffset));
}
let cannonBodyGeometry = new THREE.LatheBufferGeometry(cannonTubePoints);

function addCannon(position, quaternion) {
    let base = new THREE.Mesh(cannonBaseGeometry, cannonBaseMaterial);
    base.position.copy(position);
    base.quaternion.copy(quaternion);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    let body = new THREE.Mesh(cannonBodyGeometry, cannonMaterial);
    body.position.set(0, -10, 20);
    body.castShadow = true;
    base.add(body);
    base.body = body;

    let side1 = new THREE.Mesh(cannonSideGeometry, cannonBaseMaterial);
    side1.position.set(8, 0, 10);
    side1.castShadow = true;
    base.add(side1);
    
    let side2 = new THREE.Mesh(cannonSideGeometry, cannonBaseMaterial);
    side2.position.set(-8, 0, 10);
    side2.castShadow = true;
    base.add(side2);
    
    return base;
}

let up = new THREE.Vector3(0, 0, 1);
let cannon1 = addCannon(new THREE.Vector3(150, 0, 5), new THREE.Quaternion().setFromAxisAngle(up, Math.PI / 2));
let cannon2 = addCannon(new THREE.Vector3(-150, 0, 5), new THREE.Quaternion().setFromAxisAngle(up, -Math.PI / 2));

function rotateCannonsVertically(angle) {
    let rad = angle * Math.PI / 180;
    cannon1.body.rotation.x = rad;
    cannon2.body.rotation.x = rad;
}

function rotateCannonsHorizontally(angle) {
    let rad = angle * Math.PI / 180;
    cannon1.rotation.z = (Math.PI / 2) + rad;
    cannon2.rotation.z = (-Math.PI / 2) - rad;
}

rotateCannonsVertically(30);

//*********************
// Cannon Movement
//*********************
let moveSpeed = 2;

let keyState = {};
window.addEventListener('keydown', (e) => keyState[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keyState[e.key.toLowerCase()] = false);

function updateCannonMovement() {
    // Cannon1: IJKL
    if(keyState['i']) cannon1.position.y += moveSpeed;
    if(keyState['k']) cannon1.position.y -= moveSpeed;
    if(keyState['j']) cannon1.position.x -= moveSpeed;
    if(keyState['l']) cannon1.position.x += moveSpeed;

    // Cannon2: WASD
    if(keyState['w']) cannon2.position.y += moveSpeed;
    if(keyState['s']) cannon2.position.y -= moveSpeed;
    if(keyState['a']) cannon2.position.x -= moveSpeed;
    if(keyState['d']) cannon2.position.x += moveSpeed;
}

//*********************
//Firing cannons
//*********************
let cannonballRadius = 4;
let cannonballStartingSpeed = 50;
let sphereList = [], recycledSphereList = [];
let sphereGeometry = new THREE.SphereBufferGeometry(cannonballRadius, 32, 32);
let sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 1 });
let sphereMaterial2 = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 1 });

function fireCannon(cannon, material = sphereMaterial) {
    let sphere;
    if (recycledSphereList.length > 0) { sphere = recycledSphereList.pop(); }
    else {
        sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.castShadow = true;
    }
    sphereList.push(sphere);
    
    let startPosition = cannon.body.localToWorld(new THREE.Vector3(0, cannonballStartingLength, 0));
    sphere.position.copy(startPosition);
    
    let startingDirection = cannon.body.localToWorld(new THREE.Vector4(0, 1, 0, 0)); 
    sphere.velocity = new THREE.Vector3();
    sphere.velocity.copy(startingDirection).normalize().multiplyScalar(cannonballStartingSpeed);
    
    scene.add(sphere);
}

function fireCannons() {
    fireCannon(cannon1);
    fireCannon(cannon2, sphereMaterial2);
}

//*********************
//Simple Explosions
//*********************
class Explosion {
    constructor(position) {
        this.particles = [];
        this.lifetime = 1.0;
        this.age = 0;

        let particleGeometry = new THREE.SphereBufferGeometry(0.5, 8, 8);
        let particleMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300 });

        for (let i = 0; i < 20; i++) {
            let particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                Math.random() * 20
            );
            particle.castShadow = false;
            particle.receiveShadow = false;
            scene.add(particle);
            this.particles.push(particle);
        }
    }

    update(dt) {
        this.age += dt;
        for (let p of this.particles) {
            p.position.addScaledVector(p.velocity, dt);
            p.velocity.z -= 25 * dt;
        }
        if (this.age >= this.lifetime) {
            this.dispose();
            return false;
        }
        return true;
    }

    dispose() {
        for (let p of this.particles) {
            scene.remove(p);
            p.geometry.dispose();
            p.material.dispose();
        }
        this.particles = [];
    }
}

let explosions = [];

//*********************
//Do physics
//*********************
let G = 25;

function physicsTick(dt) {
    for (let i = 0; i < sphereList.length; i++) {
        let sphere = sphereList[i];
        sphere.velocity.z -= G * dt;
        sphere.position.addScaledVector(sphere.velocity, dt);

        for (let j = 0; j < i; j++) {
            let sphere2 = sphereList[j];
            let dist = sphere.position.distanceTo(sphere2.position);
            if (dist <= cannonballRadius * 2) {
                let normal = new THREE.Vector3().subVectors(sphere.position, sphere2.position).normalize();
                let v_rel = new THREE.Vector3().subVectors(sphere.velocity, sphere2.velocity);
                let speedAlongNormal = v_rel.dot(normal);

                if (speedAlongNormal < 0) {
                    let impulse = normal.clone().multiplyScalar(speedAlongNormal);
                    sphere.velocity.sub(impulse);
                    sphere2.velocity.add(impulse);
                }

                let overlap = (cannonballRadius * 2) - dist;
                let correction = normal.clone().multiplyScalar(overlap / 2);
                sphere.position.add(correction);
                sphere2.position.sub(correction);
            }
        }
    }

    let tempSphereList = [];
    for (let sphere of sphereList) {
        if (sphere.position.z <= 0) {
            scene.remove(sphere);
            recycledSphereList.push(sphere);
            explosions.push(new Explosion(sphere.position.clone()));
        }
        else { tempSphereList.push(sphere); }
    }
    sphereList = tempSphereList;
}

//*********************
//Animate
//*********************
var oldTime = 0;
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

function animate(t) {
    stats.begin();
    resizeCanvas();

    updateCannonMovement();

    let dt = (t - oldTime) / 1000;
    physicsTick(dt);
    oldTime = t;

    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        if (!explosions[i].update(dt)) {
            explosions.splice(i, 1);
        }
    }

    // Update cannon POV camera to follow cannon when it is moving
    cam4.position.copy(cannon1.position).add(new THREE.Vector3(50, 0, 40)); 
    cam4.lookAt(cannon1.position.clone().add(new THREE.Vector3(0, 0, 30))); 

    if (camera.isArrayCamera) {
        controls.object = subCameras[0];
        controls.update();

        renderer.setScissorTest(true);
        for (const c of camera.cameras) {
            const v = c.viewport;
            renderer.setViewport(v.x, v.y, v.z, v.w);
            renderer.setScissor(v.x, v.y, v.z, v.w);
            renderer.render(scene, c);
        }
    } else {
        controls.object = camera;
        controls.update();

        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        renderer.setScissor(0, 0, canvas.clientWidth, canvas.clientHeight);
        renderer.render(scene, camera);
    }

    stats.end();
    requestAnimationFrame(animate);
}


animate();

//*********************
// Add UI
//*********************
let gui = new dat.GUI();
let cannonFolder = gui.addFolder("Cannons");
let cannonInfo = {
    distance: 300,
    horizontalAngle: 0,
    verticalAngle: 30,
    startingSpeed: 50,
    fire: fireCannons,
    fire1: () => { fireCannon(cannon1); },
    fire2: () => { fireCannon(cannon2); }
};
cannonFolder.add(cannonInfo, "horizontalAngle", -45, 45).onChange(rotateCannonsHorizontally);
cannonFolder.add(cannonInfo, "verticalAngle", -10, 90).onChange(rotateCannonsVertically);
cannonFolder.add(cannonInfo, "startingSpeed", 10, 100).onChange((x) => { cannonballStartingSpeed = x; });
cannonFolder.add(cannonInfo, "fire");
cannonFolder.add(cannonInfo, "fire1");
cannonFolder.add(cannonInfo, "fire2");
cannonFolder.open();

let sceneFolder = gui.addFolder("Scene");
let sceneInfo = { camera: "perspective" };
sceneFolder.add(sceneInfo, "camera", ["perspective", "orthographic", "array"]).onChange((value) => {
    camera = cameras[value];

    if(value === 'array') {
        controls.object = subCameras[0];
    } else {
        controls.object = camera;
        if(camera.isPerspectiveCamera) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        } else if(camera.isOrthographicCamera) {
            camera.left = -canvas.clientWidth / 2;
            camera.right = canvas.clientWidth / 2;
            camera.top = canvas.clientHeight / 2;
            camera.bottom = -canvas.clientHeight / 2;
            camera.updateProjectionMatrix();
        }
        renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        renderer.setScissor(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
});
sceneFolder.open();

