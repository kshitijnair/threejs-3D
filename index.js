(function () {
  // Set our main variables
  let scene,
    renderer,
    camera,
    model, // Our character
    neck, // Reference to the neck bone in the skeleton
    waist, // Reference to the waist bone in the skeleton
    possibleAnims, // Animations found in our file
    mixer, // THREE.js animations mixer
    idle, // Idle, the default state our character returns to
    clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate
    currentlyAnimating = false, // Used to check whether characters neck is being used in another anim
    raycaster = new THREE.Raycaster(), // Used to detect the click on our character
    loaderAnim = document.getElementById("js-loader"),
    poseMarks,
    leftArmBone,
    rightArmBone,
    leftArmPoint,
    rightArmPoint;
})();
leftArmBone = 11;
rightArmBone = 12;
const videoElement = document.querySelector("video");
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const MODEL_PATH = "./nathan.glb";
let x = 0,
  y = 0,
  z = 0;
// document.addEventListener("mousemove", function (e) {
//   var mousecoords = getMousePos(e);
//   if (leftArm && rightArm) {
//     moveJoint(mousecoords, leftArm, 180);
//     moveJoint(mousecoords, rightArm, 180);
//   }
// });

// SETTING UP THE HOLISTIC MODEL
const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  },
});
if (holistic) {
  console.log("Holistic model has loaded.");
} else {
  console.log("Loading Error!!");
}
function onResultsOriginal(results) {
  console.log(results);
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#00FF00",
    lineWidth: 4,
  });
  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: "#FF0000",
    lineWidth: 2,
  });
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
    color: "#C0C0C070",
    lineWidth: 1,
  });
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
    color: "#CC0000",
    lineWidth: 5,
  });
  drawLandmarks(canvasCtx, results.leftHandLandmarks, {
    color: "#00FF00",
    lineWidth: 2,
  });
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
    color: "#00CC00",
    lineWidth: 5,
  });
  drawLandmarks(canvasCtx, results.rightHandLandmarks, {
    color: "#FF0000",
    lineWidth: 2,
  });
  canvasCtx.restore();
  ///////////////////
  var c = document.getElementById("randoCanvas");
  var ctx = c.getContext("2d");

  ctx.beginPath();
  let cenX = results.faceLandmarks[1].x * 640;
  let cenY = results.faceLandmarks[1].y * 480;
  ctx.arc(cenX, cenY, 20, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.beginPath();
  let HandcenX = results.rightHandLandmarks[8].x * 640;
  let HandcenY = results.rightHandLandmarks[8].y * 480;
  ctx.arc(HandcenX, HandcenY, 20, 0, 2 * Math.PI);
  ctx.stroke();
  ///////////////////
}
function onResults(results) {
  // console.log(results);
  poseMarks = results.poseLandmarks;
  leftArmPoint = poseMarks[11];
  rightArmPoint = poseMarks[12];
  // console.log(leftArmPoint, rightArmPoint);
  leftArmBone.position.set(leftArmPoint.x * 100, leftArmPoint.y * 100, 0);
  rightArmBone.position.set(rightArmPoint.x * 100, rightArmPoint.y * 100, 0);
}

//////////////////////////////////////////////
////// START HOLISTIC MODEL DETECTION ////////
//////////////////////////////////////////////
// initiaizing the model with parameters as follows
holistic.setOptions({
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
holistic.onResults(onResults);
camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 720,
  height: 720,
});
camera.start();
/////////////////////////////////////////////

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}

// ADD ALL THE OBJECTS //
function addCamera(scene) {
  // Add a camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10.25;
  camera.position.x = 0;
  camera.position.y = 1.5;

  // Add lights
  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  hemiLight.position.set(0, 5, 0);
  // Add hemisphere light to scene
  scene.add(hemiLight);

  let d = 8.25;
  let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = d * -1;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = d * -1;
  // Add directional Light to scene
  scene.add(dirLight);
}
function addFloor(scene) {
  // Floor
  let floorGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
  let floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x999999,
    shininess: 0,
  });

  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
  floor.receiveShadow = true;
  // floor.position.y = -11;
  scene.add(floor);
}
function addSphere(scene) {
  let geometry = new THREE.SphereGeometry(1, 32, 32);
  let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e
  let sphere = new THREE.Mesh(geometry, material);
  sphere.position.z = 2;
  sphere.position.y = 0;
  sphere.position.x = 0;
  scene.add(sphere);
}

init();

function init() {
  const canvas = document.querySelector("#c");
  const backgroundColor = 0xf1f1f1;

  // Init the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  scene.fog = new THREE.Fog(backgroundColor, 60, 100);

  // Init the renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  addCamera(scene);
  addFloor(scene);
  addSphere(scene);
}

function update() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
update();

var loader = new THREE.GLTFLoader();
loader.load(
  MODEL_PATH,
  function (gltf) {
    // A lot is going to happen here
    model = gltf.scene;
    let fileAnimations = gltf.animations;
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    // Set the models initial scale
    model.scale.set(1, 1, 1);
    scene.add(model);
    let count = 0;
    model.traverse((o) => {
      if (o.isBone && o.name === "rp_nathan_animated_003_walking_upperarm_r") {
        rightArmBone = o;
        // console.log(rightArmBone.position);
        rightArmBone.position.x = 40;
        rightArmBone.position.z = 40;
        rightArmBone.position.y = 0;
        // console.log(rightArmBone.position);
      }
      if (o.isBone && o.name === "rp_nathan_animated_003_walking_upperarm_l") {
        leftArmBone = o;
        // console.log(leftArmBone.position);
        leftArmBone.position.x = 0;
        leftArmBone.position.y = 0;
        leftArmBone.position.z = 0;
        console.log("left bone exi");
      }
      // if ( isBone) {
      //   console.log(o.name);
      // }
    });
    // console.log("The total bones are: ", count);
  },
  undefined, // We don't need this function
  function (error) {
    console.error(error);
  }
);

// document.addEventListener("mousemove", function (e) {
//   var mousecoords = getMousePos(e);
// });

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}

function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
  const vec1 = new THREE.Vector3(degrees.x / 20, degrees.y / 20, 0); // is a vector in 3d world space (x,y,z)
  let newvec1 = joint.worldToLocal(vec1); // is a (x',y',z') vector in the local space of this joint
  /// newvec1 is a Vector3 object with .x, .y and .z properties
  x = x + 1;
  y = y + 1;
  joint.position.set(x, y, 0); // joint moved to (x,y,z) in world space
  console.log(x);
}
function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(
//   100,
//   window.innerWidth / window.innerHeight,
//   10,
//   1000
// );
// camera.position.z = 30;

// var renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0xcc7fe0, 1);

// document.body.appendChild(renderer.domElement);

// var orbit = new OrbitControls(camera, renderer.domElement);
// orbit.enableZoom = false;

// var ambientLight = new THREE.AmbientLight("#FFE7FF"),
//   hemiLight = new THREE.HemisphereLight("#FFE7FF", "#FFE7FF", 0.5),
//   light = new THREE.PointLight("#FFE7FF", 1, 100);

// hemiLight.position.set(0, 0, 10);
// light.position.set(0, 0, 0);

// scene.add(hemiLight);
// scene.add(light);

// var group = new THREE.Group();

// var render = function () {
//   requestAnimationFrame(render);
//   orbit.update();
//   group.rotation.x += 0.03;
//   group.rotation.y += 0.02;
//   group.rotation.z += 0.01;

//   renderer.render(scene, camera);
// };

// window.addEventListener(
//   "resize",
//   function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   },
//   false
// );

// let loader = new GLTFLoader();
// loader.load("nathan.glb", function (gltf) {
//   let nathan = gltf.scene.children[0];
//   nathan.scale.set(200, 200, 200);
//   scene.add(gltf.scene);
//   // animate();
// });

// // function animate() {
// //   renderer.render(scene, camera);
// //   requestAnimationFrame(animate);
// // }

// render();
