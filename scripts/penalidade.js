class Penalidade {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.descricao = data["descricao"] || "";
        this.data = data["data"] || 0;
        this.duration = data['duration'] || [0, 0];
        this.cumprido = data['cumprido'] || false;
        this.mission_title = data['mission_title'] || "";
        this.mission_id = data['mission_id'] || "";
        this.admin = data['admin'] || false;

    }
    toJSON() {
        return {
            title: this.title,
            descricao: this.descricao,
            data: this.data,
            duration: this.duration,
            cumprido: this.cumprido,
            mission_title: this.mission_title,
            mission_id: this.mission_id,
            admin: this.admin,
        };
    }
}

class reg_penal {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.descricao = data['descricao'] || "";
        this.duration = data['duration'] || 0;
        this.admin = data['admin'] || false;
    }
    toJSON() {
        return {
            title: this.title,
            descricao: this.descricao,
            duration: this.duration,
            admin: this.admin,
        };
    }
}