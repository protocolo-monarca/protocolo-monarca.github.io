if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(() => { });
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tela === 'modal') {
        alert("botão de voltar?")
    } else {
        alert("...else...")
    }
});

window.system_windows = {}
_xpMax_ = null
let niveis_dific = ['Não Definida', 'Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil']
let list_type = ["Única", "Diária", "Semanal", "Mensal"]
let list_stand_mission = ["Nenhuma", "Aleatório"]

let convert_data = (clock) => {
    return new Date(clock).toLocaleString()
}

let setHours = (clock, array) => {
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
    let clock_hoje = new Date();
    console.log("-=")
    Object.entries(window.user.missions).forEach(([id, missao]) => {
        if (missao.type != list_type[0]) { // Missoes que tem repeticoes
            let clock_finish_mission = null
            if (missao.last_finish != null) {
                clock_finish_mission = setHours(missao.last_finish, [23, 59, 59, 0]) // pega data de quando finalizou um missao
            } else {
                clock_finish_mission = setHours(missao.date, [0, 0, 0, 0]) // pega data de criacao da missao
            }
            // console.log(missao.title)
            // console.log(convert_data(clock_finish_mission))

            // Missao Falha
            // clock_finish_mission = change_data(clock_finish_mission, -20) // TESTE -> 20 dias atras
            let no_finish_days = diffDias(clock_finish_mission, clock_hoje) || 0
            // console.log(no_finish_days, convert_data(missao.last_finish))
            // clock_finish_mission = setHours(clock_finish_mission, [23, 59, 59, 0])
            console.log(convert_data(clock_finish_mission))

            // console.log(missao.tipo)
            // console.log(missao.repeat)

            // console.log(no_finish_days)
            for (let i = 1; i < no_finish_days; i++) {
                let clock_day_i = change_data(clock_finish_mission, i)

                if (missao.type == 1) {
                    recebPenalidadeAtrasadas(id, clock_day_i)
                    // console.log(`atrasadas diaria`)
                    // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                }
                else if (missao.type == 2) {
                    let dia_semana_i = new Date(clock_day_i).getDay()
                    if (missao.repeat.includes(dia_semana_i)) {
                        recebPenalidadeAtrasadas(id, clock_day_i)
                        // console.log(`atrasadas semanal`)
                        // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                    }
                }
                else if (missao.type == 3) {
                    let dia_i = new Date(clock_day_i).getDate()
                    if (missao.repeat.includes(dia_i)) {
                        recebPenalidadeAtrasadas(id, clock_day_i)
                        // console.log(`atrasadas mensal`)
                        // console.log(convert_data(clock_day_i), convert_data(missao.last_finish))
                    }
                }

            }
            // Resetar Missoes
            if (missao.type == 1) { // Diaria
                if (clock_hoje > clock_finish_mission && missao.complete.length > 0) {
                    // console.log(`diario`)
                    window.resetMissions(id)
                }
            } else if (missao.type == 2) { // Semanal
                let dia_semana_hoje = new Date(clock_hoje).getDay()
                if (clock_hoje > clock_finish_mission && missao.complete.length > 0) {
                    if (missao.repeat.includes(dia_semana_hoje)) {
                        // console.log(`semanal`)
                        window.resetMissions(id)
                    }
                } else if (!missao.repeat.includes(dia_semana_hoje) && missao.complete.length == 0) {
                    // console.log("desativar o semanal")
                    window.user.missions[id].complete = [null, null]
                    updateMissions()
                }
            } else if (missao.type == 3) { // Mensal
                let dia_hoje = new Date(clock_hoje).getDate()
                if (clock_hoje > clock_finish_mission && missao.complete.length > 0) {
                    if (missao.repeat.includes(dia_hoje)) {
                        // console.log(`mensal`)
                        window.resetMissions(id)
                    }
                } else if (!missao.repeat.includes(dia_hoje) && missao.complete.length == 0) {
                    // console.log("desativar o mensal")
                    window.user.missions[id].complete = [null, null]
                    updateMissions()
                }
            }
        }
    });
    window.fbManager.updateUserDoc(`MainLoop`)
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
    for (let idMission in window.user.missions) {
        let mission = window.user.missions[idMission]
        const li = document.createElement("li")
        if (mission.complete.length != 0) {
            if (mission.complete[1]) {
                li.className = "completed"
            } else if (mission.complete[1] != null) {
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
        html_text += `<div>Tipo: ${list_type[mission.type]}</div>`
        let dias_da_missao = []
        let tempo_restante = ``
        if (mission.type == 1 && mission.complete.length == 0) {
            tempo_restante += `<hr class="mini-divider"></hr></div>`
            tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
        } else if (mission.type == 2) {
            let dias_da_semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
            for (let idx = 0; idx < mission.repeat.length; idx++) {
                dias_da_missao.push(dias_da_semana[mission.repeat[idx]])
            }
            dias_da_missao = dias_da_missao.toString().replaceAll(",", ", ")
            html_text += `<div>Dias da Semana: ${dias_da_missao}</div>`
            if (mission.complete.length == 0) {
                tempo_restante += `<hr class="mini-divider"></hr></div>`
                tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
            }
        } else if (mission.type == 3) {
            dias_da_missao = mission.repeat.toString().replaceAll(",", ", ")
            html_text += `<div>Dias: ${dias_da_missao}</div>`
            if (mission.complete.length == 0) {
                tempo_restante += `<hr class="mini-divider"></hr></div>`
                tempo_restante += `<div>Tempo Restante: <label  id="timer_${idMission}">__:__</label></div>`
            }
        }
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Descrição: <br>${mission.description.replace(/\n/g, '<br>')}</div>`
        html_text += `<hr class="mini-divider"></hr>`
        html_text += `<div>Dificuldade: ${niveis_dific[Number(mission.difficulty)]}</div>`
        html_text += `<hr class="mini-divider"></hr>`


        let _reg_recomp_ = window.user.rewards_log[mission.rewards]
        if (_reg_recomp_) {
            html_text += `<div>Recompensa: ${_reg_recomp_.title}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        } else {
            html_text += `<div>Recompensa: ${list_stand_mission[Number(mission.rewards)]}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        }
        let _reg_penal_ = window.user.penalties_log[mission.penalty]
        if (_reg_penal_) {
            html_text += `<div>Penalidade: ${_reg_penal_.title}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        } else {
            html_text += `<div>Penalidade: ${list_stand_mission[Number(mission.penalty)]}</div>`
            html_text += `<hr class="mini-divider"></hr>`
        }
        html_text += `<div>Atributos: ${mission.attributes.toString().replaceAll(",", ", ")}</div>`
        html_text += tempo_restante
        html_text += `<hr class="mini-divider"></hr></div>`
        html_text += `<div class="mission-div-button">
                        ${button_concluido}
                        <button onclick="open_system_window('Editar Missão', '${idMission}')">Editar</button>
                        ${button_malsucedido}
                    </div>`

        li.innerHTML = html_text
        if (mission.type == 0) {
            mission_list_unica.appendChild(li)
        } else if (mission.type == 1) {
            mission_list_diarias.appendChild(li)
        } else if (mission.type == 2) {
            mission_list_semanais.appendChild(li)
        } else if (mission.type == 3) {
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