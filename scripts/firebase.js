// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCs7kDpGQIi9FR-LOh8EG2W7YjtIaNyeBg",
    authDomain: "protocolo-monarca.firebaseapp.com",
    projectId: "protocolo-monarca",
    storageBucket: "protocolo-monarca.firebasestorage.app",
    messagingSenderId: "1039056203304",
    appId: "1:1039056203304:web:ed8ec224dad62969ec0f1d",
    measurementId: "G-ZD59M6K6CZ"
};

let setHours = (clock, array) => {
    let hora = array[0]
    let min = array[1]
    let seg = array[2]
    let miliseg = array[3]
    return new Date(clock).setHours(hora, min, seg, miliseg)
}

class FirebaseManager {
    constructor(db, uid) {
        this.db = db
        this.uid = uid
        this.ref_user = doc(db, "Users", uid)
        this.ref_rewards = doc(db, "Users", uid, "Events", "Rewards");
        this.ref_penalty = doc(db, "Users", uid, "Events", "Penalty");
    }

    addCounter(write = false) {
        if (!window.user) { return }
        const now = Date.now()
        const time_zero = [0, 0, 0, 0]
        if (!window.user['counterFB']["day"] || window.user['counterFB']["day"] < setHours(now, time_zero)) {
            window.user['counterFB']["write"] = 0
            window.user['counterFB']["read"] = 0
            window.user['counterFB']["day"] = setHours(now, time_zero)
        }
        if (write) {
            window.user['counterFB']["write"] = window.user['counterFB']["write"] + 1 || 1
            if (!window.user['counterFB']["max_write"] || window.user['counterFB']["max_write"] < window.user['counterFB']["write"]) {
                window.user['counterFB']["max_write"] = window.user['counterFB']["write"]
            }
        } else {
            window.user['counterFB']["read"] = window.user['counterFB']["read"] + 1 || 1
            if (!window.user['counterFB']["max_read"] || window.user['counterFB']["max_read"] < window.user['counterFB']["read"]) {
                window.user['counterFB']["max_read"] = window.user['counterFB']["read"]
            }
        }
    }
    async getUserSnap() {
        this.addCounter()
        return await getDoc(this.ref_user);
    }
    limit_reached(where = '') {
        if (where == 'MainLoop' && window.user['counterFB']["write"] > 450) { return true }
        if (450 < window.user['counterFB']["write"] && window.user['counterFB']["write"] < 455) {
            open_system_window("Limite Quase Atingido (Banco de dados)")
            return false
        } else if (window.user['counterFB']["write"] >= 500) {
            open_system_window("Limite Atingido (Banco de dados)")
            return true
        }
        if (450 < window.user['counterFB']["read"] && window.user['counterFB']["read"] < 455) {
            open_system_window("Limite Quase Atingido (Banco de dados)")
            return false
        } else if (window.user['counterFB']["read"] >= 500) {
            open_system_window("Limite Atingido (Banco de dados)")
            return true
        }
    }
    async updateUserDoc(where = "") {
        let json_str = JSON.stringify(window.user.toJSON())
        const _cache_ = sessionStorage.getItem("user_cache");

        if (json_str == _cache_) { return }
        if (this.limit_reached(where)) { return }

        this.addCounter(true)

        json_str = JSON.stringify(window.user.toJSON())
        await setDoc(this.ref_user, window.user.toJSON());

        sessionStorage.setItem("user_cache", json_str);
        console.log("write doc: " + where)
    }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore();

// LOGIN COM GOOGLE
window.loginGoogle = async function () {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        // document.getElementById("loginMsg").innerText = error.message;
    }
};

// DETECTAR LOGIN
onAuthStateChanged(auth, async (user) => {
    open_loader_screen()
    // document.getElementById("loader").style.display = "fixed";
    window.currentUser = user

    if (user) {
        window.fbManager = new FirebaseManager(db, user.uid)
        const userSnap = await window.fbManager.getUserSnap();

        if (!userSnap.exists()) {
            if (!(await confirmSystem("PROTOCOLO MONARCA DISPONÍVEL"))) { window.logout(); return };
            // console.log("Primeiro login, criando usuário...");

            open_system_window("Cadastrar Jogador")
            document.getElementById("creator_name").value = user.displayName

            document.getElementById("loginScreen").style.display = "none";
            close_loader_screen()
        } else {
            window.user = new User(userSnap.data());
            let key_missions = Object.keys(window.user.missions)
            for (let i in key_missions) {
                window.user.missions[key_missions[i]] = new Mission(window.user.missions[key_missions[i]]).toJSON()
            }
            let key_rewards = Object.keys(window.user.rewards)
            for (let i in key_rewards) {
                window.user.rewards[key_rewards[i]] = new Recompensa(window.user.rewards[key_rewards[i]]).toJSON()
            }
            let key_penalties = Object.keys(window.user.penalties)
            for (let i in key_penalties) {
                window.user.penalties[key_penalties[i]] = new Penalidade(window.user.penalties[key_penalties[i]]).toJSON()
            }

            window.loadInterface()
        }
    } else {
        document.getElementById("loginScreen").style.display = "block";
        close_loader_screen()
    }
});

window.loadInterface = () => {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("player_name").innerText = window.user.name
    document.getElementById("system_interface").style.display = "block";

    updateStatus()
    updateMissions()
    drawRadar(window.user.attributes);
    try {
        close_system_window("Cadastrar Jogador")
    } catch (error) {
        open_system_window("Erro!", error)
    }

    sessionStorage.setItem("user_cache", JSON.stringify(window.user.toJSON()));
    close_loader_screen()
    setInterval(mainLoop, 20000);
    window.mainLoop()
}

// CRIAR JOGADOR
window.createPlayer = async () => {
    window.user = new User({});

    const player_name_elem = document.getElementById("creator_name")
    const player_name = player_name_elem.value
    const create_atributos = document.querySelectorAll(".atributo_name")
    let atributos = {}
    for (let i = 0; i < create_atributos.length; i++) {
        let atributo = create_atributos[i]
        atributos[atributo.innerText] = 0
    }

    if (!player_name) {
        player_name_elem.style.borderColor = "red"
        return
    } else {
        player_name_elem.style.borderColor = ""
    }

    if (Object.keys(atributos).length < 3) {
        open_system_window("Mínimo de Atributos!")
        return
    }
    if (Object.keys(atributos).length > 10) {
        open_system_window("Máximo de Atributos!")
        return
    }

    window.user["name"] = player_name
    window.user["email"] = currentUser.email
    window.user["attributes"] = atributos

    await window.fbManager.updateUserDoc("Create Player")

    open_loader_screen()

    loadInterface()
}

window.editStatus = async () => {
    const name_elem = document.getElementById("input_edit_name")
    const name = name_elem.value

    if (!name) {
        name_elem.style.borderColor = "red"
        return
    } else {
        name_elem.style.borderColor = ""
    }


    window.user["name"] = name

    await window.fbManager.updateUserDoc("Edit Status")

    close_system_window("Editar Status")

    updateStatus();
}

window.editAtrib = async () => {
    const create_atributos = document.querySelectorAll(".atributo_name")
    let atributos = {}
    for (let i = 0; i < create_atributos.length; i++) {
        let atributo = create_atributos[i].innerText
        atributos[atributo] = 0

        if (window.user.getAtributesKeys().includes(atributo)) {
            atributos[atributo] = window.user.getAtribute(atributo)
        }
    }

    if (Object.keys(atributos).length < 3) {
        open_system_window("Mínimo de Atributos!")
        return
    }
    if (!(await confirmSystem("Confirmar Edição de Atributos"))) { return };

    window.user.attributes = atributos

    let key_atributos = Object.keys(atributos)
    let key_missions = Object.keys(window.user.missions)
    for (let i = 0; i < key_missions.length; i++) {
        let mission = window.user.missions[key_missions[i]]
        // filtra corretamente
        mission.attributes = mission.attributes.filter(attr =>
            key_atributos.includes(attr)
        )
    }

    await window.fbManager.updateUserDoc(`Edit Attribute`)

    close_system_window("Editar Atributos")
    updateMissions()

    drawRadar(window.user.attributes);
}

// LOGOUT (opcional)
window.logout = function () {
    signOut(auth);
    location.reload();
};

//Missão
window.createMission = async function (_id_ = null) {
    document.getElementById("save_mission_button").disabled = true
    if (Object.keys(window.user.missions).length >= 10) {
        open_system_window("Limite Atingido")
        return
    }
    const title_elem = document.getElementById("create-mission-title")
    const title = title_elem.value;
    const tipo = Number(document.getElementById("create-mission-type").value);
    const repeticao = getRepeticao()
    const dificuldade_elem = document.getElementById("create-mission-dificuldade");
    const dificuldade = dificuldade_elem.value;
    const desc = document.getElementById("create-missao-desc").value;
    const recompensa_elem = document.getElementById("recompensa_select")
    const recompensa = recompensa_elem.value;
    const penalidade_elem = document.getElementById("penalidade_select");
    const penalidade = penalidade_elem.value;
    const atributos = getAtributosCheckbox()

    let error = false

    if (!title) {
        title_elem.style.borderColor = "red"
        error = true
    } else { title_elem.style.borderColor = "" }
    if (!dificuldade) {
        dificuldade_elem.style.borderColor = "red"
        error = true
    } else { dificuldade_elem.style.borderColor = "" }
    if (!recompensa) {
        recompensa_elem.style.borderColor = "red"
        error = true
    } else { recompensa_elem.style.borderColor = "" }
    if (!penalidade) {
        penalidade_elem.style.borderColor = "red"
        error = true
    } else { penalidade_elem.style.borderColor = "" }

    if (error) { return }

    if (_id_ == null) {
        const newMission = new Mission({
            title: title,
            type: tipo,
            repeat: repeticao,
            difficulty: dificuldade,
            term: "",
            description: desc,
            rewards: recompensa,
            penalty: penalidade,
            date: Date.now(),
            attributes: atributos,
            complete: [],
            last_finish: null
        });
        const idMission = crypto.randomUUID();
        window.user.missions[idMission] = newMission.toJSON()
        await window.fbManager.updateUserDoc("Create Mission")
        close_system_window("Criar nova Missão")
    } else {
        const datas = new Mission({
            title: title,
            type: tipo,
            repeat: repeticao,
            difficulty: dificuldade,
            term: "",
            description: desc,
            rewards: recompensa,
            penalty: penalidade,
            attributes: atributos
        });
        window.user.missions[_id_].title = datas.title
        window.user.missions[_id_].type = datas.type
        window.user.missions[_id_].repeat = datas.repeat
        window.user.missions[_id_].difficulty = datas.difficulty
        window.user.missions[_id_].description = datas.description
        window.user.missions[_id_].term = datas.term
        window.user.missions[_id_].rewards = datas.rewards
        window.user.missions[_id_].penalty = datas.penalty
        window.user.missions[_id_].attributes = datas.attributes
        await window.fbManager.updateUserDoc("Edit Mission")
        close_system_window("Editar Missão")
    }
    updateMissions()
}

window.finishMission = async (_id_, completed = true || false) => {
    let string_alert_completed = "Concluída"
    if (!completed) { string_alert_completed = "Malsucedida" }
    if (!(await confirmSystem("Finalizar Missão", string_alert_completed))) { return };

    const now = Date.now()
    window.user.missions[_id_].complete = [now, completed]
    window.user.missions[_id_].last_finish = now
    updateMissions()

    if (completed) {
        const diffic = Number(window.user.missions[_id_].difficulty)
        let xp = 25 * diffic
        if (diffic == 0) { xp = 25 * 3 }
        window.user.gainXP(xp)
        window.user.gainAtrib(window.user.missions[_id_].attributes)
        if (window.user.missions[_id_].rewards != 0) {
            await receberRecompensa(_id_, window.user.missions[_id_].rewards)
        }
    } else {
        loseAtrib(indow.user.missions[_id_].attributes)
        if (window.user.missions[_id_].penalty != 0) {
            await receberPenalidade(_id_, window.user.missions[_id_].penalty)
        }
    }
    await window.fbManager.updateUserDoc(`Finish Mission`)

    updateStatus();
    drawRadar(window.user.attributes);
}

window.deleteMission = async function (_id_) {
    if (!(await confirmSystem("Deletar"))) return;
    try {
        delete window.user.missions[_id_];
        await window.fbManager.updateUserDoc(`Delete Mission`)
    } catch (error) {
        open_system_window("Erro!", error)
    }
    close_system_window("Editar Missão")
    updateMissions()
}

window.resetMissions = async (_id_) => {
    window.user.missions[_id_].complete = []

    updateMissions()
}

// Recompensa
window.createRecompensa = async function (_id_ = null) {
    if (Object.keys(window.user.rewards_log).length >= 10) {
        open_system_window("Limite Atingido")
        return
    }
    const title_elem = document.getElementById("create-recomp-title")
    const title = title_elem.value;
    const dur_horas = parseInt(document.getElementById("dur_recomp_horas").value) || 0;
    const dur_minutos_elem = document.getElementById("dur_recomp_min")
    const dur_minutos = parseInt(dur_minutos_elem.value) || 0;
    const desc = document.getElementById("create-recomp-desc").value;

    if (!title) {
        title_elem.style.borderColor = "red"
        return;
    } else if (title == list_stand_mission[0] || title == list_stand_mission[1]) {
        title_elem.style.borderColor = "red"
        open_system_window("Título Bloqueado")
        return;
    }
    if (dur_minutos >= 60) {
        dur_minutos_elem.style.borderColor = "red"
        open_system_window("Duração dos minutos!")
        return;
    }

    const dur_Ms = (dur_horas * 60 * 60 * 1000) + (dur_minutos * 60 * 1000);

    if (_id_ == null) {
        const newRecomp = new reg_recomp({
            title: title,
            description: desc,
            admin: false,
            duration: dur_Ms
        });
        const idRewards = crypto.randomUUID();
        window.user.rewards_log[idRewards] = newRecomp.toJSON()
        close_system_window("Criar Recompensa")
    } else {
        const newRegRecomp = new reg_recomp({
            title: title,
            description: desc,
            admin: false,
            duration: dur_Ms
        });
        window.user.rewards_log[_id_] = newRegRecomp.toJSON()
        close_system_window("Editar Recompensa")
    }
    await window.fbManager.updateUserDoc(`Create / Edit Rewards Log`)
    close_system_window("Recompensas")
    open_system_window("Recompensas")
}

window.deleteRecompensa = async function (_id_) {
    if (!(await confirmSystem("Deletar"))) return;
    try {
        for (let i of Object.keys(window.user.missions)) {
            let mission = window.user.missions[i]
            if (mission.rewards = _id_) { mission.rewards = "0" }
        }
        delete window.user.rewards_log[_id_];
        await window.fbManager.updateUserDoc(`Delete Rewards Log`)
    } catch (error) {
        open_system_window("Erro!", error)
    }
    close_system_window("Editar Recompensa")
    close_system_window("Recompensas")
    open_system_window("Recompensas")
}

window.receberRecompensa = async function (idMission, idRecomp) {
    if (idRecomp == 1) {
        let keys_recomp = Object.keys(window.user.rewards_log)
        if (keys_recomp.length == 0) {
            await window.fbManager.updateUserDoc(`Receive Rewards`)
            return
        }
        const index = Math.floor(Math.random() * keys_recomp.length);
        idRecomp = keys_recomp[index]
    }

    const title = window.user.rewards_log[idRecomp].title
    const descricao = window.user.rewards_log[idRecomp].description
    let dur_timestamp = window.user.rewards_log[idRecomp].duration || 0
    dur_timestamp = timestampParaHoraMin(dur_timestamp)
    const title_mission = window.user.missions[idMission].title

    const recomp = new Recompensa({
        title: title,
        description: descricao,
        duration: dur_timestamp,
        date: Date.now(),
        mission_title: title_mission,
        mission_id: idMission,
        claimed: false
    });
    const idReward = crypto.randomUUID();
    window.user.rewards[idReward] = recomp.toJSON()
    await window.fbManager.updateUserDoc(`Receber Recompensa`)
    open_system_window("Recompensa Recebida", idReward)
}

window.reinvindicarRecomp = async (idRecomp, elem) => {
    window.user.rewards[idRecomp].claimed = Date.now()
    await window.fbManager.updateUserDoc(`Reinvindicar Recompensa`)

    elem.parentNode.className = "claimed"

    let [horas_rest, minutos_rest] = getTempoRestante(window.user.rewards[idRecomp].claimed, window.user.rewards[idRecomp].duration)
    const duracaoDiv = elem.parentNode.querySelector(".duracao");
    duracaoDiv.insertAdjacentHTML("afterend", `
        <hr class="mini-divider">
        <div>Tempo Restante: ${String(horas_rest).padStart(2, '0')}:${String(minutos_rest).padStart(2, '0')} </div>
    `);
    elem.className = "disabled"
}

window.deletarRecomp = async (idRecomp, elem) => {
    if (!(await confirmSystem("Deletar"))) return;
    try {
        delete window.user.rewards[idRecomp];
        await window.fbManager.updateUserDoc(`Deletar Recompensa`)
    } catch (error) {
        open_system_window("Erro!", error)
    }

    elem.parentNode.removeChild(elem)
}

// Penalidade
window.createPenalidade = async function (_id_ = null) {
    if (Object.keys(window.user.penalties_log).length >= 10) {
        open_system_window("Limite Atingido")
        return
    }
    const title_elem = document.getElementById("create-penal-title")
    const title = title_elem.value;
    const dur_horas = parseInt(document.getElementById("dur_penal_horas").value) || 0;
    const dur_minutos_elem = document.getElementById("dur_penal_min")
    const dur_minutos = parseInt(dur_minutos_elem.value) || 0;
    const desc = document.getElementById("create-penal-desc").value;

    if (!title) {
        title_elem.style.borderColor = "red"
        return;
    } else if (title == list_stand_mission[0] || title == list_stand_mission[1]) {
        title_elem.style.borderColor = "red"
        open_system_window("Título Bloqueado")
        return;
    }
    if (dur_minutos >= 60) {
        dur_minutos_elem.style.borderColor = "red"
        open_system_window("Duração dos minutos!")
        return;
    }

    const dur_Ms = (dur_horas * 60 * 60 * 1000) + (dur_minutos * 60 * 1000);

    if (_id_ == null) {
        const newPenal = new reg_penal({
            title: title,
            description: desc,
            admin: false,
            duration: dur_Ms
        });
        const idPenalty = crypto.randomUUID();
        window.user.penalties_log[idPenalty] = newPenal.toJSON()
        close_system_window("Criar Penalidade")
    } else {
        const newRegPenal = new reg_penal({
            title: title,
            description: desc,
            admin: false,
            duration: dur_Ms
        });
        window.user.penalties_log[_id_] = newRegPenal.toJSON()
        close_system_window("Editar Penalidade")
    }
    await window.fbManager.updateUserDoc(`Create / Edit Penalty Log`)
    close_system_window("Penalidades")
    open_system_window("Penalidades")
}

window.deletePenalidade = async function (_id_) {
    if (!(await confirmSystem("Deletar"))) return;
    try {
        for (let i of Object.keys(window.user.missions)) {
            let mission = window.user.missions[i]
            if (mission.penalty = _id_) { mission.penalty = "0" }
        }
        delete window.user.penalties_log[_id_];
        await window.fbManager.updateUserDoc(`Delete Penalty`)

    } catch (error) {
        open_system_window("Erro!", error)
    }
    close_system_window("Editar Penalidade")
    close_system_window("Penalidades")
    open_system_window("Penalidades")
}

window.receberPenalidade = async function (idMission, idPenal, data_penalidade = null, save_db = true) {
    let keys_penal = Object.keys(window.user.penalties_log)
    if (Number(idPenal) == 1) {
        if (keys_penal.length == 0) {
            await window.fbManager.updateUserDoc(`Receive Penalty`)
            return
        }
        const index = Math.floor(Math.random() * keys_penal.length);
        idPenal = keys_penal[index]
    }

    const title = window.user.penalties_log[idPenal].title
    const descricao = window.user.penalties_log[idPenal].description
    let dur_timestamp = window.user.penalties_log[idPenal].duration || 0
    dur_timestamp = timestampParaHoraMin(dur_timestamp)
    const title_mission = window.user.missions[idMission].title
    if (data_penalidade == null) {
        data_penalidade = Date.now()
    }

    const penal = new Penalidade({
        title: title,
        description: descricao,
        duration: dur_timestamp,
        date: data_penalidade,
        mission_title: title_mission,
        mission_id: idMission,
        fulfilled: false
    });
    const idPenalty = `${idMission}_${data_penalidade}`
    console.log(idPenalty)
    window.user.penalties[idPenalty] = penal.toJSON()
    if (save_db) { await window.fbManager.updateUserDoc(`Receber Penalidade`) }

    open_system_window("Penalidade Recebida", idPenalty)
}

window.recebPenalidadeAtrasadas = async (_id_, data_penalidade) => {
    window.user.missions[_id_].last_finish = data_penalidade
    window.user.missions[_id_].complete = [data_penalidade, false]

    loseAtrib(indow.user.missions[_id_].attributes)
    if (Number(window.user.missions[_id_].penalty) != 0) {
        await receberPenalidade(_id_, window.user.missions[_id_].penalty, data_penalidade, false)
    }
}

window.cumprirPenalidade = async (idPenal, elem) => {
    window.user.penalties[idPenal].fulfilled = Date.now()
    await window.fbManager.updateUserDoc(`Cumprir Penlidade`)

    elem.parentNode.className = "claimed"

    let [horas_rest, minutos_rest] = getTempoRestante(window.user.penalties[idPenal].fulfilled, window.user.penalties[idPenal].duration)
    const duracaoDiv = elem.parentNode.querySelector(".duracao");
    duracaoDiv.insertAdjacentHTML("afterend", `
        <hr class="mini-divider">
        <div>Tempo Restante: ${String(horas_rest).padStart(2, '0')}:${String(minutos_rest).padStart(2, '0')} </div>
    `);

    elem.className = "disabled"
}

window.deletarPenal = async (idPenal, elem) => {
    if (!(await confirmSystem("Deletar"))) return;
    try {
        delete window.user.penalties[idPenal];
        await window.fbManager.updateUserDoc(`Delete Penalidade`)
    } catch (error) {
        open_system_window("Erro!", error)
    }

    elem.parentNode.removeChild(elem)
}