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
            avatar.rotation.set(0, 7, 0); // Adjust the rotation to face forward

            // Set initial visibility and opacity
            avatar.visible = false; // Make avatar initially invisible
            avatar.traverse(function (child) {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0; // Start with opacity 0
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

            // Add GSAP animation to fade in the avatar at the correct scroll point
            fadeInAvatar(avatar);

            // Ensure avatar is correctly hidden or visible on initial load based on scroll position
            handleInitialScrollPosition(avatar);
        },
        undefined,
        function (error) {
            console.error('Error loading avatar:', error);
        }
    );

    function fadeInAvatar(avatar) {
        // Use GSAP to animate the avatar's opacity and make it visible along with the overlay text
        ScrollTrigger.create({
            trigger: ".overlay",
            start: "top center", // Avatar fade-in starts when overlay text starts to fade in
            end: "center center",
            scrub: true,
            onEnter: () => {
                console.log("ScrollTrigger: Entering overlay section, making avatar visible.");
                avatar.visible = true; // Make avatar visible when entering the overlay section
                avatar.traverse(function (child) {
                    if (child.isMesh) {
                        gsap.to(child.material, {
                            opacity: 1,
                            duration: 1.5,
                            ease: "power1.inOut",
                            onStart: () => console.log("Avatar fade-in started."),
                            onComplete: () => console.log("Avatar fade-in complete."),
                        });
                    }
                });
            },
            onLeaveBack: () => {
                console.log("ScrollTrigger: Leaving overlay section back to intro, hiding avatar.");
                avatar.traverse(function (child) {
                    if (child.isMesh) {
                        gsap.to(child.material, {
                            opacity: 0,
                            duration: 1,
                            ease: "power1.inOut",
                            onComplete: () => {
                                avatar.visible = false; // Hide avatar after fade-out is complete
                                console.log("Avatar fade-out complete, opacity set to 0, avatar hidden.");
                            }
                        });
                    }
                });
            }
        });
    }

    function handleInitialScrollPosition(avatar) {
        // Get current scroll position on page load
        const scrollY = window.scrollY;

        console.log("Initial scroll position:", scrollY);
        console.log("Overlay offset top:", document.querySelector(".overlay").offsetTop);

        // If the user is on the second section (overlay), make sure the avatar is handled properly
        if (scrollY >= document.querySelector(".overlay").offsetTop) {
            console.log("User loaded on overlay section, making avatar visible.");
            avatar.visible = true;
            avatar.traverse(function (child) {
                if (child.isMesh) {
                    gsap.to(child.material, {
                        opacity: 1,
                        duration: 1.5,
                        ease: "power1.inOut",
                        onStart: () => console.log("Avatar opacity fade-in started for initial load."),
                        onComplete: () => console.log("Avatar opacity set to 1 for overlay section.")
                    });
                }
            });
        } else {
            // If the user is on the first section, ensure avatar is hidden
            console.log("User loaded on intro section, keeping avatar hidden.");
            avatar.visible = false;
            avatar.traverse(function (child) {
                if (child.isMesh) {
                    child.material.opacity = 0;
                    console.log("Avatar opacity set to 0 for intro section.");
                }
            });
        }
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
