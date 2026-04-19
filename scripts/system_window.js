class SystemWindow {
    constructor(title, _id_) {
        play_effect_sound()
        this.title = title
        this.id_window = crypto.randomUUID();
        this._id_ = _id_
        this.system_window = document.createElement("div");
        this.system_window.className = "window_system"
        this.system_window.innerHTML = `
        <div class="bg_window" onclick="close_system_window('${this.id_window}')" ></div>
        <div class="content_window card">
            <button class="close_button" onclick="close_system_window('${this.id_window}')" class="button"> X </button>
            <h2>Title</h2>
            <hr class="divider">
        </div>`
        document.body.appendChild(this.system_window)

        this.content_window = this.system_window.children[1]
        let title_elem = this.content_window.children[1]
        title_elem.innerText = title
        this.form_system = document.createElement("div");
        this.form_system.className = "form-system"
        this.content_window.appendChild(this.form_system);
    }

    new_or_edit_mission() {
        let function_button;
        let button_delete;
        if (this.title == "Criar nova Missão") {
            function_button = "createMission()"
            button_delete = ""
        } else if (this.title == "Editar Missão") {
            function_button = `createMission('${this._id_}')`
            button_delete = `<button onclick="deleteMission('${this._id_}')">Excluir</button>`
        }

        let atrib_keys = window.user.getAtributesKeys()
        let atributos_label = ``
        for (let i = 0; i < atrib_keys.length; i++) {
            let atrib_key = atrib_keys[i]
            atributos_label += `
            <label class="check">
                <input type="checkbox" value="${atrib_key}">
                <span>${atrib_key}</span>
            </label>`
        }

        this.setContent(`
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
                    <option value="${niveis_dific[1]}">${niveis_dific[1]}</option>
                    <option value="${niveis_dific[2]}">${niveis_dific[2]}</option>
                    <option value="${niveis_dific[3]}">${niveis_dific[3]}</option>
                    <option value="${niveis_dific[4]}">${niveis_dific[4]}</option>
                    <option value="${niveis_dific[5]}">${niveis_dific[5]}</option>
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

            <button id="" onclick="${function_button}">${this.title}</button>${button_delete}`)
    }
    recompensas() {
        let html_text = `
            <h3>Disponiveis</h3>
            <ul class="system_disp">`

        for (let id in window.recompensas) {
            let _recomp_ = window.recompensas[id]
            let datePtBr = new Date(_recomp_.data).toLocaleString('pt-BR')
            let class_btn = ""
            let class_li = ""
            let tempo_restante = ``
            if (_recomp_.reinvindicado) {
                class_li = "claimed"
                class_btn = "disabled"
                let [horas_rest, minutos_rest] = getTempoRestante(_recomp_.reinvindicado, _recomp_.duration)
                tempo_restante = `
                    <hr class="mini-divider">
                    <div>Tempo Restante: ${String(horas_rest).padStart(2, '0')}:${String(minutos_rest).padStart(2, '0')} </div>
                `
            }
            html_text += `<li id="${id}" class="${class_li}">
            <strong>Recompensa: ${_recomp_.title}</strong>
            <p>${_recomp_.descricao}</p>
            <hr class="mini-divider">
            <div>Data: ${datePtBr}</div>
            <hr class="mini-divider">
            <div>Missão: ${_recomp_.mission_title}</div>
            <hr class="mini-divider">
            <div class="duracao">Duração: ${String(_recomp_.duration[0]).padStart(2, '0')}:${String(_recomp_.duration[1]).padStart(2, '0')} </div>
            ${tempo_restante}
            <button onclick="reinvindicarRecomp('${id}', this)" class="${class_btn}">Reinvindicar</button><button  onclick="deletarRecomp('${id}', this.parentNode)">Excluir</button></li>`
        }
        html_text += `</ul>`

        for (let i = 0; i <= 5; i++) {
            html_text += `<hr class="mini-divider">
                <h3>${niveis_dific[i]}</h3>
                <ul id="${this.title}-${i}" class="system_dificuldade">`
            for (let id in window.reg_recomp) {
                let _reg_recomp_ = window.reg_recomp[id]
                if (_reg_recomp_.dificuldade == niveis_dific[i]) {
                    html_text += `<li id="${id}" onclick="open_system_window('Editar Recompensa' , this.id)"><strong>${_reg_recomp_.title}</strong>
                        <hr class="mini-divider">
                        <p>${_reg_recomp_.descricao}</p></li>`
                }
            }
            html_text += `</ul>`
        }

        html_text += `<button onclick="open_system_window('Criar Recompensa')">Criar Recompensa</button>`;
        this.setContent(html_text)
    }
    penalidades() {
        let html_text = `
            <h3>Disponiveis</h3>
            <ul class="system_disp_penal">`

        for (let id in window.penalidades) {
            let _penal_ = window.penalidades[id]
            let datePtBr = new Date(_penal_.data).toLocaleString('pt-BR')
            let class_btn = ""
            let class_li = ""
            let tempo_restante = ``
            if (_penal_.cumprido) {
                class_li = "claimed"
                class_btn = "disabled"
                let [horas_rest, minutos_rest] = getTempoRestante(_penal_.cumprido, _penal_.duration)
                tempo_restante = `
                    <hr class="mini-divider">
                    <div>Tempo Restante: ${String(horas_rest).padStart(2, '0')}:${String(minutos_rest).padStart(2, '0')} </div>
                `
            }
            html_text += `<li id="${id}" class="${class_li}">
            <strong>Penalidade: ${_penal_.title}</strong>
            <p>${_penal_.descricao}</p>
            <hr class="mini-divider">
            <div>Data: ${datePtBr}</div>
            <hr class="mini-divider">
            <div>Missão: ${_penal_.mission_title}</div>
            <hr class="mini-divider">
            <div class="duracao">Duração: ${String(_penal_.duration[0]).padStart(2, '0')}:${String(_penal_.duration[1]).padStart(2, '0')} </div>
            ${tempo_restante}
            <button onclick="cumprirPenalidade('${id}', this)" class="${class_btn}">Cumprir</button><button  onclick="deletarPenal('${id}', this.parentNode)">Excluir</button></li>`
        }
        html_text += `</ul>`

        for (let i = 0; i <= 5; i++) {
            html_text += `<hr class="mini-divider">
                <h3>${niveis_dific[i]}</h3>
                <ul id="${this.title}-${i}" class="system_dificuldade">`
            for (let id in window.reg_penal) {
                let _reg_penal_ = window.reg_penal[id]
                if (_reg_penal_.dificuldade == niveis_dific[i]) {
                    html_text += `<li id="${id}" onclick="open_system_window('Editar Penalidade', this.id)"><strong>${_reg_penal_.title}</strong>
                        <hr class="mini-divider">
                        <p>${_reg_penal_.descricao}</p></li>`
                }
            }
            html_text += `</ul>`
        }

        html_text += `<button onclick="open_system_window('Criar Penalidade')">Criar Penalidade</button>`;
        this.setContent(html_text)
    }
    new_or_edit_recomp() {
        let function_button;
        let button_delete;
        if (this.title == "Criar Recompensa") {
            function_button = "createRecompensa()"
            button_delete = ""
        } else if (this.title == "Editar Recompensa") {
            function_button = `createRecompensa('${this._id_}')`
            button_delete = `<button onclick="deleteRecompensa('${this._id_}')">Excluir</button>`
        }

        let html_text = `
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
                    <option value="${niveis_dific[5]}">${niveis_dific[5]}</option>
                </select>
            </div>
            <div>
                <label>Duração:</label>
                <div class="duracao-inputs">
                    <input type="number" id="dur_recomp_horas" placeholder="Horas" min="0">
                    <input type="number" id="dur_recomp_min" placeholder="Min" min="0" max="59">
                </div>
            </div>
            <textarea id="create-recomp-desc" placeholder="Descrição da Recompensa"></textarea>
            <button onclick="${function_button}">${this.title}</button>${button_delete}
            `

        this.setContent(html_text)
    }
    new_or_edit_penal() {
        let function_button;
        let button_delete;
        if (this.title == "Criar Penalidade") {
            function_button = "createPenalidade()"
            button_delete = ""
        } else if (this.title == "Editar Penalidade") {
            function_button = `createPenalidade('${this._id_}')`
            button_delete = `<button onclick="deletePenalidade('${this._id_}')">Excluir</button>`
        }

        let html_text = `
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
                    <option value="${niveis_dific[5]}">${niveis_dific[5]}</option>
                </select>
            </div>
            <div>
                <label>Duração:</label>
                <div class="duracao-inputs">
                    <input type="number" id="dur_penal_horas" placeholder="Horas" min="0">
                    <input type="number" id="dur_penal_min" placeholder="Min" min="0" max="59">
                </div>
            </div>
            <textarea id="create-penal-desc" placeholder="Descrição da Penalidade"></textarea>
            <button onclick="${function_button}">${this.title}</button>${button_delete}`;
        this.setContent(html_text)
    }
    edit_status() {
        let html_text = `
            <div>
                <label>Nome: </label>
                <input type="text" id="input_edit_name" class="form-title-create" >
            </div>
            <button onclick="editStatus()">Salvar</button>`;

        this.content_window.style.width = "40rem"
        this.setContent(html_text)
    }
    edit_atributos() {
        let atributos = ``
        let atrib_list = window.user.getAtributesKeys()
        for (let i = 0; i < atrib_list.length; i++) {
            atributos += `<div>
                            <button class="atributo_name" onclick="remove_atrib(this)">${atrib_list[i]}<i class="_icon_" data-lucide="x"></i></button>
                        </div>`
        }

        html_text = `
                    <div>
                        <label>Atributos:</label>
                        <input type="text" id="input_edit_atributo"><button onclick="add_atrib(this)">Adicionar</button>
                    </div>
                    <div id="create_atributos">
                        ${atributos}
                    </div>
            <button onclick="editAtrib()">Salvar</button>`;
        this.content_window.style.width = "40rem"
        this.setContent(html_text)
    }
    SignIn() {
        let html_text = `
            <div id="signin">
                <div>
                    <label>Nome</label>
                    <input type="text" id="creator_name" placeholder="Digite seu nome">
                </div>
                <div id="creator_atributos_div">
                    <div>
                        <label>Atributos:</label>
                        <input type="text" id="creator_atributo"><button onclick="add_atrib(this)">Adicionar</button>
                    </div>
                    <div id="create_atributos">
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Disciplina<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Força<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Inteligência<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Social<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Vitalidade<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                        <div>
                            <button class="atributo_name" onclick="remove_atrib(this)">Finanças<i class="_icon_"
                                    data-lucide="x"></i></button>
                        </div>
                    </div>
                </div>

                <button style="width:100%;" onclick="createPlayer()">Iniciar</button>
            </div>`
        this.content_window.style.width = "40rem"
        this.setContent(html_text)
    }
    notification(content) {
        talk(this.title)
        this.content_window.style.width = "40rem"
        this.setContent(content)
    }

    setContent(content) {
        this.form_system.innerHTML = content
    }
}

function confirmSystem(title, datas = null) {
    return new Promise((resolve) => {
        let sys_window = new SystemWindow(title)
        window.system_windows[sys_window.id_window] = sys_window;

        let content
        if (title == "Deletar") {
            content = `
                <h1>Tem certeza que deseja deletar?</h1>
                <label>A ação não pode ser desfeita!</label>
                <div style="display:flex; gap:10px; justify-content:space-around;">
                    <button class="btn-confirm"  id="confirm-yes">Sim</button>
                    <button class="btn-confirm"  id="confirm-no">Não</button>
                </div>
            `;
        } else if (title == "Confirmar Edição de Atributos") {
            content = `
                <h1>O progresso do (s) atributo(s) deletado(s) serão apagados, deseja continuar?</h1>
                <label>A ação não pode ser desfeita!</label>
                <div style="display:flex; gap:10px; justify-content:space-around;">
                    <button class="btn-confirm"  id="confirm-yes">Sim</button>
                    <button class="btn-confirm"  id="confirm-no">Não</button>
                </div>
            `;
        } else if (title == "Finalizar Missão") {
            content = `
                <h1>Deseja finalizar a missão?</h1>
                <label>(${datas})</label>
                <div style="display:flex; gap:10px; justify-content:space-around;">
                    <button class="btn-confirm"  id="confirm-yes">Sim</button>
                    <button class="btn-confirm" id="confirm-no">Não</button>
                </div>
            `;
        } else if (title == "PROTOCOLO MONARCA DISPONÍVEL") {
            content = `
                <label>Você tem a oportunidade de se tornar um jogador!</label>
                <h1>Deseja iniciar o SISTEMA?</h1>
                <div style="display:flex; gap:1rem; justify-content:space-around;">
                    <button class="btn-yes btn-confirm" id="confirm-yes">Sim</button>
                    <button class="btn-no btn-confirm" id="confirm-no">Não</button>
                </div>
            `;
        }

        sys_window.notification(content);

        document.getElementById("confirm-yes").onclick = () => {
            close_system_window(sys_window.id_window);
            resolve(true);
        };

        document.getElementById("confirm-no").onclick = () => {
            close_system_window(sys_window.id_window);
            resolve(false);
        };
    });
}

let open_system_window = (title, _id_ = null) => {
    let sys_window = new SystemWindow(title, _id_)
    window.system_windows[sys_window.id_window] = sys_window;

    if (title == "Criar nova Missão" || title == "Editar Missão") {
        window.system_windows[sys_window.id_window].new_or_edit_mission()
    } else if (title == "Recompensas") {
        window.system_windows[sys_window.id_window].recompensas()
    } else if (title == "Penalidades") {
        window.system_windows[sys_window.id_window].penalidades()
    } else if (title == "Criar Recompensa" || title == "Editar Recompensa") {
        window.system_windows[sys_window.id_window].new_or_edit_recomp()
    } else if (title == "Criar Penalidade" || title == "Editar Penalidade") {
        window.system_windows[sys_window.id_window].new_or_edit_penal()
    } else if (title == "Editar Status") {
        window.system_windows[sys_window.id_window].edit_status()
    } else if (title == "Editar Atributos") {
        window.system_windows[sys_window.id_window].edit_atributos()
    } else if (title == "Level Up!") {
        let content = `
        <h1>Parabéns!</h1>
        <p style="text-align: center;">Você subiu de nível!</p>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Penalidade Recebida") {
        let content = `
        <h1>Você recebeu uma penalidade!</h1>
        <label>Título: ${window.penalidades[_id_].title}</label>
        <label>Data: ${convert_data(window.penalidades[_id_].data)}</label>
        <label>Descrição: ${window.penalidades[_id_].descricao}</label>
        <label>Duração: ${String(window.penalidades[_id_].duration[0]).padStart(2, '0')}:${String(window.penalidades[_id_].duration[1]).padStart(2, '0')}</label>
        <label>Dificuldade: ${window.penalidades[_id_].dificuldade}</label>
        <label>Missão: ${window.penalidades[_id_].mission_title}</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Recompensa Recebida") {
        let content = `
        <h1>Parabens! Você recebeu uma recomepensa!</h1>
        <label>Título: ${window.recompensas[_id_].title}</label>
        <label>Data: ${convert_data(window.recompensas[_id_].data)}</label>
        <label>Descrição: ${window.recompensas[_id_].descricao}</label>
        <label>Duração: ${String(window.recompensas[_id_].duration[0]).padStart(2, '0')}:${String(window.recompensas[_id_].duration[1]).padStart(2, '0')}</label>
        <label>Dificuldade: ${window.recompensas[_id_].dificuldade}</label>
        <label>Missão: ${window.recompensas[_id_].mission_title}</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Erro!") {
        let content = `
        <h1>Erro ao Deletar</h1>
        <label>Por Favor informe ao Administrador do erro: </label>
        <label>${_id_}</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Mínimo de Atributos!") {
        let content = `
        <h1>Mínimo 3 Atributos!</h1>
        <label>É obrigatório no mínimo 3 Atributos!</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Título Bloqueado") {
        let content = `
        <h1>Esse Título não é permitido</h1>
        <label>O título está reservado pelo sistema, por favor use outro!</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Duração dos minutos!") {
        let content = `
        <h1>Valor Máximo para duração dos minutos</h1>
        <label>Duração dos minutos não pode ser maior que 59</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Ok</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Deletar") {
        let content = `
        <h1>Tem certeza que deseja deletar?</h1>
        <label>A ação não pode ser desfeita!</label>
        <button onclick="close_system_window('${sys_window.id_window}')">Sim</button>
        <button onclick="close_system_window('${sys_window.id_window}')">Não</button>`
        window.system_windows[sys_window.id_window].notification(content)
    } else if (title == "Cadastrar Jogador") {
        window.system_windows[sys_window.id_window].SignIn()
    }

    if (title == "Editar Recompensa") {
        document.getElementById("create-recomp-title").value = window.reg_recomp[_id_].title
        document.getElementById("create-recomp-dificuldade").value = window.reg_recomp[_id_].dificuldade
        let dur_timestamp = window.reg_recomp[_id_].duration || 0
        dur_timestamp = timestampParaHoraMin(dur_timestamp)
        document.getElementById("dur_recomp_horas").value = String(dur_timestamp[0]).padStart(2, '0')
        document.getElementById("dur_recomp_min").value = String(dur_timestamp[1]).padStart(2, '0')
        document.getElementById("create-recomp-desc").value = window.reg_recomp[_id_].descricao
    } else if (title == "Editar Penalidade") {
        document.getElementById("create-penal-title").value = window.reg_penal[_id_].title
        document.getElementById("create-penal-dificuldade").value = window.reg_penal[_id_].dificuldade
        let dur_timestamp = window.reg_penal[_id_].duration || 0
        dur_timestamp = timestampParaHoraMin(dur_timestamp)
        document.getElementById("dur_penal_horas").value = String(dur_timestamp[0]).padStart(2, '0')
        document.getElementById("dur_penal_min").value = String(dur_timestamp[1]).padStart(2, '0')
        document.getElementById("create-penal-desc").value = window.reg_penal[_id_].descricao
    } else if (title == "Editar Missão") {
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
        document.getElementById("create-mission-dificuldade").selectedIndex = niveis_dific.indexOf(window.missoes[_id_].dificuldade);
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
            atributos_inputs[window.user.getAtributesKeys().indexOf(atributo)].checked = true
        }
    } else if (title == "Editar Status") {
        document.getElementById("input_edit_name").value = window.user.name
    }
    lucide.createIcons()
}

let close_system_window = (id_window) => {
    if (window.system_windows[id_window]) {
        document.body.removeChild(window.system_windows[id_window].system_window)
        delete window.system_windows[id_window]
    } else {
        title_window = id_window
        for (let id in window.system_windows) {
            let _window_ = window.system_windows[id]
            if (_window_.title == title_window) {
                document.body.removeChild(window.system_windows[id].system_window)
                delete window.system_windows[id]
                break
            }
        }
    }
}

function updateDificuldade(dific) {
    const recompensa_select = document.getElementById("recompensa_select")
    let optionsRecomp = ""
    optionsRecomp += `<option value="Sem recompensa">Sem recompensa</option>`
    optionsRecomp += `<option value="Aleatório">Aleatório</option>`
    for (let id in window.reg_recomp) {
        _reg_recomp_ = window.reg_recomp[id]
        if (_reg_recomp_.dificuldade == dific || _reg_recomp_.dificuldade == niveis_dific[0]) {
            optionsRecomp += `<option value=${id}>${_reg_recomp_.title}</option>`
        }
    }

    const penalidade_select = document.getElementById("penalidade_select")
    let optionsPenal = ""
    optionsPenal += `<option value="Sem penalidade">Sem penalidade</option>`
    optionsPenal += `<option value="Aleatório">Aleatório</option>`
    for (let id in window.reg_penal) {
        _reg_penal_ = window.reg_penal[id]
        if (_reg_penal_.dificuldade == dific || _reg_penal_.dificuldade == niveis_dific[0]) {
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

function getAtributosCheckbox() {
    // pega todos os checkboxes marcados dentro do container
    const selecionados = document.querySelectorAll("#select_atributos input:checked");

    const valores = Array.from(selecionados).map(el => el.value);

    return valores;
}

function timestampParaHoraMin(ms) {
    let totalMin = Math.floor(ms / (1000 * 60));

    let horas = Math.floor(totalMin / 60);
    let minutos = totalMin % 60;

    return [horas, minutos]
}

function horaMinParaTimestamp(horas, minutos) {
    horas = Number(horas) || 0;
    minutos = Number(minutos) || 0;

    return (horas * 60 * 60 * 1000) + (minutos * 60 * 1000);
}

function getTempoRestante(inicio, duration) {
    const now = Date.now()
    const final_tempo_reinv = inicio + horaMinParaTimestamp(duration[0], duration[1])
    let timestamp_restante = final_tempo_reinv - now;
    if (timestamp_restante <= 0) { timestamp_restante = 0 };
    const horas_rest = Math.floor(timestamp_restante / (1000 * 60 * 60));
    const minutos_rest = Math.floor((timestamp_restante % (1000 * 60 * 60)) / (1000 * 60));

    return [horas_rest, minutos_rest]
}