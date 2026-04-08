let open_system_window = (type, _id_ = null) => {
    let _system_window_ = document.createElement("div");
    window.system_windows[type] = _system_window_
    _system_window_.className = "window_system"
    _system_window_.innerHTML = `
        <div class="bg_window" onclick="close_system_window('${type}')" ></div>
        <div class="content_window card">
            <button class="close_button" onclick="close_system_window('${type}')" class="button"> X </button>
            <h2>Title</h2>
            <hr class="divider">
        </div>`
    document.body.appendChild(_system_window_)

    content_window = _system_window_.children[1]
    title = content_window.children[1]
    title.innerText = type
    const form_system = document.createElement("div");
    form_system.className = "form-system"

    if (type == "Criar nova Missão" || type == "Editar Missão") {
        if (type == "Criar nova Missão") {
            function_button = "createMission()"
            button_delete = ""
        } else if (type == "Editar Missão") {
            function_button = `createMission('${_id_}')`
            button_delete = `<button onclick="deleteMission('${_id_}')">Excluir</button>`
        }

        let atrib_keys = Object.keys(window.datas.atributos)
        let atributos_label = ``
        for (let i = 0; i < atrib_keys.length; i++) {
            atrib_key = atrib_keys[i]
            atributos_label += `
            <label class="check">
                <input type="checkbox" value="${atrib_key}">
                <span>${atrib_key}</span>
            </label>`
        }

        form_system.innerHTML = `
            <div>
                <label>Título</label>
                <input type="text" id="create-mission-title" class="form-title-create" placeholder="Ex: Treinamento de força">
            </div>
            <label>Descrição</label>
            <textarea id="create-missao-desc" placeholder="Detalhes da missão"></textarea>
            <div>
                <label>Tipo</label>
                <select id="create-mission-type" onchange="updateRepeticao()">
                    <option value="Única">Única</option>
                    <option value="Diária">Diária</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                </select>
            </div>
            <div id="repeticao-extra">
                <label>Sem Repetição</label>
            </div>
            <div>
                <label>Dificuldade</label>
                <select id="create-mission-dificuldade" onchange="updateDificuldade(this.value)">
                    <option value="" disabled selected>Selecione...</option>
                    <option value="${niveis_dific[0]}">${niveis_dific[0]}</option>
                    <option value="${niveis_dific[1]}">${niveis_dific[1]}</option>
                    <option value="${niveis_dific[2]}">${niveis_dific[2]}</option>
                    <option value="${niveis_dific[3]}">${niveis_dific[3]}</option>
                    <option value="${niveis_dific[4]}">${niveis_dific[4]}</option>
                </select>
            </div>
            <div>
                <label>Recompensa</label>
                <select id="recompensa_select" onchange="updateMissionRecomp(this.value)">
                </select>
            </div>
            <textarea id="mission_desc_recomp" placeholder="Descrição da Recompensa" style="pointer-events: none; color: var(--cor-text-inative)" ></textarea>
            <!--<div>
                <label>Prazo</label>
                <input type="datetime-local" id="missao-prazo">
            </div>-->
            <div>
                <label>Penalidade</label>
                <select id="penalidade_select" onchange="updateMissionPenal(this.value)">
                </select>
            </div>
            <textarea id="mission_desc_penal" placeholder="Descrição da Penalidade" style="pointer-events: none; color: var(--cor-text-inative)"></textarea>
            <div id="select_atributos">
                ${atributos_label}
            </div>

            <button id="" onclick="${function_button}">${type}</button>${button_delete}`;
    } else if (type == "Recompensas") {
        html_text = `
            <h3>Disponiveis</h3>
            <ul class="system_disp">`

        for (let id in window.recompensas) {
            _recomp_ = window.recompensas[id]
            let datePtBr = new Date(_recomp_.data).toLocaleString('pt-BR')
            let class_btn = ""
            let class_li = ""
            if (_recomp_.reinvindicado) {
                class_li = "claimed"
                class_btn = "disabled"
            }
            html_text += `<li id="${id}" class="${class_li}">
            <strong>Recompensa: ${_recomp_.title}</strong>
            <p>${_recomp_.descricao}</p>
            <hr class="mini-divider">
            <div>Data: ${datePtBr}</div>
            <hr class="mini-divider">
            <div>Missão: ${_recomp_.mission_title}</div>
            <button onclick="reinvindicarRecomp('${id}', this)" class="${class_btn}">Reinvindicar</button><button  onclick="deletarRecomp('${id}', this.parentNode)">Excluir</button></li>`
        }
        html_text += `</ul>`

        for (let i = 0; i <= 4; i++) {
            html_text += `<hr class="mini-divider">
                <h3>${niveis_dific[i]}</h3>
                <ul id="${type}-${i}" class="system_dificuldade">`
            for (let id in window.reg_recomp) {
                _reg_recomp_ = window.reg_recomp[id]
                if (_reg_recomp_.dificuldade == niveis_dific[i]) {
                    html_text += `<li id="${id}" onclick="open_system_window('Editar Recompensa' , this.id)"><strong>${_reg_recomp_.title}</strong>
                        <hr class="mini-divider">
                        <p>${_reg_recomp_.descricao}</p></li>`
                }
            }
            html_text += `</ul>`
        }

        html_text +=
            `<button onclick="open_system_window('Criar Recompensa')">Criar Recompensa</button>`;
        form_system.innerHTML = html_text
    } else if (type == "Penalidades") {
        html_text = `
            <h3>Disponiveis</h3>
            <ul class="system_disp_penal">`

        for (let id in window.penalidades) {
            _penal_ = window.penalidades[id]
            let datePtBr = new Date(_penal_.data).toLocaleString('pt-BR')
            let class_btn = ""
            let class_li = ""
            if (_penal_.cumprido) {
                class_li = "claimed"
                class_btn = "disabled"
            }
            html_text += `<li id="${id}" class="${class_li}">
            <strong>Penalidade: ${_penal_.title}</strong>
            <p>${_penal_.descricao}</p>
            <hr class="mini-divider">
            <div>Data: ${datePtBr}</div>
            <hr class="mini-divider">
            <div>Missão: ${_penal_.mission_title}</div>
            <button onclick="cumprirPenalidade('${id}', this)" class="${class_btn}">Cumprir</button><button  onclick="deletarPenal('${id}', this.parentNode)">Excluir</button></li>`
        }
        html_text += `</ul>`

        for (let i = 0; i <= 4; i++) {
            html_text += `<hr class="mini-divider">
                <h3>${niveis_dific[i]}</h3>
                <ul id="${type}-${i}" class="system_dificuldade">`
            for (let id in window.reg_penal) {
                _reg_penal_ = window.reg_penal[id]
                if (_reg_penal_.dificuldade == niveis_dific[i]) {
                    html_text += `<li id="${id}" onclick="open_system_window('Editar Penalidade', this.id)"><strong>${_reg_penal_.title}</strong>
                        <hr class="mini-divider">
                        <p>${_reg_penal_.descricao}</p></li>`
                }
            }
            html_text += `</ul>`
        }

        html_text += `<button onclick="open_system_window('Criar Penalidade')">Criar Penalidade</button>`;
        form_system.innerHTML = html_text

    } else if (type == "Criar Recompensa" || type == "Editar Recompensa") {
        if (type == "Criar Recompensa") {
            function_button = "createRecompensa()"
            button_delete = ""
        } else if (type == "Editar Recompensa") {
            function_button = `createRecompensa('${_id_}')`
            button_delete = `<button onclick="deleteRecompensa('${_id_}')">Excluir</button>`
        }

        form_system.innerHTML = `
            <div>
                <label>Título</label>
                <input type="text" id="create-recomp-title" class="form-title-create" placeholder="Ex: 2 Horas de Descanso">
            </div>
            <div>
                <label>Dificuldade</label>
                <select id="create-recomp-dificuldade">
                    <option value="${niveis_dific[0]}">${niveis_dific[0]}</option>
                    <option value="${niveis_dific[1]}">${niveis_dific[1]}</option>
                    <option value="${niveis_dific[2]}">${niveis_dific[2]}</option>
                    <option value="${niveis_dific[3]}">${niveis_dific[3]}</option>
                    <option value="${niveis_dific[4]}">${niveis_dific[4]}</option>
                </select>
            </div>
            <textarea id="create-recomp-desc" placeholder="Descrição da Recompensa"></textarea>
            <button onclick="${function_button}">${type}</button>${button_delete}`;
    } else if (type == "Criar Penalidade" || type == "Editar Penalidade") {
        if (type == "Criar Penalidade") {
            function_button = "createPenalidade()"
            button_delete = ""
        } else if (type == "Editar Penalidade") {
            function_button = `createPenalidade('${_id_}')`
            button_delete = `<button onclick="deletePenalidade('${_id_}')">Excluir</button>`
        }

        form_system.innerHTML = `
            <div>
                <label>Título</label>
                <input type="text" id="create-penal-title" class="form-title-create" placeholder="Ex: 12 Horas Offline (sem scrolling)">
            </div>
            <div>
                <label>Dificuldade</label>
                <select id="create-penal-dificuldade">
                    <option value="${niveis_dific[0]}">${niveis_dific[0]}</option>
                    <option value="${niveis_dific[1]}">${niveis_dific[1]}</option>
                    <option value="${niveis_dific[2]}">${niveis_dific[2]}</option>
                    <option value="${niveis_dific[3]}">${niveis_dific[3]}</option>
                    <option value="${niveis_dific[4]}">${niveis_dific[4]}</option>
                </select>
            </div>
            <textarea id="create-penal-desc" placeholder="Descrição da Penalidade"></textarea>
            <button onclick="${function_button}">${type}</button>${button_delete}`;
    } else if (type == "Editar Status") {
        form_system.innerHTML = `
            <div>
                <label>Nome: </label>
                <input type="text" id="input_edit_name" class="form-title-create" >
            </div>
            <button onclick="editStatus()">Salvar</button>`;

        content_window.style.width = "40rem"
    } else if (type == "Editar Atributos") {
        let atributos = ``
        let atrib_list = Object.keys(window.datas.atributos)
        for (let i = 0; i < atrib_list.length; i++) {
            atributos += `<div>
                            <button class="atributo_name" onclick="remove_atrib(this)">${atrib_list[i]}<i class="_icon_" data-lucide="x"></i></button>
                        </div>`
        }

        form_system.innerHTML = `
                    <div>
                        <label>Atributos:</label>
                        <input type="text" id="input_edit_atributo"><button onclick="add_atrib(this)">Adicionar</button>
                    </div>
                    <div id="create_atributos">
                        ${atributos}
                    </div>
            <button onclick="editAtrib()">Salvar</button>`;
        content_window.style.width = "40rem"
    }
    content_window.appendChild(form_system);
    if (type == "Editar Recompensa") {
        document.getElementById("create-recomp-title").value = window.reg_recomp[_id_].title
        document.getElementById("create-recomp-dificuldade").value = window.reg_recomp[_id_].dificuldade
        document.getElementById("create-recomp-desc").value = window.reg_recomp[_id_].descricao
    } else if (type == "Editar Penalidade") {
        document.getElementById("create-penal-title").value = window.reg_penal[_id_].title
        document.getElementById("create-penal-dificuldade").value = window.reg_penal[_id_].dificuldade
        document.getElementById("create-penal-desc").value = window.reg_penal[_id_].descricao
    } else if (type == "Editar Missão") {
        document.getElementById("create-mission-title").value = window.missoes[_id_].title
        document.getElementById("create-missao-desc").value = window.missoes[_id_].descricao

        document.getElementById("create-mission-type").selectedIndex = list_type.indexOf(window.missoes[_id_].tipo);
        updateRepeticao()
        if (window.missoes[_id_].tipo == "Semanal" || window.missoes[_id_].tipo == "Mensal") {
            const repeats_inputs = document.querySelectorAll("#repeticao-extra input");
            for (let repeat_input in window.missoes[_id_].repeat) {
                const dias = window.missoes[_id_].repeat[repeat_input]
                if (window.missoes[_id_].tipo == "Semanal") {
                    repeats_inputs[dias].checked = true
                } else if (window.missoes[_id_].tipo == "Mensal") {
                    repeats_inputs[dias - 1].checked = true
                }
            }
        }
        document.getElementById("create-mission-dificuldade").selectedIndex = niveis_dific.indexOf(window.missoes[_id_].dificuldade) + 1;
        updateDificuldade(window.missoes[_id_].dificuldade)
        for (let i in Array.from(document.getElementById("recompensa_select").children)) {
            if (document.getElementById("recompensa_select").children[i].value == window.missoes[_id_].recompensa) {
                document.getElementById("recompensa_select").selectedIndex = i;
            }
        }
        for (let i in Array.from(document.getElementById("penalidade_select").children)) {
            if (document.getElementById("penalidade_select").children[i].value == window.missoes[_id_].penalidade) {
                document.getElementById("penalidade_select").selectedIndex = i;
            }
        }
        updateMissionRecomp()
        updateMissionPenal()

        const atributos_inputs = document.querySelectorAll("#select_atributos input");
        for (let atr_input in window.missoes[_id_].atributos) {
            const atributo = window.missoes[_id_].atributos[atr_input]
            atributos_inputs[Object.keys(window.datas.atributos).indexOf(atributo)].checked = true
        }
    } else if (type == "Editar Status") {
        document.getElementById("input_edit_name").value = window.datas.name
    }
    lucide.createIcons()
}

let close_system_window = (type) => {
    document.body.removeChild(window.system_windows[type])
    delete window.system_windows[type]
}

function updateDificuldade(dific) {
    const recompensa_select = document.getElementById("recompensa_select")
    let optionsRecomp = ""
    optionsRecomp += `<option value="Sem recompensa">Sem recompensa</option>`
    for (let id in window.reg_recomp) {
        _reg_recomp_ = window.reg_recomp[id]
        if (_reg_recomp_.dificuldade == dific) {
            optionsRecomp += `<option value=${id}>${_reg_recomp_.title}</option>`
        }
    }

    const penalidade_select = document.getElementById("penalidade_select")
    let optionsPenal = ""
    optionsPenal += `<option value="Sem penalidade">Sem penalidade</option>`
    for (let id in window.reg_penal) {
        _reg_penal_ = window.reg_penal[id]
        if (_reg_penal_.dificuldade == dific) {
            optionsPenal += `<option value=${id}>${_reg_penal_.title}</option>`
        }
    }
    recompensa_select.innerHTML = optionsRecomp
    penalidade_select.innerHTML = optionsPenal

    updateMissionRecomp()
    updateMissionPenal()
}

function updateMissionRecomp() {
    const recomp_id = document.getElementById("recompensa_select").value
    let desc = ""
    for (let id in window.reg_recomp) {
        _reg_recomp_ = window.reg_recomp[id]
        if (id == recomp_id) {
            desc = _reg_recomp_.descricao
        }
    }

    let textarea = document.getElementById("mission_desc_recomp")
    textarea.value = desc
}

function updateMissionPenal() {
    const penal_id = document.getElementById("penalidade_select").value
    let desc = ""
    for (let id in window.reg_penal) {
        _reg_penal_ = window.reg_penal[id]
        if (id == penal_id) {
            desc = _reg_penal_.descricao
        }
    }

    let textarea = document.getElementById("mission_desc_penal")
    textarea.value = desc
}

function updateRepeticao() {
    const tipo = document.getElementById("create-mission-type").value;
    const container = document.getElementById("repeticao-extra");

    container.innerHTML = "";
    let list_type = ["Única", "Diária", "Semanal", "Mensal"]
    if (tipo === list_type[0]) {
        container.innerHTML = `<label>Sem Repetição</label >`;
        container.style.display = "flex"
    }
    else if (tipo === list_type[1]) {
        container.innerHTML = `<label>Todos os Dias</label >`;
        container.style.display = "flex"
    }
    else if (tipo === list_type[2]) {
        container.innerHTML = `<label class="check">
            <input type="checkbox" value="0">
            <span>Dom</span>
        </label>
        <label class="check">
            <input type="checkbox" value="1">
            <span>Seg</span>
        </label>
        <label class="check">
            <input type="checkbox" value="2">
            <span>Ter</span>
        </label>
        <label class="check">
            <input type="checkbox" value="3">
            <span>Qua</span>
        </label>
        <label class="check">
            <input type="checkbox" value="4">
            <span>Qui</span>
        </label>
        <label class="check">
            <input type="checkbox" value="5">
            <span>Sex</span>
        </label>
        <label class="check">
            <input type="checkbox" value="6">
            <span>Sab</span>
        </label>`;
        container.style.display = "grid"
    }
    else if (tipo === list_type[3]) {
        let dias = "";

        for (let i = 1; i <= 31; i++) {
            dias += `<label class="check">
                        <input type="checkbox" value="${i}">
                        <span>${i}</span>
                    </label>`;
        }

        container.innerHTML = `${dias}`;
        container.style.display = "grid"
    }
}

function getRepeticao() {
    const tipo = document.getElementById("create-mission-type").value;

    // pega todos os checkboxes marcados dentro do container
    const selecionados = document.querySelectorAll("#repeticao-extra input:checked");

    const valores = Array.from(selecionados).map(el => Number(el.value));

    // para diária/unica → vazio
    if (tipo === "diaria" || tipo === "unica") {
        return [];
    }

    return valores;
}

function getAtributos() {
    // pega todos os checkboxes marcados dentro do container
    const selecionados = document.querySelectorAll("#select_atributos input:checked");

    const valores = Array.from(selecionados).map(el => el.value);

    return valores;
}