let remove_atrib = (button) => {
    button.parentNode.parentNode.removeChild(button.parentNode)
}
let add_atrib = () => {
    let input_atrib = document.getElementById("creator_atributo")
    if (!input_atrib.value) { return }
    let div_atrib = document.createElement('div')
    div_atrib.innerHTML = `<button class="atributo_name" onclick="remove_atrib(this)">${input_atrib.value}<i class="_icon_" data-lucide="x"></i></button>`
    create_atributos.appendChild(div_atrib)
    input_atrib.value = ""
    lucide.createIcons()
}