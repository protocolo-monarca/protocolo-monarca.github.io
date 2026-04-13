class Penalidade {
    constructor(data) {
        this.title = data.title || "Título em Branco";
        this.dificuldade = data.dificuldade || list_type[0];
        this.descricao = data.descricao || "";
        this.data = data.data || 0;
        this.duration = data.duration || [0, 0];
        this.cumprido = data.cumprido || false;
        this.mission_title = data.mission_title || "";
        this.mission_id = data.mission_id || "";
    }
}

class reg_penal {
    constructor(data) {
        this.title = data.title || "Título em Branco";
        this.descricao = data.descricao || "";
        this.dificuldade = data.dificuldade || niveis_dific[0];
        this.duration = data.duration || 0;
        this.admin = data.admin || false;
    }
}