// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
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

const defaultUserData = {
    name: "",
    level: 1,
    xp: 0,
    email: "",

    atributos: {
        Força: 0,
        Vitalidade: 0,
        Inteligencia: 0,
        Social: 0,
        Disciplina: 0
    },
};

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

let getDataDB = async (_collection_, _object_) => {
    const ref = collection(db, "Users", window.uid, _collection_);
    const snapshot = await getDocs(ref);

    let lista = _object_;
    if (Array.isArray(lista)) {
        snapshot.forEach(doc => {
            lista.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } else if (lista !== null && typeof lista === "object" && !Array.isArray(lista)) {
        snapshot.forEach(doc => {
            lista[doc.id] = {
                ...doc.data()
            };
        });
    }

    return lista;
}

// DETECTAR LOGIN
onAuthStateChanged(auth, async (user) => {
    open_loader_screen()
    // document.getElementById("loader").style.display = "fixed";

    if (user) {
        const uid = user.uid;

        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);
        window.uid = uid

        if (!userSnap.exists()) {
            // console.log("Primeiro login, criando usuário...");

            await setDoc(userRef, {
                ...defaultUserData,
                name: user.displayName,
                email: user.email
            });

            // Penalidade Padrão
            let ref = collection(db, "Users", window.uid, "reg_penal");
            const newPenal = {
                title: "Pequena penalidade",
                descricao: "15 flexões",
                dificuldade: niveis_dific[0],
                admin: true
            };
            const penal_doc_ref = await addDoc(ref, newPenal);

            // Recompensa Padrao
            ref = collection(db, "Users", window.uid, "reg_recomp");
            const newRecomp = {
                title: "Descanso Curto",
                descricao: "5 min de pausa",
                dificuldade: niveis_dific[0],
                admin: true
            };
            let recomp_doc_ref = await addDoc(ref, newRecomp);

            // Missao Padrão
            // ref = collection(db, "Users", window.uid, "missoes");
            // const newMission = {
            //     title: "Treinamento de Força",
            //     tipo: "Diária",
            //     repeat: [],
            //     dificuldade: niveis_dific[0],
            //     prazo: "",
            //     descricao: `- 10 flexoes,
            //     - 10 abdominais,
            //     - 10 agachamentos,
            //     - 1km de corrida`,
            //     recompensa: IDrecomp_doc_ref,
            //     penalidade: IDpenal_doc_ref,
            //     data: Date.now(),
            //     atributos: ["Disciplina", "Força", "Vitalidade"],
            //     completa: [] // data, true // // data, false
            // };
            // const IDmissao_doc_ref = await addDoc(ref, newMission).id;

            // console.log("Usuário criado!");

            window.datas = {
                ...defaultUserData,
                name: user.displayName,
                email: user.email
            };
            window.reg_recomp = {}
            window.reg_penal = {}
            window.reg_recomp[recomp_doc_ref.id] = newRecomp
            window.reg_penal[penal_doc_ref.id] = newPenal
            window.missoes = {}
        } else {
            window.datas = userSnap.data();
            // console.log("Usuário já existe");
            window.reg_recomp = await getDataDB("reg_recomp", {})
            window.reg_penal = await getDataDB("reg_penal", {})
            window.missoes = await getDataDB("missoes", {});
            window.recompensas = await getDataDB("recompensas", {});
            window.penalidades = await getDataDB("penalidades", {});
        }

        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("player_name").innerText = user.displayName
        document.getElementById("system_interface").style.display = "block";
        // console.log("Logado:", user.displayName);
        updateStatus()
        updateMissions()
        drawRadar(window.datas.atributos);

        close_loader_screen()
        setInterval(mainLoop, 30000);
        window.mainLoop()
    } else {
        document.getElementById("loginScreen").style.display = "block";
        close_loader_screen()
    }
});

// LOGOUT (opcional)
window.logout = function () {
    signOut(auth);
    location.reload();
};

//Missão
window.createMission = async function (_id_ = null) {
    const title_elem = document.getElementById("create-mission-title")
    const title = title_elem.value;
    const tipo = document.getElementById("create-mission-type").value;
    const repeticao = getRepeticao()
    const dificuldade_elem = document.getElementById("create-mission-dificuldade");
    const dificuldade = dificuldade_elem.value;
    const desc = document.getElementById("create-missao-desc").value;
    const recompensa_elem = document.getElementById("recompensa_select")
    const recompensa = recompensa_elem.value;
    const penalidade_elem = document.getElementById("penalidade_select");
    const penalidade = penalidade_elem.value;
    const atributos = getAtributos()

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
        const ref = collection(db, "Users", window.uid, "missoes");
        const newMission = {
            title: title,
            tipo: tipo,
            repeat: repeticao,
            dificuldade: dificuldade,
            prazo: "",
            descricao: desc,
            recompensa: recompensa,
            penalidade: penalidade,
            data: Date.now(),
            atributos: atributos,
            completa: [],
            last_finish: null
        };
        const missao_doc_ref = await addDoc(ref, newMission);

        window.missoes[missao_doc_ref.id] = newMission
        close_system_window("Criar nova Missão")
    } else {
        const ref = doc(db, "Users", window.uid, "missoes", _id_);
        const datas = {
            title: title,
            tipo: tipo,
            repeat: repeticao,
            dificuldade: dificuldade,
            descricao: desc,
            recompensa: recompensa,
            penalidade: penalidade,
            atributos: atributos,
        };
        await updateDoc(ref, datas);
        window.missoes[_id_].title = datas.title
        window.missoes[_id_].tipo = datas.tipo
        window.missoes[_id_].repeat = datas.repeat
        window.missoes[_id_].dificuldade = datas.dificuldade
        window.missoes[_id_].descricao = datas.descricao
        window.missoes[_id_].recompensa = datas.recompensa
        window.missoes[_id_].penalidade = datas.penalidade
        window.missoes[_id_].atributos = datas.atributos
        close_system_window("Editar Missão")
    }
    updateMissions()
}

window.finishMission = async (_id_, completed = true || false) => {
    let string_alert_completed = "Concluída"
    if (!completed) { string_alert_completed = "Malsucedida" }
    if (!confirm(`Deseja finalizar a missão (${string_alert_completed})?`)) return;
    const missionRef = doc(db, "Users", window.uid, "missoes", _id_);
    const datas = {
        completa: [Date.now(), completed],
        last_finish: Date.now()
    };
    await updateDoc(missionRef, datas);
    window.missoes[_id_].completa = datas.completa
    window.missoes[_id_].last_finish = datas.last_finish
    updateMissions()

    if (completed) {
        gainXP((niveis_dific.indexOf(window.missoes[_id_].dificuldade) + 1) * 50)
        window.gainAtrib(window.missoes[_id_].atributos)
        if (window.missoes[_id_].recompensa != "Sem recompensa") {
            await receberRecompensa(_id_, window.missoes[_id_].recompensa)
        }

    } else {
        loseAtrib(["Disciplina"])
        if (window.missoes[_id_].penalidade != "Sem penalidade") {
            await receberPenalidade(_id_, window.missoes[_id_].penalidade)
        }
    }
    const userRef = doc(db, "Users", window.uid);
    await updateDoc(userRef, window.datas);
}

window.deleteMission = async function (_id_) {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    try {
        const ref = doc(db, "Users", window.uid, "missoes", _id_);

        await deleteDoc(ref);

        delete window.missoes[_id_];
    } catch (error) {
        alert("Erro ao deletar:", error);
    }
    close_system_window("Editar Missão")
    updateMissions()
}

window.resetMissions = async (_id_) => {
    const missionRef = doc(db, "Users", window.uid, "missoes", _id_);
    const datas = {
        completa: [],
    };
    await updateDoc(missionRef, datas);
    window.missoes[_id_].completa = datas.completa
    updateMissions()
}

// Recompensa
window.createRecompensa = async function (_id_ = null) {
    const title_elem = document.getElementById("create-recomp-title")
    const title = title_elem.value;
    const dificuldade = document.getElementById("create-recomp-dificuldade").value;
    const desc = document.getElementById("create-recomp-desc").value;

    if (!title) {
        title_elem.style.borderColor = "red"
        return;
    } else if (title == "Sem recompensa") {
        title_elem.style.borderColor = "red"
        alert("Esse Título para a recompensa não é permitido")
        return;
    }

    if (_id_ == null) {
        const ref = collection(db, "Users", window.uid, "reg_recomp");
        const newRecomp = {
            title: title,
            descricao: desc,
            dificuldade: dificuldade,
            admin: false
        };
        const recomp_doc_ref = await addDoc(ref, newRecomp);
        window.reg_recomp[recomp_doc_ref.id] = newRecomp
        close_system_window("Criar Recompensa")
    } else {
        const ref = doc(db, "Users", window.uid, "reg_recomp", _id_);
        const datas = {
            title: title,
            descricao: desc,
            dificuldade: dificuldade,
            admin: false
        };
        await updateDoc(ref, datas);
        window.reg_recomp[_id_] = datas
        close_system_window("Editar Recompensa")
    }
    close_system_window("Recompensas")
    open_system_window("Recompensas")
}

window.deleteRecompensa = async function (_id_) {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    try {
        const ref = doc(db, "Users", window.uid, "reg_recomp", _id_);

        await deleteDoc(ref);

        delete window.reg_recomp[_id_];
    } catch (error) {
        alert("Erro ao deletar:", error);
    }
    close_system_window("Editar Recompensa")
    close_system_window("Recompensas")
    open_system_window("Recompensas")
}

window.receberRecompensa = async function (idMission, idRecomp) {
    const ref = collection(db, "Users", window.uid, "recompensas");
    const title = window.reg_recomp[idRecomp].title
    const descricao = window.reg_recomp[idRecomp].descricao
    const dificuldade = window.reg_recomp[idRecomp].dificuldade
    const title_mission = window.missoes[idMission].title

    const recomp = {
        title: title,
        descricao: descricao,
        dificuldade: dificuldade,
        data: Date.now(),
        mission_title: title_mission,
        mission_id: idMission,
        reinvindicado: false
    };
    const recomp_doc_ref = await addDoc(ref, recomp);
    window.recompensas[recomp_doc_ref.id] = recomp
}

window.reinvindicarRecomp = async (idRecomp, elem) => {
    const ref = doc(db, "Users", window.uid, "recompensas", idRecomp);
    const datas = {
        reinvindicado: true
    };
    await updateDoc(ref, datas);
    window.recompensas[idRecomp].reinvindicado = true
    elem.parentNode.className = "claimed"
    elem.className = "disabled"
}

window.deletarRecomp = async (idRecomp, elem) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    try {
        const ref = doc(db, "Users", window.uid, "recompensas", idRecomp);

        await deleteDoc(ref);

        delete window.recompensas[idRecomp];
    } catch (error) {
        alert("Erro ao deletar:", error);
    }

    elem.parentNode.removeChild(elem)
}

// Penalidade
window.createPenalidade = async function (_id_ = null) {
    const title_elem = document.getElementById("create-penal-title")
    const title = title_elem.value;
    const dificuldade = document.getElementById("create-penal-dificuldade").value;
    const desc = document.getElementById("create-penal-desc").value;

    if (!title) {
        title_elem.style.borderColor = "red"
        return;
    } else if (title == "Sem penalidade") {
        title_elem.style.borderColor = "red"
        alert("Esse Título para a penalidade não é permitido")
        return;
    }

    if (_id_ == null) {
        const ref = collection(db, "Users", window.uid, "reg_penal");
        const newPenal = {
            title: title,
            descricao: desc,
            dificuldade: dificuldade,
            admin: false
        };
        let penal_doc_ref = await addDoc(ref, newPenal);
        window.reg_penal[penal_doc_ref.id] = newPenal
        close_system_window("Criar Penalidade")
    } else {
        const ref = doc(db, "Users", window.uid, "reg_penal", _id_);
        const datas = {
            title: title,
            descricao: desc,
            dificuldade: dificuldade,
            admin: false
        };
        await updateDoc(ref, datas);
        window.reg_penal[_id_] = datas
        close_system_window("Editar Penalidade")
    }
    close_system_window("Penalidades")
    open_system_window("Penalidades")
}

window.deletePenalidade = async function (_id_) {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    try {
        const ref = doc(db, "Users", window.uid, "reg_penal", _id_);

        await deleteDoc(ref);

        delete window.reg_penal[_id_];
    } catch (error) {
        alert("Erro ao deletar:", error);
    }
    close_system_window("Editar Penalidade")
    close_system_window("Penalidades")
    open_system_window("Penalidades")
}

window.receberPenalidade = async function (idMission, idPenal, data_penalidade = null) {
    const ref = collection(db, "Users", window.uid, "penalidades");
    const title = window.reg_penal[idPenal].title
    const descricao = window.reg_penal[idPenal].descricao
    const dificuldade = window.reg_penal[idPenal].dificuldade
    const title_mission = window.missoes[idMission].title
    if (data_penalidade == null) {
        data_penalidade = Date.now()
    }

    const penal = {
        title: title,
        descricao: descricao,
        dificuldade: dificuldade,
        data: data_penalidade,
        mission_title: title_mission,
        mission_id: idMission,
        cumprido: false
    };
    const penal_doc_ref = await addDoc(ref, penal);
    window.penalidades[penal_doc_ref.id] = penal
}

window.recebPenalidadeAtrasadas = async (_id_, data_penalidade) => {
    const missionRef = doc(db, "Users", window.uid, "missoes", _id_);
    const datas = {
        last_finish: Date.now()
    };
    await updateDoc(missionRef, datas);
    window.missoes[_id_].last_finish = datas.last_finish

    loseAtrib(["Disciplina"])
    if (window.missoes[_id_].penalidade != "Sem penalidade") {
        await receberPenalidade(_id_, window.missoes[_id_].penalidade, data_penalidade)
    }
    const userRef = doc(db, "Users", window.uid);
    await updateDoc(userRef, window.datas);
}

window.cumprirPenalidade = async (idPenal, elem) => {
    const ref = doc(db, "Users", window.uid, "penalidades", idPenal);
    const datas = {
        cumprido: true
    };
    await updateDoc(ref, datas);
    window.penalidades[idPenal].cumprido = true
    elem.parentNode.className = "claimed"
    elem.className = "disabled"
}

window.deletarPenal = async (idPenal, elem) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    try {
        const ref = doc(db, "Users", window.uid, "penalidades", idPenal);

        await deleteDoc(ref);

        delete window.penalidades[idPenal];
    } catch (error) {
        alert("Erro ao deletar:", error);
    }

    elem.parentNode.removeChild(elem)
}