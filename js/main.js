document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Fade-in "Hello Sakshi" text on page load
    gsap.fromTo(".intro-text", { opacity: 0 }, { opacity: 1, duration: 2 });

    // Fade out the intro section on scroll
    gsap.to(".intro", {
        opacity: 0,
        scrollTrigger: {
            trigger: ".intro",
            start: "top top",
            end: "bottom top",
            scrub: true,
            onLeave: () => {
                document.querySelector(".intro").style.display = "none";
            },
            onEnterBack: () => {
                document.querySelector(".intro").style.display = "flex";
            }
        }
    });

    // Fade in the overlay content as you scroll
    gsap.fromTo(".overlay", { opacity: 0 }, {
        opacity: 1,
        scrollTrigger: {
            trigger: ".intro",
            start: "bottom top",
            end: "bottom+=50% top",
            scrub: true,
        }
    });

    // Fade in the overlay text
    gsap.fromTo(".overlay h1", { opacity: 0 }, {
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: ".overlay",
            start: "top center",
            end: "center center",
            scrub: true,
        }
    });

    gsap.fromTo(".overlay p", { opacity: 0 }, {
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: ".overlay",
            start: "center center",
            end: "bottom center",
            scrub: true,
        }
    });

    // Initialize Three.js scene
    initThreeJS();
});

function initThreeJS() {
    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Initialize clock
    const clock = new THREE.Clock();

    // Declare mixer variable in a scope accessible to animate function
    let mixer;

    // Load Avatar Model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/avatar.glb',
        function (gltf) {
            const avatar = gltf.scene;
            avatar.position.set(-3.5, -1.3, 0); // Move further to the left
            avatar.scale.set(1.5, 1.5, 1.5);

            // Correct the orientation if the head is turned backward
            avatar.rotation.set(0, 7, 0); // Adjust the rotation to face forward

            // Set initial opacity to 0 and make materials transparent
            avatar.traverse(function (child) {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
            });

            scene.add(avatar);

            // Animation Mixer (if your model has animations)
            mixer = new THREE.AnimationMixer(avatar);
            if (gltf.animations.length > 0) {
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            } else {
                // If the model doesn't have animations, create a simple waving animation
                const arm = avatar.getObjectByName('ArmName');
                if (arm) {
                    gsap.to(arm.rotation, {
                        z: Math.PI / 4,
                        yoyo: true,
                        repeat: -1,
                        duration: 1,
                        ease: "Sine.easeInOut"
                    });
                }
            }

            // Start the animation loop
            animate();

            // Add GSAP animation to fade in the avatar
            fadeInAvatar(avatar);
        },
        undefined,
        function (error) {
            console.error('Error loading avatar:', error);
        }
    );

    function fadeInAvatar(avatar) {
        // Use GSAP to animate the avatar's opacity along with the overlay text
        avatar.traverse(function (child) {
            if (child.isMesh) {
                gsap.to(child.material, {
                    opacity: 1,
                    duration: 1.5,
                    scrollTrigger: {
                        trigger: ".overlay",
                        start: "top center",
                        end: "center center",
                        scrub: true,
                    }
                });
            }
        });
    }

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (mixer) {
            mixer.update(delta);
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
