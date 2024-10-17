// Simple scroll-based animation example
window.addEventListener("scroll", function() {
    const scrollPosition = window.scrollY;
    const avatar = document.querySelector(".avatar-img");
    
    if (scrollPosition > 50) {
        avatar.classList.add("shrink");
    } else {
        avatar.classList.remove("shrink");
    }
});
