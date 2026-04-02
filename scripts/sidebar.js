
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");
}

function toggleMenu() {
    const subs = document.querySelectorAll(".sub_li");
    const arrow = document.getElementById("arrow");

    subs.forEach(el => {
        el.classList.toggle("hidden");
    });

    arrow.classList.toggle("rotate");
}