let cor_neon_1 = "rgba(34, 211, 238, 1)"
let cor_neon_2 = "rgba(34, 211, 238, 0.66)"

function drawRadar(datas) {
    const canvas = document.getElementById("radarChart");
    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    let maxValue = 10;

    const maxValueData = Math.max(...Object.values(datas))
    while (true) {
        if (maxValueData > maxValue) { maxValue *= 1.3 }
        else { break }
    }

    const keys = Object.keys(datas).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const angleStep = (Math.PI * 2) / keys.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // GRID
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        keys.forEach((key, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const r = radius * (i / 5);

            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);

            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = "#334155";
        ctx.stroke();
    }

    // LINHAS DO CENTRO
    keys.forEach((key, index) => {
        const angle = index * angleStep - Math.PI / 2;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "#1e293b";
        ctx.stroke();
    });

    // POLÍGONO
    ctx.beginPath();
    keys.forEach((key, index) => {
        const value = datas[key];
        const angle = index * angleStep - Math.PI / 2;
        const safeValue = Math.max(0, value);
        const r = radius * (safeValue / maxValue);

        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = cor_neon_2;
    ctx.fill();
    ctx.strokeStyle = cor_neon_1;
    ctx.stroke();

    // NOMES (labels)
    ctx.fillStyle = "#e2e8f0";
    ctx.font = remToPx(1.5).toString() + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    keys.forEach((key, index) => {
        const angle = index * angleStep - Math.PI / 2;

        const labelDistance = radius + 40;

        const x = centerX + labelDistance * Math.cos(angle);
        const y = centerY + labelDistance * Math.sin(angle);

        ctx.save(); // salva estado

        ctx.shadowColor = cor_neon_1; // cor do brilho
        ctx.shadowBlur = 10;         // intensidade

        ctx.fillText(key, x, y);
        // Valor (linha abaixo)
        ctx.fillText(datas[key], x, y + 18);

        ctx.restore(); // 👈 volta ao normal
    });
}