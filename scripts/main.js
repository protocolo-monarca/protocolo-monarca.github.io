window.datas = null
window.system_windows = {}
_xpMax_ = null
niveis_dific = ['Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil']
list_type = ["Única", "Diária", "Semanal", "Mensal"]

function mainLoop() {
    let convert_data = (clock) => {
        return new Date(clock).toLocaleString()
    }
    let change_data = (clock, days) => {
        clock = new Date(clock);
        clock.setDate(clock.getDate() + days);
        return clock.getTime()
    }
    function setHours(clock, array) {
        let hora = array[0]
        let min = array[1]
        let seg = array[2]
        let miliseg = array[3]
        return new Date(clock).setHours(hora, min, seg, miliseg)
    }
    function diffDias(data1, data2) {
        const d1 = setHours(data1, [0, 0, 0, 0]);
        const d2 = setHours(data2, [0, 0, 0, 0]);

        const diff = Math.abs(d2 - d1);

        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    let clock_hoje = new Date().setHours(0, 0, 0, 0);
    Object.entries(window.missoes).forEach(([id, missao]) => {
        if (missao.tipo != list_type[0]) { // Missoes que tem repeticoes
            let clock_finish_mission = null
            if (missao.last_finish != null) {
                clock_finish_mission = setHours(missao.last_finish, [0, 0, 0, 0]) // pega data de quando finalizou um missao
            } else {
                clock_finish_mission = setHours(missao.data, [0, 0, 0, 0]) // pega data de criacao da missao
            }

            // Resetar Missoes
            if (missao.tipo == list_type[1]) { // Diaria
                if (clock_hoje > clock_finish_mission) {
                    window.resetMissions(id)
                }
            } else if (missao.tipo == list_type[2]) { // Semanal
                if (clock_hoje > clock_finish_mission) {
                    let dia_semana_hoje = new Date(clock_hoje).getDay()
                    if (missao.repeat.includes(dia_semana_hoje)) {
                        window.resetMissions(id)
                    }
                }
            } else if (missao.tipo == list_type[3]) { // Mensal
                if (clock_hoje > clock_finish_mission) {
                    let dia_hoje = new Date(clock_hoje).getDate()
                    if (missao.repeat.includes(dia_hoje)) {
                        window.resetMissions(id)
                    }
                }
            }

            // Missao Falha
            // clock_finish_mission = change_data(clock_finish_mission, -20) // TESTE -> 20 dias atras
            let no_finish_days = diffDias(clock_finish_mission, clock_hoje)
            clock_finish_mission = setHours(clock_finish_mission, [23, 59, 59, 0])

            // console.log(missao.tipo)
            // console.log(missao.repeat)

            for (let i = 1; i < no_finish_days; i++) {
                let clock_day_i = change_data(clock_finish_mission, i)

                if (missao.tipo == list_type[1]) {
                    recebPenalidadeAtrasadas(id, clock_day_i)
                    // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                }
                else if (missao.tipo == list_type[2]) {
                    let dia_semana_i = new Date(clock_day_i).getDay()
                    if (missao.repeat.includes(dia_semana_i)) {
                        recebPenalidadeAtrasadas(id, clock_day_i)
                        // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                    }
                }
                else if (missao.tipo == list_type[3]) {
                    let dia_i = new Date(clock_day_i).getDate()
                    if (missao.repeat.includes(dia_i)) {
                        recebPenalidadeAtrasadas(id, clock_day_i)
                        // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                    }
                }
            }
        }
    });
}

function gainXP(amount) {
    window.datas.xp += amount;

    if (window.datas.xp >= _xpMax_) {
        window.datas.xp -= _xpMax_;
        window.datas.level++;
        _xpMax_ = Math.floor(window.datas.level * 100);
        alert("Level Up!");
    }

    updateStatus();
}

// Perfil
function gainAtrib(atributos) {
    for (let i in atributos) {
        let atr = atributos[i]
        window.datas.atributos[atr]++
    }
    drawRadar(window.datas.atributos)
}
function loseAtrib(atributos) {
    for (let i in atributos) {
        let atr = atributos[i]
        window.datas.atributos[atr]--
    }
    drawRadar(window.datas.atributos)
}


function updateMissions() {
    const mission_list = document.getElementsByClassName("mission-list")[0]
    mission_list.innerHTML = ""
    for (let idMission in window.missoes) {
        let mission = window.missoes[idMission]
        const li = document.createElement("li")
        if (mission.completa.length != 0) {
            if (mission.completa[1]) {
                li.className = "completed"
            } else {
                li.className = "unsuccess"
            }
            button_concluido = ``
            button_malsucedido = ``
            // button_concluido = `<button id="${idMission}" onclick="finishMission(this.id, true)">Concluído</button>`
            // button_malsucedido = `<button id="${idMission}" onclick="finishMission(this.id, false)">Malsucedido</button>`
        } else {
            button_concluido = `<button id="${idMission}" onclick="finishMission(this.id, true)">Concluído</button>`
            button_malsucedido = `<button id="${idMission}" onclick="finishMission(this.id, false)">Malsucedido</button>`
        }
        html_text = `<div>Título: ${mission.title}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Tipo: ${mission.tipo}</div>`
        let dias_da_missao = []
        if (mission.tipo == "Semanal") {
            let dias_da_semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
            for (let idx = 0; idx < mission.repeat.length; idx++) {
                dias_da_missao.push(dias_da_semana[mission.repeat[idx]])
            }
            dias_da_missao = dias_da_missao.toString().replaceAll(",", ", ")
            html_text += `<div>Dias da Semana: ${dias_da_missao}</div>`
        } else if (mission.tipo == "Mensal") {
            dias_da_missao = mission.repeat.toString().replaceAll(",", ", ")
            html_text += `<div>Dias: ${dias_da_missao}</div>`
        }
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Descrição: ${mission.descricao}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Dificuldade: ${mission.dificuldade}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        for (let id in window.reg_recomp) {
            let _reg_recomp_ = window.reg_recomp[id]
            if (id == mission.recompensa) {
                html_text += `<div>Recompensa: ${_reg_recomp_.title}</div>`
                html_text += `<hr class="mini-divider"></hr>`
            }
        }
        for (let id in window.reg_penal) {
            let _reg_penal_ = window.reg_penal[id]
            if (id == mission.penalidade) {
                html_text += `<div>Penalidade: ${_reg_penal_.title}</div>`
                html_text += `<hr class="mini-divider"></hr>`
            }
        }
        html_text += `<div>Atributos: ${mission.atributos.toString().replaceAll(",", ", ")}</div>`
        html_text += `<div class="mission-div-button">
                        ${button_concluido}
                        <button onclick="open_system_window('Editar Missão', '${idMission}')">Editar</button>
                        ${button_malsucedido}
                    </div>`

        li.innerHTML = html_text
        mission_list.appendChild(li)
        // html_text += 
    }
}

function updateStatus() {
    _xpMax_ = window.datas.level * 100
    document.getElementById("player_name").innerText = window.datas.name;
    document.getElementById("xp").innerText = window.datas.xp;
    document.getElementById("level").innerText = window.datas.level;
    document.getElementById("xpMax").innerText = _xpMax_;

    let percent = (window.datas.xp / _xpMax_) * 100;
    document.getElementById("xpBar").style.width = percent + "%";
}

function remToPx(value) {
    const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    return value * rem;
}