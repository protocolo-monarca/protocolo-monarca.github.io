class User {
    constructor(data) {
        this.name = data['name'] || "";
        this.level = data['level'] || 1;
        this.xp = data['xp'] || 0;
        this.email = data['email'] || "";
        this.atributos = data['atributos'] || {};
        this.config = data['config'] || {};
        this.last_active = data['config'] || Date.now();
    }
    toJSON() {
        return {
            name: this.name,
            level: this.level,
            xp: this.xp,
            email: this.email,
            atributos: this.atributos,
            config: this.config,
            last_active: Date.now()
        };
    }

    getAtributesKeys() { return Object.keys(this.atributos) }
    getAtribute(atribute) { return this.atributos[atribute] }

    gainXP(amount) {
        this.xp += amount;

        if (this.xp >= _xpMax_) {
            this.xp -= _xpMax_;
            this.level++;
            _xpMax_ = Math.floor(this.level * 100);
            open_system_window("Level Up!")
        }
    }

    gainAtrib(atributos) {
        for (let i in atributos) {
            let atr = atributos[i]
            if (this.getAtributesKeys().includes(atr)) {
                this.atributos[atr]++
            }
        }
    }
    loseAtrib(atributos) {
        for (let i in atributos) {
            let atr = atributos[i]
            if (this.getAtributesKeys().includes(atr)) {
                this.atributos[atr]--
            }
        }
    }
}