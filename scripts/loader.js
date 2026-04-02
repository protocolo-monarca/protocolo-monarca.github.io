
let loader_screen = document.getElementById("loader");

let open_loader_screen = () => {
    document.body.appendChild(loader_screen)
}
let close_loader_screen = () => {
    if (loader_screen.parentNode != null) {
        loader_screen.parentNode.removeChild(loader_screen)
    }
}