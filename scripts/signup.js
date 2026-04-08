let remove_atrib = (button) => {
    button.parentNode.parentNode.removeChild(button.parentNode)
}
let add_atrib = (button) => {
    let input_atrib = button.parentNode.children[1]
    const create_atributos = document.querySelectorAll(".atributo_name")
    let atributos_adds = []
    for (let i = 0; i < create_atributos.length; i++) {
        atributos_adds.push(create_atributos[i].innerText)
    }
    if (!input_atrib.value) { return }
    else if (atributos_adds.includes(input_atrib.value)) {
        alert("Esse atributo já está adicionado!")
        return
    }
    let div_atrib = document.createElement('div')
    div_atrib.innerHTML = `<button class="atributo_name" onclick="remove_atrib(this)">${input_atrib.value}<i class="_icon_" data-lucide="x"></i></button>`
    button.parentNode.parentNode.children[1].appendChild(div_atrib)
    input_atrib.value = ""
    lucide.createIcons()
}