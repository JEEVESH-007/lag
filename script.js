// Master Data Profile containing ALL verified NASA telemetry fields
const dataset = {
    proxima: { 
        name: "Proxima Centauri b", sy_dist: 1.30, pl_masse: 1.07, pl_rade: 1.03, 
        pl_orbper: 11.18, pl_orbsmax: 0.0485, st_teff: 3050, lambda: 0.08, starColor: "#ff7e47"
    },
    trappist: { 
        name: "TRAPPIST-1 e", sy_dist: 12.10, pl_masse: 0.692, pl_rade: 0.920, 
        pl_orbper: 6.10, pl_orbsmax: 0.0292, st_teff: 2566, lambda: 0.02, starColor: "#ff4b4b"
    }
};

let currentKey = 'proxima';
let timeWarp = 1;
let initialShieldSetting = 100;
let orbitalAngle = 0;
let flareActive = false;
let flareIntensity = 0;

// Setup Canvas Canvas Context
const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Simulation Control Actions
function switchTarget(key) {
    currentKey = key;
    document.getElementById('btn-proxima').classList.toggle('active', key === 'proxima');
    document.getElementById('btn-trappist').classList.toggle('active', key === 'trappist');
    updateTelemetryUI();
    writeLog(`Switched system target matrix to ${dataset[key].name}.`);
}

function updateSpeed(val) {
    timeWarp = parseFloat(val);
    document.getElementById('val-speed').innerText = val + "x";
}

function updateShield(val) {
    initialShieldSetting = parseInt(val);
    document.getElementById('val-shield').innerText = val + "%";
}

function writeLog(text) {
    document.getElementById('simulationLog').innerText = `> ${text}`;
}

function updateTelemetryUI() {
    const p = dataset[currentKey];
    const gravity = (p.pl_masse / Math.pow(p.pl_rade, 2)).toFixed(2);
    
    document.getElementById('lbl-name').innerText = p.name;
    document.getElementById('lbl-dist').innerText = p.sy_dist;
    document.getElementById('lbl-grav').innerText = gravity;
    document.getElementById('lbl-period').innerText = p.pl_orbper;
    document.getElementById('lbl-axis').innerText = p.pl_orbsmax;
    document.getElementById('lbl-steff').innerText = p.st_teff;
}

function triggerStellarFlare() {
    if (flareActive) return;
    flareActive = true;
    flareIntensity = 1;
    document.getElementById('alertOverlay').style.display = 'block';
    writeLog("⚠️ High-energy stellar flare warning detected! Computing stochastic degradation...");

    setTimeout(() => {
        const p = dataset[currentKey];
        // Stochastic Risk Math Formula execution: P_survival = e^(-lambda * time_factor)
        const timeFactor = 10 * (1.1 - (initialShieldSetting / 100));
        const survivalChance = Math.exp(-p.lambda * timeFactor);
        const survivalPct = Math.round(survivalChance * 100);

        if (Math.random() * 100 <= survivalPct) {
            writeLog(`✅ Flare passed. Shields absorbed shockwave safely (${survivalPct}% structural limit).`);
        } else {
            writeLog(`❌ Critical Alert! Shield failure encountered at ${survivalPct}% survival capacity threshold.`);
        }
        
        flareActive = false;
        document.getElementById('alertOverlay').style.display = 'none';
    }, 2000);
}

// Visual Core Animation Loop
function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const currentPlanet = dataset[currentKey];

    // Increment phase steps based on time warp sliders
    if (timeWarp > 0) {
        orbitalAngle += (0.01 * timeWarp * (6 / currentPlanet.pl_orbper));
    }

    // Draw localized space backdrops
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let r = 100; r < canvas.width; r += 150) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw Host Star Core
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
    ctx.fillStyle = currentPlanet.starColor;
    ctx.fill();
    ctx.shadowBlur = 30;
    ctx.shadowColor = currentPlanet.starColor;

    // Draw Flare shockwave canvas rings
    if (flareActive) {
        flareIntensity += 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45 + flareIntensity, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - flareIntensity/300)})`;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // Draw target orbit track
    const orbitRadius = 180;
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Compute active coordinate offsets
    const planetX = centerX + orbitRadius * Math.cos(orbitalAngle);
    const planetY = centerY + orbitRadius * Math.sin(orbitalAngle);

    // Draw Exoplanet Sphere
    ctx.beginPath();
    ctx.arc(planetX, planetY, 14 * currentPlanet.pl_rade, 0, Math.PI * 2);
    ctx.fillStyle = currentKey === 'proxima' ? '#6b7280' : '#38bdf8';
    ctx.fill();
    ctx.shadowBlur = 0; 

    // Draw local system probe attachment
    const probeX = planetX + 30 * Math.cos(orbitalAngle * 2);
    const probeY = planetY + 30 * Math.sin(orbitalAngle * 2);
    ctx.beginPath();
    ctx.arc(probeX, probeY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Draw field shielding configurations around structural probe profiles
    ctx.beginPath();
    ctx.arc(probeX, probeY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = flareActive ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(renderFrame);
}

// Boot Sequence
updateTelemetryUI();
renderFrame();
