document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("goTopBtn");

    // Show button when user scrolls down
    window.addEventListener("scroll", () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            btn.style.display = "flex"; // flex to center SVG
        } else {
            btn.style.display = "none";
        }
    });

    // Scroll back to top when clicked
    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});