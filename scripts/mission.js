class Mission {
    constructor(data) {
        this.attributes = data['attributes'] || {};
        this.complete = data['complete'] || [];
        this.date = data['date'] || 0;
        this.description = data['description'] || "";
        this.difficulty = data['difficulty'] || niveis_difi[0];
        this.last_finish = data['last_finish'] || null;
        this.penalty = data['penalty'] || "Sem penalidade";
        this.term = data['term'] || "";
        this.rewards = data['rewards'] || "Sem recompensa";
        this.repeat = data['repeat'] || [];
        this.type = data['type'] || 0;
        this.title = data['title'] || "Título em Branco";
    }
    toJSON() {
        return {
            attributes: this.attributes,
            complete: this.complete,
            date: this.date,
            description: this.description,
            difficulty: this.difficulty,
            last_finish: this.last_finish,
            penalty: this.penalty,
            term: this.term,
            rewards: this.rewards,
            repeat: this.repeat,
            type: this.type,
            title: this.title
        };
    }
}