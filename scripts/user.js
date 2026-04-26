class User {
    constructor(data) {
        this.name = data['name'] || "";
        this.level = data['level'] || 1;
        this.xp = data['xp'] || 0;
        this.email = data['email'] || "";
        this.attributes = data['attributes'] || {};
        this.settings = data['settings'] || {};
        this.last_active = Date.now();
        this.missions = data['missions'] || {};
        this.rewards_log = data['rewards_log'] || {};
        this.penalties_log = data['penalties_log'] || {};
        this.rewards = data['rewards'] || {};
        this.penalties = data['penalties'] || {};
        this.counterFB = data['counterFB'] || {};
    }
    toJSON() {
        return {
            name: this.name,
            level: this.level,
            xp: this.xp,
            email: this.email,
            attributes: this.attributes,
            settings: this.settings,
            last_active: this.last_active,
            missions: this.missions,
            rewards_log: this.rewards_log,
            penalties_log: this.penalties_log,
            rewards: this.rewards,
            penalties: this.penalties,
            counterFB: this.counterFB
        };
    }

    getAtributesKeys() { return Object.keys(this.attributes) }
    getAtribute(attribute) { return this.attributes[attribute] }

    gainXP(amount) {
        this.xp += amount;

        if (this.xp >= _xpMax_) {
            this.xp -= _xpMax_;
            this.level++;
            _xpMax_ = Math.floor(this.level * 100);
            open_system_window("Level Up!")
        }
    }

    gainAtrib(attributes) {
        for (let i in attributes) {
            let atr = attributes[i]
            if (this.getAtributesKeys().includes(atr)) {
                this.attributes[atr]++
            }
        }
    }

    loseAtrib(attributes) {
        for (let i in attributes) {
            let atr = attributes[i]
            if (this.getAtributesKeys().includes(atr)) {
                this.attributes[atr]--
            }
        }
    }
}

class Penalidade {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.description = data["description"] || "";
        this.date = data["date"] || 0;
        this.duration = data['duration'] || [0, 0];
        this.fulfilled = data['fulfilled'] || false;
        this.mission_title = data['mission_title'] || "";
        this.mission_id = data['mission_id'] || "";
        this.admin = data['admin'] || false;

    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            duration: this.duration,
            fulfilled: this.fulfilled,
            mission_title: this.mission_title,
            mission_id: this.mission_id,
            admin: this.admin,
        };
    }
}

class reg_penal {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.description = data['description'] || "";
        this.duration = data['duration'] || 0;
        this.admin = data['admin'] || false;
    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            duration: this.duration,
            admin: this.admin,
        };
    }
}

class Recompensa {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.description = data['description'] || "";
        this.date = data['date'] || 0;
        this.duration = data['duration'] || [0, 0];
        this.claimed = data['claimed'] || false;
        this.mission_title = data['mission_title'] || "";
        this.mission_id = data['mission_id'] || "";
        this.admin = data['admin'] || false;
    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            duration: this.duration,
            claimed: this.claimed,
            mission_title: this.mission_title,
            mission_id: this.mission_id,
            admin: this.admin,
        };
    }
}

class reg_recomp {
    constructor(data) {
        this.title = data['title'] || "Título em Branco";
        this.description = data['description'] || "";
        this.duration = data['duration'] || 0;
        this.admin = data['admin'] || false;
    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            duration: this.duration,
            admin: this.admin,
        };
    }
}