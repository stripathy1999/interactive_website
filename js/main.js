// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Waving animation for the avatar
gsap.to(".avatar-img", {
    rotation: 10,         // Avatar will slightly rotate (wave effect)
    yoyo: true,           // The animation reverses back to the start
    repeat: -1,           // Infinite waving motion
    duration: 1,          // Time to complete one wave
    ease: "power1.inOut",
    scrollTrigger: {
        trigger: ".landing-page", // When the landing page is in view
        start: "top 80%",         // Start earlier
        end: "bottom top",        // End when you scroll past the avatar
        scrub: true,              // Smooth scrubbing effect
    }
});

// Scroll-triggered fade out when scrolling down
gsap.to(".intro-text", {
    opacity: 0,            // Fade out the text when scrolling down
    duration: 1.5,         // Duration of the fade-out effect
    scrollTrigger: {
        trigger: ".scroll-content", // Triggers when scrolling the content
        start: "top top",      // Fades when the scroll starts
        end: "100px top",      // Fades out in 100px of scrolling
        scrub: true,           // Controls the smoothness based on scroll speed
    }
});

// Scroll-triggered fade in when scrolling back up
gsap.to(".intro-text", {
    opacity: 1,            // Fade in the text when scrolling back up
    duration: 1.5,         // Duration of the fade-in effect
    scrollTrigger: {
        trigger: ".scroll-content", // Triggers when scrolling the content
        start: "100px top",    // Fades in after scrolling 100px
        end: "top top",        // Fades back in as you reach the top
        scrub: true,           // Controls the smoothness based on scroll speed
        reverse: true,         // Reverses the animation when scrolling back up
    }
});

// Control when the landing page shows after intro text fades out
window.addEventListener("load", function() {
    setTimeout(() => {
        document.getElementById("intro").style.display = "none";
        document.querySelector(".landing-page").style.display = "flex";
    }, 10000); // This hides the intro section after 10 seconds
});
