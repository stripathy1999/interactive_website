// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Fade out intro text
    gsap.to(".intro", {
        opacity: 0,
        duration: 2,
        delay: 3, // Keeps the intro visible for 3 seconds
        onComplete: function() {
            console.log("Intro faded out, showing landing page...");
            document.getElementById("intro").style.display = "none"; // Hide the intro
            document.querySelector(".landing-page").classList.remove("hidden"); // Show landing page
            initThreeJS(); // Initialize Three.js scene
        }
    });
});

// Three.js variables
let scene, camera, renderer, avatar, mixer;

// Initialize Three.js
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Load Avatar Model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/avatar.glb', function(gltf) {
        avatar = gltf.scene;
        avatar.position.set(0, -1.5, 0);
        avatar.scale.set(1.5, 1.5, 1.5);
        scene.add(avatar);

        // Animation Mixer
        mixer = new THREE.AnimationMixer(avatar);
        if (gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        animate();
    }, undefined, function(error) {
        console.error('An error occurred while loading the avatar:', error);
    });

    // Sakura Particles
    addSakuraParticles();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(0.01);
    }

    renderer.render(scene, camera);
}

// Add sakura petals using particles
function addSakuraParticles() {
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    const sprite = new THREE.TextureLoader().load('assets/sakura.png');
    const material = new THREE.PointsMaterial({
        size: 0.5,
        map: sprite,
        transparent: true,
        depthWrite: false
    });

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = Math.random() * 10;
        const z = (Math.random() - 0.5) * 20;
        positions.push(x, y, z);

        velocities.push(
            0, // x velocity
            -Math.random() * 0.02 - 0.01, // y velocity
            0 // z velocity
        );
    }

    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const pointCloud = new THREE.Points(particles, material);
    scene.add(pointCloud);

    // Animate particles
    function animateParticles() {
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;

        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;

            positions[idx] += velocities[idx];
            positions[idx + 1] += velocities[idx + 1];
            positions[idx + 2] += velocities[idx + 2];

            // Reset particle position when it goes off screen
            if (positions[idx + 1] < -5) {
                positions[idx + 1] = 5;
            }
        }

        particles.attributes.position.needsUpdate = true;

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

// Scroll-based animations
gsap.registerPlugin(ScrollTrigger);

gsap.to(camera.position, {
    z: 2,
    scrollTrigger: {
        trigger: ".scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: true
    }
});
