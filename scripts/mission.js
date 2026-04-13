class Mission {
    constructor(data) {
        this.atributos = data.atributos || {};
        this.completa = data.completa || [];
        this.data = data.data || 0;
        this.descricao = data.descricao || "";
        this.dificuldade = data.dificuldade || niveis_difi[0];
        this.last_finish = data.last_finish || null;
        this.penalidade = data.penalidade || "Sem penalidade";
        this.prazo = data.prazo || "";
        this.recompensa = data.recompensa || "Sem recompensa";
        this.repeat = data.repeat || [];
        this.tipo = data.tipo || list_type[0];
        this.title = data.title || "Título em Branco";
    }
}