window.system_windows = {}
_xpMax_ = null
niveis_dific = ['Não Definida', 'Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil']
list_type = ["Única", "Diária", "Semanal", "Mensal"]

let convert_data = (clock) => {
    return new Date(clock).toLocaleString()
}

function setHours(clock, array) {
    let hora = array[0]
    let min = array[1]
    let seg = array[2]
    let miliseg = array[3]
    return new Date(clock).setHours(hora, min, seg, miliseg)
}

let change_data = (clock, days) => {
    clock = new Date(clock);
    clock.setDate(clock.getDate() + days);
    return clock.getTime()
}

function diffDias(data1, data2) {
    const d1 = setHours(data1, [0, 0, 0, 0]);
    const d2 = setHours(data2, [0, 0, 0, 0]);

    const diff = Math.abs(d2 - d1);

    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

window.diffHoras = (data1, data2) => {
    const diff = Math.abs(new Date(data2) - new Date(data1));

    let h = Math.floor(diff / (1000 * 60 * 60));
    let m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function mainLoop() {
    let clock_hoje = new Date().setHours(0, 0, 0, 0);
    Object.entries(window.missoes).forEach(([id, missao]) => {
        // console.log("-=")
        if (missao.tipo != list_type[0]) { // Missoes que tem repeticoes
            let clock_finish_mission = null
            if (missao.last_finish != null) {
                clock_finish_mission = setHours(missao.last_finish, [0, 0, 0, 0]) // pega data de quando finalizou um missao
            } else {
                clock_finish_mission = setHours(missao.data, [0, 0, 0, 0]) // pega data de criacao da missao
            }
            // console.log(missao.title)
            // console.log(convert_data(clock_finish_mission))


            // Missao Falha
            // clock_finish_mission = change_data(clock_finish_mission, -20) // TESTE -> 20 dias atras
            let no_finish_days = diffDias(clock_finish_mission, clock_hoje) || 0
            clock_finish_mission = setHours(clock_finish_mission, [23, 59, 59, 0])

            // console.log(missao.tipo)
            // console.log(missao.repeat)

            // console.log(no_finish_days)
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

        }
    });
}

function updateMissions() {
    const mission_list_unica = document.getElementById("missions_unicas_card").getElementsByClassName("mission-list")[0]
    const mission_list_diarias = document.getElementById("missions_diarias_card").getElementsByClassName("mission-list")[0]
    const mission_list_semanais = document.getElementById("missions_semanais_card").getElementsByClassName("mission-list")[0]
    const mission_list_mensais = document.getElementById("missions_menais_card").getElementsByClassName("mission-list")[0]
    mission_list_unica.innerHTML = ""
    mission_list_diarias.innerHTML = ""
    mission_list_semanais.innerHTML = ""
    mission_list_mensais.innerHTML = ""
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
        html_text = `<div><div>Título: ${mission.title}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Tipo: ${mission.tipo}</div>`
        let dias_da_missao = []
        let tempo_restante = ``
        if (mission.tipo == "Diária" && mission.completa.length == 0) {
            tempo_restante += `<hr class="mini-divider"></hr></div>`
            tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
        } else if (mission.tipo == "Semanal") {
            let dias_da_semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
            for (let idx = 0; idx < mission.repeat.length; idx++) {
                dias_da_missao.push(dias_da_semana[mission.repeat[idx]])
            }
            dias_da_missao = dias_da_missao.toString().replaceAll(",", ", ")
            html_text += `<div>Dias da Semana: ${dias_da_missao}</div>`
            if (mission.completa.length == 0) {
                tempo_restante += `<hr class="mini-divider"></hr></div>`
                tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
            }
        } else if (mission.tipo == "Mensal") {
            dias_da_missao = mission.repeat.toString().replaceAll(",", ", ")
            html_text += `<div>Dias: ${dias_da_missao}</div>`
            if (mission.completa.length == 0) {
                tempo_restante += `<hr class="mini-divider"></hr></div>`
                tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
            }
        }
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Descrição: <br>${mission.descricao.replace(/\n/g, '<br>')}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Dificuldade: ${mission.dificuldade}</div>`
        html_text += `<hr class="mini-divider"></hr>`


        let _reg_recomp_ = window.reg_recomp[mission.recompensa]
        if (_reg_recomp_) {
            html_text += `<div>Recompensa: ${_reg_recomp_.title}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        } else {
            html_text += `<div>Recompensa: ${mission.recompensa}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        }
        let _reg_penal_ = window.reg_penal[mission.penalidade]
        if (_reg_penal_) {
            html_text += `<div>Penalidade: ${_reg_penal_.title}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        } else {
            html_text += `<div>Penalidade: ${mission.penalidade}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        }
        html_text += `<div>Atributos: ${mission.atributos.toString().replaceAll(",", ", ")}</div>`
        html_text += tempo_restante
        html_text += `<hr class="mini-divider"></hr></div>`
        html_text += `<div class="mission-div-button">
                        ${button_concluido}
                        <button onclick="open_system_window('Editar Missão', '${idMission}')">Editar</button>
                        ${button_malsucedido}
                    </div>`

        li.innerHTML = html_text
        if (mission.tipo == list_type[0]) {
            mission_list_unica.appendChild(li)
        } else if (mission.tipo == list_type[1]) {
            mission_list_diarias.appendChild(li)
        } else if (mission.tipo == list_type[2]) {
            mission_list_semanais.appendChild(li)
        } else if (mission.tipo == list_type[3]) {
            mission_list_mensais.appendChild(li)
        }

        // Tempo Restante
        let clock_hoje = new Date().setHours(0, 0, 0, 0);
        let now = new Date()
        let label_timer = document.getElementById("timer_" + idMission)
        if (label_timer != null) {
            label_timer.innerText = diffHoras(change_data(clock_hoje, 1), setHours(now.getTime(), [now.getHours(), now.getMinutes(), 0, 0]))
        }
    }
}

function updateStatus() {
    _xpMax_ = window.user.level * 100
    document.getElementById("player_name").innerText = window.user.name;
    document.getElementById("xp").innerText = window.user.xp;
    document.getElementById("level").innerText = window.user.level;
    document.getElementById("xpMax").innerText = _xpMax_;

    let percent = (window.user.xp / _xpMax_) * 100;
    document.getElementById("xpBar").style.width = percent + "%";
}

function remToPx(value) {
    const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    return value * rem;
}