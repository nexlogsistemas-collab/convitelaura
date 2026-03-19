// ============================================================
//  FAZENDINHA DA LAURA — script.js  (versão com 40 features)
// ============================================================

// ============================================================
//  FEATURE A: ÁUDIO — CORREÇÃO DO AUDIOCONTEXT.RESUME()
//  O AudioContext fica "suspended" até o user interagir.
//  Toda função de som chama ensureAudio() antes de tocar.
// ============================================================
let audioCtx = null;
let soundEnabled = false;
let farmLoop = null;

function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // ⬇️ CORREÇÃO PRINCIPAL: resume sempre antes de tocar
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// ---- TOM GENÉRICO ----
function playTone(freq, type, start, duration, gainVal = 0.15) {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + start + 0.05);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.1);
}

// ============================================================
//  SONS DA FAZENDA (versão suave, com compressor anti-clipping)
// ============================================================

// Helper: cria master limiter para evitar distorção
function createMaster(ctx, peakGain) {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value      = 10;
    comp.ratio.value     = 8;
    comp.attack.value    = 0.003;
    comp.release.value   = 0.2;
    const g = ctx.createGain();
    g.gain.value = peakGain;
    comp.connect(g);
    g.connect(ctx.destination);
    return comp; // conectar saída do som nele
}

// ---- BOI / VACA — Muuuuuu (tom grave e suave) ----
function playMooo() {
    const ctx = ensureAudio();
    const now = ctx.currentTime;

    const osc1     = ctx.createOscillator();
    const osc2     = ctx.createOscillator();
    const gainMain = ctx.createGain();
    const gainSub  = ctx.createGain();
    const lpf      = ctx.createBiquadFilter();
    const formant  = ctx.createBiquadFilter();
    const master   = createMaster(ctx, 0.12); // 🔈 BAIXO

    lpf.type = 'lowpass'; lpf.frequency.value = 700; lpf.Q.value = 1.5;
    formant.type = 'peaking'; formant.frequency.value = 300; formant.gain.value = 8; formant.Q.value = 1.2;

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(108, now);
    osc1.frequency.linearRampToValueAtTime(115, now + 0.35);
    osc1.frequency.linearRampToValueAtTime(100, now + 1.3);
    osc1.frequency.linearRampToValueAtTime(92, now + 1.9);

    osc2.frequency.setValueAtTime(54, now);
    osc2.frequency.linearRampToValueAtTime(48, now + 1.9);

    gainMain.gain.setValueAtTime(0, now);
    gainMain.gain.linearRampToValueAtTime(0.55, now + 0.12);
    gainMain.gain.setValueAtTime(0.55, now + 1.4);
    gainMain.gain.linearRampToValueAtTime(0, now + 2.0);

    gainSub.gain.value = 0.3;

    osc1.connect(gainMain); gainMain.connect(lpf);
    osc2.connect(gainSub);  gainSub.connect(lpf);
    lpf.connect(formant);
    formant.connect(master);

    osc1.start(now); osc1.stop(now + 2.1);
    osc2.start(now); osc2.stop(now + 2.1);

    showNoteFloat('🎵', 'cow1');
}

// ---- PORCO — Oink! Oink! (suave e nasal) ----
function makeOinkSound(delay = 0) {
    const ctx = ensureAudio();
    const t   = ctx.currentTime + delay;

    function oneOink(start, p1, p2) {
        const osc    = ctx.createOscillator();
        const g      = ctx.createGain();
        const bpf    = ctx.createBiquadFilter();
        const master = createMaster(ctx, 0.09); // 🔈

        bpf.type = 'bandpass'; bpf.frequency.value = 800; bpf.Q.value = 3;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(p1, start);
        osc.frequency.exponentialRampToValueAtTime(p2, start + 0.16);

        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.9, start + 0.03);
        g.gain.linearRampToValueAtTime(0, start + 0.2);

        osc.connect(bpf); bpf.connect(g); g.connect(master);
        osc.start(start); osc.stop(start + 0.24);
    }

    oneOink(t,        400, 250);
    oneOink(t + 0.32, 380, 230);
    showNoteFloat('🎵', 'pig1');
}

// ---- GALINHA — Cocoricoó (agudo e rápido, volume controlado) ----
function makeChickenSound(delay = 0) {
    const ctx = ensureAudio();
    const t   = ctx.currentTime + delay;

    function cluck(start, baseFreq) {
        const osc    = ctx.createOscillator();
        const g      = ctx.createGain();
        const hpf    = ctx.createBiquadFilter();
        const master = createMaster(ctx, 0.07); // 🔈

        hpf.type = 'highpass'; hpf.frequency.value = 500;
        osc.type = 'square';

        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.7, start + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, start + 0.13);

        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.8, start + 0.015);
        g.gain.linearRampToValueAtTime(0, start + 0.15);

        osc.connect(hpf); hpf.connect(g); g.connect(master);
        osc.start(start); osc.stop(start + 0.18);
    }

    [550, 700, 900, 650, 800].forEach((f, i) => cluck(t + i * 0.17, f));
    spawnFeathers();
    showNoteFloat('🎶', 'chicken1');
}

// ---- CABRA / OVELHA — Bééé (vibrato suave) ----
function makeBaaSound(delay = 0) {
    const ctx    = ensureAudio();
    const t      = ctx.currentTime + delay;
    const osc    = ctx.createOscillator();
    const lfo    = ctx.createOscillator();
    const lfoG   = ctx.createGain();
    const g      = ctx.createGain();
    const bpf    = ctx.createBiquadFilter();
    const master = createMaster(ctx, 0.1); // 🔈

    bpf.type = 'bandpass'; bpf.frequency.value = 650; bpf.Q.value = 2;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(270, t);
    osc.frequency.linearRampToValueAtTime(290, t + 0.12);
    osc.frequency.linearRampToValueAtTime(255, t + 0.85);

    lfo.type = 'sine'; lfo.frequency.value = 7;
    lfoG.gain.value = 14;
    lfo.connect(lfoG); lfoG.connect(osc.frequency);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.75, t + 0.08);
    g.gain.setValueAtTime(0.7, t + 0.55);
    g.gain.linearRampToValueAtTime(0, t + 0.9);

    osc.connect(bpf); bpf.connect(g); g.connect(master);
    lfo.start(t); osc.start(t);
    lfo.stop(t + 1); osc.stop(t + 1);

    showNoteFloat('🎶', 'sheep1');
}

// ---- VENTO (ruído de fundo bem suave) ----
function makeWindNoise() {
    const ctx = ensureAudio();
    if (!soundEnabled) return;
    const bufSize = ctx.sampleRate * 2;
    const buf  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass'; bpf.frequency.value = 350; bpf.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0.015; // 🔈 bem suave
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 2);
    if (soundEnabled) setTimeout(makeWindNoise, 2000);
}

// ---- AMBIENCE SCHEDULER ----
function startFarmAmbience() {
    ensureAudio();
    makeWindNoise();
    const schedule = () => {
        if (!soundEnabled) return;
        const t = Math.random() * 4 + 2;
        const r = Math.random();
        if      (r < 0.3)  makeChickenSound(0);
        else if (r < 0.55) makeOinkSound(0);
        else if (r < 0.8)  makeBaaSound(0);
        else               playMooo();
        farmLoop = setTimeout(schedule, t * 1000);
    };
    farmLoop = setTimeout(schedule, 800);
}
function stopFarmAmbience() { clearTimeout(farmLoop); }

// ============================================================
//  MELODIAS (definidas ANTES do click handler do barn!)
//  Parabéns pra Você e Jingle Bells
// ============================================================
const NOTE_FREQS = {
    C4:261.63, Cs4:277.18, D4:293.66, Ds4:311.13,
    E4:329.63, F4:349.23, Fs4:369.99, G4:392.00,
    Gs4:415.30, A4:440.00, As4:466.16, B4:493.88,
    C5:523.25
};

const HBD_MELODY = [
    {n:'C4',d:0.3},{n:'C4',d:0.15},{n:'D4',d:0.45},{n:'C4',d:0.45},
    {n:'F4',d:0.45},{n:'E4',d:0.9},
    {n:'C4',d:0.3},{n:'C4',d:0.15},{n:'D4',d:0.45},{n:'C4',d:0.45},
    {n:'G4',d:0.45},{n:'F4',d:0.9},
    {n:'C4',d:0.3},{n:'C4',d:0.15},{n:'C5',d:0.45},{n:'A4',d:0.45},
    {n:'F4',d:0.45},{n:'E4',d:0.45},{n:'D4',d:0.9},
    {n:'B4',d:0.3},{n:'B4',d:0.15},{n:'A4',d:0.45},{n:'F4',d:0.45},
    {n:'G4',d:0.45},{n:'F4',d:1.2},
];

const JINGLE_MELODY = [
    {n:'E4',d:0.3},{n:'E4',d:0.3},{n:'E4',d:0.6},
    {n:'E4',d:0.3},{n:'E4',d:0.3},{n:'E4',d:0.6},
    {n:'E4',d:0.3},{n:'G4',d:0.3},{n:'C4',d:0.3},{n:'D4',d:0.3},{n:'E4',d:1.2},
    {n:'F4',d:0.3},{n:'F4',d:0.3},{n:'F4',d:0.3},{n:'F4',d:0.3},
    {n:'F4',d:0.3},{n:'E4',d:0.3},{n:'E4',d:0.3},{n:'E4',d:0.15},{n:'E4',d:0.15},
    {n:'E4',d:0.3},{n:'D4',d:0.3},{n:'D4',d:0.3},{n:'E4',d:0.3},{n:'D4',d:0.6},{n:'G4',d:0.6},
];

function playMelody(melody) {
    const ctx = ensureAudio();
    const master = createMaster(ctx, 0.18); // volume suave
    let time = 0;
    melody.forEach(({ n, d }) => {
        const freq = NOTE_FREQS[n] || 440;
        const osc  = ctx.createOscillator();
        const g    = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + time);
        g.gain.linearRampToValueAtTime(0.8, ctx.currentTime + time + 0.02);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + time + d * 0.9);
        osc.connect(g); g.connect(master);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + d + 0.05);
        time += d;
    });
}

// ---- BOTÃO DE SOM ----
const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) {
        startFarmAmbience();
        showToast('🔊 Sons da fazenda ativados! Clique nos animais!');
    } else {
        stopFarmAmbience();
        showToast('🔇 Sons desativados');
    }
});

// ============================================================
//  CELEIRO — ABRIR COM MÚSICA DO SÍTIO + CONFETTI
// ============================================================
const barn = document.getElementById('barn');
barn.addEventListener('click', () => {
    if (!barn.classList.contains('open')) {
        barn.classList.add('open');
        ensureAudio();

        // 🎼 Inicia a música do Sítio do Pica-Pau Amarelo!
        startBgMusic();

        // Confetti de boas vindas após a porta abrir
        setTimeout(() => {
            launchRichConfetti();
            showToast('🐄 Bem-vinda à Fazendinha da Laura! 🎉');
            // Som de vaca carinhoso logo depois
            setTimeout(() => playMooo(), 1200);
        }, 900);
    }
});

// ============================================================
//  FEATURE C: SUPABASE — CONFIRMAR PRESENÇA
// ============================================================
const supabaseUrl = 'https://csxitgraaawziaflveol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGl0Z3JhYWF3emlhZmx2ZW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE5NzksImV4cCI6MjA4Njc2Nzk3OX0.sqcgO8gZZ7UPotWOnlQ8FQWhkxKnx_hsh7pRsCi1s2g';
const { createClient } = supabase;
const _supabase = createClient(supabaseUrl, supabaseKey);

const confirmBtn = document.getElementById('confirmBtn');
confirmBtn.addEventListener('click', async (event) => {
    event.stopPropagation();
    ensureAudio();
    const nome = prompt('Que legal que você vem! 🎉\nPor favor, digite seu nome completo:');
    if (nome && nome.trim() !== '') {
        try {
            confirmBtn.disabled = true;
            confirmBtn.querySelector('span').textContent = '⏳ Enviando...';
            const { error } = await _supabase.from('aniversario').insert([{ nome: nome.trim() }]);
            if (error) throw error;
            confirmBtn.querySelector('span').textContent = '✅ Presença Confirmada!';
            launchRichConfetti();
            showToast(`🥳 Arrasou, ${nome.trim()}! Te esperamos! 🐄`);
            playMooo();
        } catch (err) {
            console.error('Erro:', err.message);
            showToast('❌ Ops! Tente novamente.');
            confirmBtn.disabled = false;
            confirmBtn.querySelector('span').textContent = '🤝 Confirmar Presença!';
        }
    }
});

// ============================================================
//  FEATURE 1: COUNTDOWN ATÉ A FESTA (01/04/2026 16:30)
// ============================================================
const PARTY_DATE = new Date('2026-04-01T16:30:00');

function updateCountdown() {
    const now  = new Date();
    const diff = PARTY_DATE - now;
    if (diff <= 0) {
        document.getElementById('cdDays').textContent  = '00';
        document.getElementById('cdHours').textContent = '00';
        document.getElementById('cdMins').textContent  = '00';
        document.getElementById('cdSecs').textContent  = '00';
        return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    document.getElementById('cdDays').textContent  = String(days).padStart(2,'0');
    document.getElementById('cdHours').textContent = String(hours).padStart(2,'0');
    document.getElementById('cdMins').textContent  = String(mins).padStart(2,'0');
    document.getElementById('cdSecs').textContent  = String(secs).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================================
//  FEATURE 2: PROGRESS BAR (% do tempo até a festa)
// ============================================================
(function initProgressBar() {
    const wrap = document.createElement('div');
    wrap.className = 'progress-bar-wrap';
    const fill = document.createElement('div');
    fill.className = 'progress-bar-fill';
    fill.id = 'progressFill';
    wrap.appendChild(fill);
    document.body.appendChild(wrap);

    const START = new Date('2026-03-18T00:00:00');
    const totalMs = PARTY_DATE - START;
    function update() {
        const elapsed = new Date() - START;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        fill.style.width = pct + '%';
    }
    update();
    setInterval(update, 5000);
})();

// ============================================================
//  FEATURE 3: MODO DIA / NOITE (baseado no horário real)
// ============================================================
function checkDayNight() {
    const h = new Date().getHours();
    const isNight = (h >= 19 || h < 6);
    if (isNight) {
        document.body.classList.add('night-mode');
        initStars();
        initFireflies();
    } else {
        document.body.classList.remove('night-mode');
    }
}
checkDayNight();
setInterval(checkDayNight, 60000);

// ESTRELAS
function initStars() {
    const layer = document.getElementById('starsLayer');
    if (layer.childElementCount > 0) return;
    for (let i = 0; i < 80; i++) {
        const s = document.createElement('div');
        s.className = 'star-dot';
        const size = Math.random() * 3 + 1;
        s.style.cssText = `
            width:${size}px; height:${size}px;
            top:${Math.random()*60}%; left:${Math.random()*100}%;
            animation-delay:${Math.random()*3}s;
            animation-duration:${Math.random()*2+1}s;
        `;
        layer.appendChild(s);
    }
}

// VAGA-LUMES
function initFireflies() {
    const layer = document.getElementById('firefliesLayer');
    if (layer.childElementCount > 0) return;
    for (let i = 0; i < 20; i++) {
        const f = document.createElement('div');
        f.className = 'firefly';
        const fx  = (Math.random()-0.5)*100;
        const fy  = -(Math.random()*60+20);
        const fx2 = (Math.random()-0.5)*150;
        const fy2 = (Math.random()-0.5)*40;
        f.style.cssText = `
            left:${Math.random()*90}%; top:${Math.random()*60+20}%;
            --fx:${fx}px; --fy:${fy}px; --fx2:${fx2}px; --fy2:${fy2}px;
            animation-duration:${Math.random()*4+3}s;
            animation-delay:${Math.random()*5}s;
        `;
        layer.appendChild(f);
    }
}

// ============================================================
//  FEATURE 4: ARCO-ÍRIS (botão)
// ============================================================
const rainbowEl  = document.getElementById('rainbow');
const rainbowBtn = document.getElementById('rainbowBtn');
let rainbowTimer = null;

rainbowBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    rainbowEl.classList.add('show');
    clearTimeout(rainbowTimer);
    rainbowTimer = setTimeout(() => rainbowEl.classList.remove('show'), 5000);
    showToast('🌈 Arco-íris apareceu!');
});

// ============================================================
//  FEATURE 5: MOUSE TRAIL (rastro de estrelinhas)
// ============================================================
const trailContainer = document.getElementById('mouseTrail');
const TRAIL_EMOJIS = ['⭐','✨','🌟','💫','🌻','🎀','🍀'];
let lastTrailTime = 0;

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 60) return;
    lastTrailTime = now;

    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    const size = Math.random() * 14 + 10;
    dot.style.cssText = `
        left:${e.clientX - size/2}px;
        top:${e.clientY - size/2}px;
        width:${size}px; height:${size}px;
        font-size:${size}px; line-height:1;
        background: transparent;
    `;
    dot.textContent = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
    trailContainer.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
});

// ============================================================
//  FEATURE 6: GIRASSÓIS INTERATIVOS (clique no chão)
// ============================================================
const sunflowersGround = document.getElementById('sunflowersGround');
sunflowersGround.addEventListener('click', (e) => {
    ensureAudio();
    playTone(600, 'sine', 0, 0.15, 0.08);
    playTone(800, 'sine', 0.1, 0.15, 0.06);

    const sf = document.createElement('div');
    sf.className = 'sunflower';
    const flowers = ['🌻','🌼','🌸','🌺','🌹'];
    sf.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    sf.style.left = e.clientX + 'px';
    sunflowersGround.appendChild(sf);
    setTimeout(() => sf.remove(), 6000);
});

// ============================================================
//  FEATURE 7: PARTÍCULAS DE VENTO / PALHA
// ============================================================
const WIND_ITEMS = ['🌾','🍂','🍃','🌿','✨'];
function spawnWindParticle() {
    const p = document.createElement('div');
    p.className = 'wind-particle';
    p.textContent = WIND_ITEMS[Math.floor(Math.random() * WIND_ITEMS.length)];
    p.style.cssText = `
        left:${Math.random()*80}vw;
        top:${Math.random()*60+10}vh;
        --wx:${Math.random()*300+100}px;
        --wy:${(Math.random()-0.5)*60}px;
        animation-duration:${Math.random()*4+3}s;
        animation-delay:0s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 7000);
}
setInterval(spawnWindParticle, 2500);

// ============================================================
//  FEATURE 8: BALÃO DE AR QUENTE — clique para soltar confetti
// ============================================================
document.getElementById('balloon').addEventListener('click', (e) => {
    e.stopPropagation();
    ensureAudio();
    playTone(880, 'sine', 0, 0.3, 0.1);
    playTone(1100, 'sine', 0.15, 0.2, 0.08);
    launchRichConfetti();
    showToast('🎈 Pop! Confetti da fazendinha!');
});

// ============================================================
//  FEATURE 9: PIANO INTERATIVO
// ============================================================
// NOTE_FREQS, HBD_MELODY, JINGLE_MELODY e playMelody já definidos acima

const pianoPanel  = document.getElementById('pianoPanel');
const pianoBtn    = document.getElementById('pianoBtn');
const pianoClose  = document.getElementById('pianoClose');

document.getElementById('playHBD').addEventListener('click', (e) => {
    e.stopPropagation();
    playMelody(HBD_MELODY);
    showToast('🎂 Parabéns pra você, Laura!');
    launchRichConfetti();
});
document.getElementById('playJingle').addEventListener('click', (e) => {
    e.stopPropagation();
    playMelody(JINGLE_MELODY);
    showToast('🎅 Jingle Bells!');
});

// ============================================================
//  FEATURE 10: COMPARTILHAR NO WHATSAPP
// ============================================================
document.getElementById('shareBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const msg = encodeURIComponent(
        '🐄🎉 *CONVITE — Fazendinha da Laura!* 🎉🐄\n\n' +
        'As porteiras da fazendinha vão se abrir para uma festa inesquecível!\n\n' +
        '🎂 *7 Aninhos da Laura!*\n' +
        '📅 *02 de Abril — 16h30*\n' +
        '📍 *Rua Campo Verde, nº 35 — Lagoinha*\n\n' +
        'Venha comemorar com muita alegria! 🐖🐑🐓🌻'
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    showToast('📲 Compartilhando no WhatsApp!');
});

// ============================================================
//  FEATURE 11: ANIMAIS — SOM AO CLICAR + BUBBLE + NOTA FLUTUANTE
// ============================================================
const animalDefs = {
    cow1:     { fn: playMooo,            bubble: 'cowBubble' },
    pig1:     { fn: makeOinkSound,       bubble: 'pigBubble' },
    chicken1: { fn: makeChickenSound,    bubble: 'chickenBubble' },
    sheep1:   { fn: makeBaaSound,        bubble: 'sheepBubble' },
};

Object.entries(animalDefs).forEach(([id, { fn, bubble }]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureAudio();  // ⬅️ GARANTE QUE O CONTEXTO ESTÁ ATIVO
        fn();
        const bEl = document.getElementById(bubble);
        if (bEl) {
            bEl.classList.add('show');
            setTimeout(() => bEl.classList.remove('show'), 2000);
        }
    });
});

// BUBBLES PERIÓDICAS (sem som — só visuais quando som está off)
const bubbleIds = ['cowBubble','pigBubble','chickenBubble','sheepBubble'];
const soundFns  = [playMooo, makeOinkSound, makeChickenSound, makeBaaSound];
let bubbleIdx = 0;
setInterval(() => {
    const bId = bubbleIds[bubbleIdx % bubbleIds.length];
    const bEl = document.getElementById(bId);
    if (bEl) {
        if (soundEnabled) soundFns[bubbleIdx % soundFns.length]();
        bEl.classList.add('show');
        setTimeout(() => bEl.classList.remove('show'), 2200);
    }
    bubbleIdx++;
}, 4500);

// ============================================================
//  FEATURE 12: NOTA MUSICAL FLUTUANTE
// ============================================================
function showNoteFloat(note, animalId) {
    const el = document.getElementById(animalId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const n = document.createElement('div');
    n.className = 'note-float';
    n.textContent = note;
    n.style.left = (rect.left + rect.width / 2) + 'px';
    n.style.top  = (rect.top - 20) + 'px';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1600);
}

// ============================================================
//  FEATURE 13: PENAS VOANDO (galinha)
// ============================================================
function spawnFeathers() {
    const chicken = document.getElementById('chicken1');
    if (!chicken) return;
    const rect = chicken.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const f = document.createElement('div');
            f.className = 'feather';
            f.textContent = '🪶';
            f.style.left = (rect.left + Math.random()*40) + 'px';
            f.style.top  = rect.top + 'px';
            f.style.animationDuration = (Math.random()*0.5+0.8) + 's';
            document.body.appendChild(f);
            setTimeout(() => f.remove(), 1500);
        }, i * 150);
    }
}

// ============================================================
//  FEATURE 14: CONFETTI RICO (formas geométricas coloridas)
// ============================================================
const CONFETTI_COLORS = ['#ffd600','#f44336','#4caf50','#2196f3','#e91e63','#ff5722','#9c27b0'];

function launchRichConfetti() {
    // Emojis caindo
    const ITEMS = ['🌟','⭐','🎉','🎊','🌻','🐄','🐖','🐑','🐓','🍀','🎈','🌈','🎀','🍭'];
    const container = document.getElementById('fallingItems');
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'fall-item';
            el.textContent = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            el.style.left = Math.random() * 96 + 'vw';
            el.style.fontSize = (Math.random() * 1.2 + 1.2) + 'rem';
            const dur = Math.random() * 2 + 2.5;
            el.style.animationDuration = dur + 's';
            container.appendChild(el);
            setTimeout(() => el.remove(), dur * 1000 + 300);
        }, i * 80);
    }
    // Peças de confetti geométricas
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.cssText = `
                left:${Math.random()*100}vw;
                top:-10px;
                background:${CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)]};
                width:${Math.random()*10+5}px;
                height:${Math.random()*10+5}px;
                border-radius:${Math.random()>0.5?'50%':'2px'};
                animation-duration:${Math.random()*2+2}s;
            `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 4200);
        }, i * 60);
    }
}

// ============================================================
//  FEATURE 15: PARALLAX DAS NUVENS AO MOVER MOUSE
// ============================================================
const clouds = document.querySelectorAll('.cloud');
document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5);
    clouds.forEach((c, i) => {
        const factor = (i + 1) * 8;
        c.style.marginLeft = (cx * factor) + 'px';
    });
});

// ============================================================
//  FEATURE 16: EASTER EGG — KONAMI CODE → UFO!
// ============================================================
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
            konamiIdx = 0;
            spawnUFO();
        }
    } else {
        konamiIdx = 0;
    }
});

function spawnUFO() {
    const ufo = document.createElement('div');
    ufo.className = 'ufo';
    ufo.textContent = '🛸';
    document.body.appendChild(ufo);
    showToast('👽 Um ET veio à festa da Laura!');
    ensureAudio();
    // som alienígena
    const ctx = ensureAudio();
    const now = ctx.currentTime;
    for (let i = 0; i < 8; i++) {
        playTone(200 + i*150, 'sine', i*0.15, 0.12, 0.06);
    }
    setTimeout(() => {
        ufo.classList.add('go-away');
        setTimeout(() => ufo.remove(), 2100);
    }, 4000);
}

// ============================================================
//  FEATURE 17: TOAST SYSTEM
// ============================================================
let toastTimer = null;
const toastEl = document.getElementById('toast');

function showToast(msg, duration = 3000) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ============================================================
//  FEATURE 18: TRATOR — PARAR E BUZINAR AO CLICAR
// ============================================================
const tractorEl = document.getElementById('tractor');
if (tractorEl) {
    tractorEl.style.pointerEvents = 'all';
    tractorEl.style.cursor = 'pointer';
    tractorEl.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureAudio();
        // Buzina do trator
        playTone(350, 'sawtooth', 0,    0.15, 0.2);
        playTone(280, 'sawtooth', 0.15, 0.25, 0.18);
        showToast('🚜 Vrum vrum! Trator na fazenda!');
    });
}

// ============================================================
//  FEATURE 19: ESPANTALHO — CLICAR FALA
// ============================================================
const scarecrowEl = document.getElementById('scarecrow');
if (scarecrowEl) {
    scarecrowEl.style.pointerEvents = 'all';
    scarecrowEl.style.cursor = 'pointer';
    const msgs = ['👻 Uuuuu!','🐦 Vai embora, pássaro!','🌾 Guardando a roça!','😶 Eu cuido da fazenda!'];
    let scIdx = 0;
    scarecrowEl.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureAudio();
        playTone(500, 'triangle', 0, 0.4, 0.08);
        showToast(msgs[scIdx % msgs.length]);
        scIdx++;
    });
}

// ============================================================
//  FEATURE 20: MOINHO — VENTO ACELERA AO CLICAR
// ============================================================
const wmBlades = document.getElementById('wmBlades');
if (wmBlades) {
    const windmillDiv = document.getElementById('windmill');
    if (windmillDiv) {
        windmillDiv.style.pointerEvents = 'all';
        windmillDiv.style.cursor = 'pointer';
        let fast = false;
        windmillDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            fast = !fast;
            wmBlades.style.animationDuration = fast ? '0.5s' : '3s';
            ensureAudio();
            makeWindNoise();
            showToast(fast ? '💨 Vento forte!' : '🌬️ Vento suave...');
        });
    }
}

// ============================================================
//  FEATURE 21: BADGE LAURA + CONTADOR DE DIAS NO CONTEÚDO
// ============================================================
(function insertBadges() {
    const scrollContent = document.querySelector('.scroll-content');
    if (!scrollContent) return;

    // Badge Laura
    const badge = document.createElement('div');
    badge.className = 'laura-badge';
    badge.innerHTML = '💕 Para a nossa princesa Laura 💕';

    // Dias restantes
    const dias = document.createElement('div');
    dias.className = 'days-badge';
    const daysLeft = Math.max(0, Math.ceil((PARTY_DATE - new Date()) / 86400000));
    dias.innerHTML = `🗓️ Faltam <strong id="daysBadge">${daysLeft}</strong> dias pra festa!`;

    const firstCard = scrollContent.querySelector('.info-card');
    if (firstCard) {
        scrollContent.insertBefore(dias, firstCard);
        scrollContent.insertBefore(badge, firstCard);
    }
})();

// ============================================================
//  FEATURE 22: TOQUE DUPLO NO CELEIRO → MODO NOTURNO MANUAL
// ============================================================
let lastBarnTap = 0;
barn.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastBarnTap < 400 && barn.classList.contains('open')) {
        document.body.classList.toggle('night-mode');
        if (document.body.classList.contains('night-mode')) {
            initStars(); initFireflies();
            showToast('🌙 Modo noturno ativado!');
        } else {
            showToast('☀️ Modo diurno!');
        }
    }
    lastBarnTap = now;
});

// ============================================================
//  FEATURE 23: SONS DO PIANO COM FEEDBACK DE TECLADO
// ============================================================
const KB_MAP = {
    'a':'C4','w':'Cs4','s':'D4','e':'Ds4','d':'E4','f':'F4',
    't':'Fs4','g':'G4','y':'Gs4','h':'A4','u':'As4','j':'B4','k':'C5'
};
document.addEventListener('keydown', (e) => {
    if (document.getElementById('pianoPanel').classList.contains('open')) {
        const note = KB_MAP[e.key.toLowerCase()];
        if (note) {
            ensureAudio();
            const freq = NOTE_FREQS[note];
            if (freq) {
                playTone(freq, 'sine', 0, 0.5, 0.25);
                const keyEl = document.querySelector(`[data-note="${note}"]`);
                if (keyEl) { keyEl.classList.add('pressed'); setTimeout(()=>keyEl.classList.remove('pressed'),200); }
            }
        }
    }
});

// ============================================================
//  FEATURE 24: CLIQUE LONGO NO SOL → CHUVA DE ESTRELAS
// ============================================================
const sunEl = document.getElementById('sun');
if (sunEl) {
    let sunHold = null;
    sunEl.style.cursor = 'pointer';
    sunEl.style.pointerEvents = 'all';
    sunEl.addEventListener('mousedown', () => {
        sunHold = setTimeout(() => {
            launchRichConfetti();
            showToast('⭐ Chuva de estrelas!');
            ensureAudio();
            for(let i=0;i<5;i++) playTone(880+i*100,'sine',i*0.1,0.3,0.08);
        }, 800);
    });
    sunEl.addEventListener('mouseup', () => clearTimeout(sunHold));
    sunEl.addEventListener('mouseleave', () => clearTimeout(sunHold));
}

// ============================================================
//  WELCOME TOAST ao carregar
// ============================================================
window.addEventListener('load', () => {
    setTimeout(() => showToast('🐄 Toque no celeiro para abrir o convite!'), 1200);
});

// ============================================================
//  DICA DE SOM após 5s
// ============================================================
setTimeout(() => {
    if (!soundEnabled) showToast('🔊 Clique no 🔊 para ouvir os sons da fazenda!', 4000);
}, 5000);

// ============================================================
//  MÚSICA DE FUNDO — Sítio do Pica-Pau Amarelo (YouTube)
//  Toca automaticamente ao abrir o celeiro, com toggle 🎼
// ============================================================
let ytPlayer        = null;
let ytReady         = false;
let ytPlayPending   = false; // flag: tocar quando o player estiver pronto
let bgMusicPlaying  = false;

// Callback global exigido pela YouTube IFrame API
window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('ytPlayer', {
        height: '1',
        width:  '1',
        videoId: 'lEmoOncDABY',          // Sítio do Pica-Pau Amarelo
        playerVars: {
            autoplay:   0,               // inicia controlado pelo JS
            loop:       1,               // toca em loop
            playlist:   'lEmoOncDABY',   // necessário para loop funcionar
            controls:   0,
            disablekb:  1,
            fs:         0,
            modestbranding: 1,
            rel:        0,
            start:      0,               // desde o início
        },
        events: {
            onReady: (event) => {
                ytReady = true;
                event.target.setVolume(45); // volume suave (0-100)
                if (ytPlayPending) {
                    event.target.playVideo();
                    bgMusicPlaying = true;
                    ytPlayPending  = false;
                    updateMusicBtn();
                }
            },
            onStateChange: (event) => {
                // Se o vídeo terminar (não deveria por causa do loop), reinicia
                if (event.data === YT.PlayerState.ENDED) {
                    ytPlayer.playVideo();
                }
            }
        }
    });
};

function startBgMusic() {
    if (!ytPlayer || !ytReady) {
        ytPlayPending = true;   // será tocado quando onReady disparar
        return;
    }
    ytPlayer.playVideo();
    bgMusicPlaying = true;
    updateMusicBtn();
}

function stopBgMusic() {
    if (ytPlayer && ytReady) {
        ytPlayer.pauseVideo();
    }
    bgMusicPlaying = false;
    updateMusicBtn();
}

function updateMusicBtn() {
    const btn = document.getElementById('musicBgBtn');
    if (!btn) return;
    if (bgMusicPlaying) {
        btn.classList.add('playing');
        btn.title = '⏸ Pausar música do Sítio';
    } else {
        btn.classList.remove('playing');
        btn.title = '▶ Tocar música do Sítio 🎶';
    }
}

// Toggle manual pelo botão 🎼
document.getElementById('musicBgBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMusicPlaying) {
        stopBgMusic();
        showToast('🎼 Música do Sítio pausada');
    } else {
        startBgMusic();
        showToast('🎼 ♪ Sítio do Pica-Pau Amarelo ♪');
    }
});


// ============================================================
//  LISTA DE PRESENTES — toggle accordion
// ============================================================
function toggleGifts() {
    const list  = document.getElementById('giftList');
    const arrow = document.getElementById('giftArrow');
    const isOpen = list.classList.contains('open');

    list.classList.toggle('open');
    arrow.classList.toggle('open');

    ensureAudio();
    if (!isOpen) {
        // Som festivo ao abrir
        playTone(880,  'sine', 0,    0.12, 0.08);
        playTone(1100, 'sine', 0.1,  0.12, 0.08);
        playTone(1320, 'sine', 0.2,  0.18, 0.08);
        showToast('🎁 Lista de presentes aberta!');
    }
}

// ============================================================
//  PIX — copiar chave para o clipboard
// ============================================================
function copyPix() {
    const key   = '85992914551';
    const hint  = document.getElementById('pixHint');
    const box   = document.getElementById('pixBox');

    ensureAudio();
    playTone(1200, 'sine', 0,   0.1,  0.1);
    playTone(1600, 'sine', 0.1, 0.15, 0.08);

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key).then(() => {
            hint.textContent  = '✅ Chave copiada! Abra o app do banco e cole.';
            hint.classList.add('pix-copied');
            box.style.borderColor = '#ffd600';
            showToast('✅ Chave PIX copiada: ' + key);
            setTimeout(() => {
                hint.textContent  = '👆 Toque para copiar a chave PIX';
                hint.classList.remove('pix-copied');
                box.style.borderColor = '#25D366';
            }, 4000);
        }).catch(() => fallbackCopy(key, hint, box));
    } else {
        fallbackCopy(key, hint, box);
    }
}

function fallbackCopy(key, hint, box) {
    // Seleciona o texto manualmente para mobile
    const el = document.getElementById('pixKey');
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
        document.execCommand('copy');
        hint.textContent = '✅ Chave copiada!';
        hint.classList.add('pix-copied');
        showToast('✅ Chave PIX copiada: ' + key);
    } catch(e) {
        hint.textContent = '📋 Chave: ' + key + ' — copie manualmente!';
        showToast('📋 Chave PIX: ' + key);
    }
    window.getSelection().removeAllRanges();
    setTimeout(() => {
        hint.textContent = '👆 Toque para copiar a chave PIX';
        hint.classList.remove('pix-copied');
        box.style.borderColor = '#25D366';
    }, 4000);
}

// ============================================================
//  LOADING SCREEN
// ============================================================
(function initLoadingScreen() {
    const screen  = document.getElementById('loadingScreen');
    const fill    = document.getElementById('loadingBarFill');
    const pct     = document.getElementById('loadingPct');
    if (!screen) return;

    let progress = 0;
    const interval = setInterval(() => {
        // Aceleração progressiva
        progress += Math.random() * 18 + (progress < 50 ? 5 : progress < 85 ? 2 : 0.5);
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                screen.classList.add('hidden');
                setTimeout(() => screen.remove(), 900);
            }, 300);
        }
        fill.style.width = progress + '%';
        pct.textContent  = Math.round(progress) + '%';
    }, 80);
})();

// ============================================================
//  SISTEMA DE CONQUISTAS (ACHIEVEMENTS)
// ============================================================
const ACHIEVEMENTS = {
    openBarn:    { icon: '🏠', title: 'Bem-vinda à Fazenda!',   desc: 'Você abriu o celeiro pela primeira vez' },
    clickCow:    { icon: '🐄', title: 'Amiga das Vacas!',        desc: 'Clicou na vaquinha' },
    clickPig:    { icon: '🐖', title: 'Amiga dos Porquinhos!',   desc: 'Clicou no porquinho' },
    clickChicken:{ icon: '🐓', title: 'Amiga das Galinhas!',     desc: 'Clicou na galinhinha' },
    clickSheep:  { icon: '🐑', title: 'Amiga das Ovelhas!',      desc: 'Clicou na ovelhinha' },
    enableSound: { icon: '🔊', title: 'Fazenda Sonora!',         desc: 'Ligou os sons da fazendinha' },
    playPiano:   { icon: '🎹', title: 'Pianista da Fazenda!',    desc: 'Tocou uma música no piano' },
    rainbowFound:{ icon: '🌈', title: 'Caçadora de Arco-Íris!',  desc: 'Encontrou o arco-íris' },
    playMemory:  { icon: '🃏', title: 'Memória de Elefante!',    desc: 'Começou o jogo da memória' },
    winMemory:   { icon: '🏆', title: 'Campeã da Memória!',      desc: 'Venceu o jogo da memória!' },
    playQuiz:    { icon: '🌾', title: 'Estudiosa da Fazenda!',   desc: 'Participou do quiz' },
    perfectQuiz: { icon: '🥇', title: 'Nota 10 no Quiz!',        desc: 'Acertou todas as perguntas!' },
    blowCandles: { icon: '🎂', title: 'Fez um Pedido!',          desc: 'Apagou todas as velinhas do bolo' },
    signBook:    { icon: '📖', title: 'Deixou uma Mensagem!',     desc: 'Assinou o livro de visitas' },
    pixCopied:   { icon: '💚', title: 'PIX Copiado!',            desc: 'Copiou a chave PIX' },
    clickBalloon:{ icon: '🎈', title: 'Toque nas Nuvens!',       desc: 'Clicou no balão de ar quente' },
    nightMode:   { icon: '🌙', title: 'Noite na Fazenda!',       desc: 'Viu o anoitecer na fazendinha' },
    clickWindmill:{ icon: '🌀', title: 'Moinho Acelerado!',      desc: 'Clicou no moinho de vento' },
    clickTractor:{ icon: '🚜', title: 'Motorista do Trator!',    desc: 'Clicou no tatuzão' },
    confirmPresence:{ icon: '🤝', title: 'Presença Confirmada!', desc: 'Confirmou presença na festa!' },
};

const unlockedAchievements = new Set(
    JSON.parse(localStorage.getItem('fazendaAch') || '[]')
);
let achQueue  = [];
let achShowing = false;

function unlockAchievement(key) {
    if (!ACHIEVEMENTS[key] || unlockedAchievements.has(key)) return;
    unlockedAchievements.add(key);
    localStorage.setItem('fazendaAch', JSON.stringify([...unlockedAchievements]));
    achQueue.push(key);
    if (!achShowing) processAchQueue();
}

function processAchQueue() {
    if (!achQueue.length) { achShowing = false; return; }
    achShowing = true;
    const key  = achQueue.shift();
    const ach  = ACHIEVEMENTS[key];
    const popup = document.getElementById('achievementPopup');
    const icon  = document.getElementById('achIcon');
    const title = document.getElementById('achTitle');
    const desc  = document.getElementById('achDesc');
    if (!popup) return;

    icon.textContent  = ach.icon;
    title.textContent = ach.title;
    desc.textContent  = ach.desc;

    popup.classList.add('show');
    playTone(523, 'sine', 0,    0.1, 0.08);
    playTone(659, 'sine', 0.1,  0.1, 0.08);
    playTone(784, 'sine', 0.22, 0.2, 0.1);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(processAchQueue, 400);
    }, 3500);
}

// Hook achievements em eventos já existentes
document.addEventListener('DOMContentLoaded', () => {
    // Confirmação de presença
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => unlockAchievement('confirmPresence'), { once: true });
    }
    // Balão
    const balloon = document.getElementById('balloon');
    if (balloon) {
        balloon.addEventListener('click', () => unlockAchievement('clickBalloon'), { once: true });
    }
    // Moinho
    const windmill = document.getElementById('windmill');
    if (windmill) {
        windmill.addEventListener('click', () => unlockAchievement('clickWindmill'), { once: true });
    }
    // Trator
    const tractor = document.getElementById('tractor');
    if (tractor) {
        tractor.addEventListener('click', () => unlockAchievement('clickTractor'), { once: true });
    }
    // Arco-íris
    const rainbowBtn = document.getElementById('rainbowBtn');
    if (rainbowBtn) {
        rainbowBtn.addEventListener('click', () => unlockAchievement('rainbowFound'), { once: true });
    }
    // Piano
    const pianoBtn = document.getElementById('pianoBtn');
    if (pianoBtn) {
        pianoBtn.addEventListener('click', () => unlockAchievement('playPiano'), { once: true });
    }
    // Som da fazenda
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => unlockAchievement('enableSound'), { once: true });
    }
    // Animais
    const aniMap = { cow1: 'clickCow', pig1: 'clickPig', chicken1: 'clickChicken', sheep1: 'clickSheep' };
    Object.entries(aniMap).forEach(([id, ach]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => unlockAchievement(ach), { once: true });
    });
});

// Barn opening → achievement
const _origBarnHandler = barn.onclick;
barn.addEventListener('click', () => unlockAchievement('openBarn'), { once: true });

// ============================================================
//  JOGO DA MEMÓRIA
// ============================================================
const MEMORY_ANIMALS = ['🐄','🐖','🐑','🐓','🌻','🌸','🦋','🚜'];
let memFlipped   = [];
let memMatched   = 0;
let memAttempts  = 0;
let memLocked    = false;
let memTimerInterval = null;
let memSeconds   = 0;
let memStarted   = false;

function openMemoryGame() {
    openModal('memoryModal');
    startMemoryGame();
    unlockAchievement('playMemory');
}

function startMemoryGame() {
    memFlipped   = [];
    memMatched   = 0;
    memAttempts  = 0;
    memLocked    = false;
    memSeconds   = 0;
    memStarted   = false;

    clearInterval(memTimerInterval);

    document.getElementById('memAttempts').textContent = '0';
    document.getElementById('memPairs').textContent    = '0';
    document.getElementById('memTimer').textContent    = '00:00';
    document.getElementById('memoryWinBox').style.display = 'none';

    // Criar 16 cartas (8 pares embaralhados)
    const pairs = [...MEMORY_ANIMALS, ...MEMORY_ANIMALS];
    shuffleArray(pairs);

    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    pairs.forEach((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.idx   = idx;
        card.innerHTML = `
            <div class="card-front">🌾</div>
            <div class="card-back">${emoji}</div>
        `;
        card.addEventListener('click', onMemCardClick);
        grid.appendChild(card);
    });
}

function onMemCardClick(e) {
    const card = e.currentTarget;
    if (memLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    // Iniciar timer na primeira carta
    if (!memStarted) {
        memStarted = true;
        memTimerInterval = setInterval(() => {
            memSeconds++;
            document.getElementById('memTimer').textContent = formatMemTime(memSeconds);
        }, 1000);
    }

    card.classList.add('flipped');
    playTone(440, 'sine', 0, 0.1, 0.06);
    memFlipped.push(card);

    if (memFlipped.length === 2) {
        memLocked   = true;
        memAttempts++;
        document.getElementById('memAttempts').textContent = memAttempts;

        const [a, b] = memFlipped;
        if (a.dataset.emoji === b.dataset.emoji) {
            // Par encontrado!
            setTimeout(() => {
                a.classList.add('matched');
                b.classList.add('matched');
                memFlipped = [];
                memLocked  = false;
                memMatched++;
                document.getElementById('memPairs').textContent = memMatched;
                playTone(523, 'sine', 0,   0.1, 0.08);
                playTone(659, 'sine', 0.1, 0.1, 0.08);
                playTone(784, 'sine', 0.2, 0.2, 0.1);
                showToast('✅ Par encontrado!');

                if (memMatched === 8) {
                    clearInterval(memTimerInterval);
                    setTimeout(showMemoryWin, 500);
                }
            }, 300);
        } else {
            // Errou!
            setTimeout(() => {
                a.classList.add('shake');
                b.classList.add('shake');
                playTone(200, 'sawtooth', 0, 0.15, 0.05);
                setTimeout(() => {
                    a.classList.remove('flipped', 'shake');
                    b.classList.remove('flipped', 'shake');
                    memFlipped = [];
                    memLocked  = false;
                }, 600);
            }, 700);
        }
    }
}

function showMemoryWin() {
    const winBox = document.getElementById('memoryWinBox');
    document.getElementById('memFinalAttempts').textContent = memAttempts;
    document.getElementById('memFinalTime').textContent     = formatMemTime(memSeconds);
    winBox.style.display = 'block';
    launchRichConfetti();
    showToast('🏆 Parabéns! Você is a Campeã da Memória!');
    unlockAchievement('winMemory');
    playMelody(HBD_MELODY.slice(0, 8)); // Trecho curto de comemoração
}

function formatMemTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================
//  QUIZ DA FAZENDA
// ============================================================
const QUIZ_QUESTIONS = [
    {
        emoji: '🐄',
        question: 'O que a vaca nos dá de mais importante no café da manhã?',
        options: ['Mel', 'Leite', 'Ovo', 'Lã'],
        answer: 1,
        fact: '🥛 As vacas produzem em média 25 litros de leite por dia!'
    },
    {
        emoji: '🐓',
        question: 'Qual animal é famoso por cantar de manhã cedo?',
        options: ['A vaca', 'O porco', 'O galo', 'A ovelha'],
        answer: 2,
        fact: '🌅 O galo canta ao amanhecer para avisar que o dia começou!'
    },
    {
        emoji: '🐑',
        question: 'De qual animal vem a lã usada para fazer roupas?',
        options: ['Galinha', 'Porco', 'Vaca', 'Ovelha'],
        answer: 3,
        fact: '🧶 Uma ovelha produz cerca de 4 kg de lã por ano!'
    },
    {
        emoji: '🥚',
        question: 'Qual animal bota ovos na fazenda?',
        options: ['Porco', 'Galinha', 'Vaca', 'Cavalo'],
        answer: 1,
        fact: '🐣 Uma galinha pode botar até 300 ovos por ano!'
    },
    {
        emoji: '🌽',
        question: 'Qual vegetal amarelo é muito cultivado em fazendas?',
        options: ['Brócolis', 'Cenoura', 'Milho', 'Beterraba'],
        answer: 2,
        fact: '🌾 O milho é um dos grãos mais cultivados do mundo!'
    },
    {
        emoji: '🐷',
        question: 'O porco rola na lama para...',
        options: ['Brincar', 'Comer', 'Se refrescar', 'Dormir melhor'],
        answer: 2,
        fact: '🌡️ Porcos não suam! A lama os ajuda a regular a temperatura!'
    },
    {
        emoji: '🚜',
        question: 'Qual veículo é essencial para trabalhar na fazenda?',
        options: ['Ônibus', 'Trator', 'Avião', 'Barco'],
        answer: 1,
        fact: '⚙️ O trator foi inventado no fim do século XIX e revolucionou a agricultura!'
    },
    {
        emoji: '🌻',
        question: 'A girassol sempre aponta para qual direção?',
        options: ['Para o sul', 'Para a lua', 'Para o sol', 'Para baixo'],
        answer: 2,
        fact: '☀️ Os girassóis jovens seguem o sol durante o dia — isso se chama heliotrofismo!'
    },
];

let quizCurrent = 0;
let quizScore   = 0;
let quizAnswered = false;

function openQuiz() {
    openModal('quizModal');
    startQuiz();
    unlockAchievement('playQuiz');
}

function startQuiz() {
    quizCurrent  = 0;
    quizScore    = 0;
    quizAnswered = false;
    document.getElementById('quizScoreBox').style.display  = 'none';
    document.getElementById('quizContent').style.display   = 'block';
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q    = QUIZ_QUESTIONS[quizCurrent];
    const pct  = (quizCurrent / QUIZ_QUESTIONS.length) * 100;
    document.getElementById('quizProgFill').style.width     = pct + '%';
    document.getElementById('quizProgLabel').textContent    = `${quizCurrent + 1} / ${QUIZ_QUESTIONS.length}`;

    const letters = ['A', 'B', 'C', 'D'];
    const optionsHtml = q.options.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz(${i})" id="qopt${i}">
            <span class="quiz-option-letter">${letters[i]}</span>
            <span>${opt}</span>
        </button>
    `).join('');

    document.getElementById('quizContent').innerHTML = `
        <div class="quiz-question-box">
            <div class="quiz-question-num">Pergunta ${quizCurrent + 1} de ${QUIZ_QUESTIONS.length}</div>
            <span class="quiz-question-emoji">${q.emoji}</span>
            <div class="quiz-question-text">${q.question}</div>
        </div>
        <div class="quiz-options" id="quizOptions">
            ${optionsHtml}
        </div>
        <div id="quizFeedback"></div>
    `;
    quizAnswered = false;
}

function answerQuiz(selected) {
    if (quizAnswered) return;
    quizAnswered = true;

    const q       = QUIZ_QUESTIONS[quizCurrent];
    const correct = selected === q.answer;
    const btn     = document.getElementById('qopt' + selected);
    const correctBtn = document.getElementById('qopt' + q.answer);

    // Desabilitar todos
    document.querySelectorAll('.quiz-option').forEach(b => b.classList.add('disabled'));

    if (correct) {
        btn.classList.add('correct');
        quizScore++;
        playTone(523, 'sine', 0, 0.1, 0.06);
        playTone(659, 'sine', 0.1, 0.15, 0.07);
    } else {
        btn.classList.add('wrong');
        correctBtn.classList.add('correct');
        playTone(200, 'sawtooth', 0, 0.2, 0.05);
    }

    const fb = document.getElementById('quizFeedback');
    fb.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
    fb.innerHTML = correct
        ? `✅ Correto! ${q.fact}`
        : `❌ Era "${q.options[q.answer]}" — ${q.fact}`;

    // Próxima ou resultado
    if (quizCurrent < QUIZ_QUESTIONS.length - 1) {
        fb.innerHTML += `<br><button class="quiz-next-btn" onclick="nextQuizQuestion()">➡️ Próxima Pergunta</button>`;
    } else {
        fb.innerHTML += `<br><button class="quiz-next-btn" onclick="showQuizResult()">🏁 Ver Resultado!</button>`;
    }
}

function nextQuizQuestion() {
    quizCurrent++;
    renderQuizQuestion();
}

function showQuizResult() {
    document.getElementById('quizProgFill').style.width  = '100%';
    document.getElementById('quizProgLabel').textContent = `${QUIZ_QUESTIONS.length} / ${QUIZ_QUESTIONS.length}`;
    document.getElementById('quizContent').style.display  = 'none';
    document.getElementById('quizScoreBox').style.display = 'block';

    const pct = quizScore / QUIZ_QUESTIONS.length;
    let icon, msg;
    if (pct === 1)      { icon = '🥇'; msg = 'Incrível! Você acertou TUDO!!! 🎉'; unlockAchievement('perfectQuiz'); }
    else if (pct >= 0.75){ icon = '🥈'; msg = 'Muito bem! Quase perfeita! 💪'; }
    else if (pct >= 0.5) { icon = '🥉'; msg = 'Bom trabalho! Continue aprendendo! 🌻'; }
    else                 { icon = '📚'; msg = 'Que tal tentar de novo? Você consegue! 🌈'; }

    document.getElementById('quizScoreIcon').textContent = icon;
    document.getElementById('quizScoreMsg').textContent  = msg;
    document.getElementById('quizFinalScore').textContent = quizScore;

    if (pct >= 0.75) launchRichConfetti();
}

// ============================================================
//  BOLO INTERATIVO
// ============================================================
const CANDLE_COLORS = ['#f44336','#ff9800','#ffd600','#4caf50','#2196f3','#9c27b0','#e91e63'];
const WISH_MESSAGES = [
    '🌟 Que todos os seus sonhos se realizem, Laura!',
    '🦄 Que você seja feliz todos os dias da sua vida!',
    '🌸 Que seus 7 anos sejam os mais mágicos da vida!',
    '🎀 Que você continue sendo essa criança incrível!',
    '💫 Que sua fazendinha de sonhos se realize um dia!',
    '🌈 Que a vida seja cheia de cores e alegrias para você!',
    '🐄 Que cada dia seja uma nova aventura na fazendinha!',
    '🎂 Parabéns, Princess Laura! A fazenda é sua! 👑',
];

let candlesOut = 0;
let cakeTotalCandles = 7;

function openCake() {
    openModal('cakeModal');
    initCake();
    candlesOut = 0;
    document.getElementById('cakeMsgBox').style.display = 'none';
    updateCandlesLeftText();
}

function initCake() {
    candlesOut = 0;
    const row = document.getElementById('cakeCandlesRow');
    row.innerHTML = '';

    for (let i = 0; i < cakeTotalCandles; i++) {
        const color = CANDLE_COLORS[i % CANDLE_COLORS.length];
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.id = `candle${i}`;
        candle.innerHTML = `
            <div class="candle-flame" id="flame${i}"></div>
            <div class="candle-body" style="background:linear-gradient(180deg,${color}dd,${color}88);border:1px solid ${color}">
                <div class="candle-drip" style="background:${color}"></div>
            </div>
        `;
        candle.addEventListener('click', () => blowCandle(i));
        row.appendChild(candle);
    }
    document.getElementById('cakeMsgBox').style.display = 'none';
    updateCandlesLeftText();
}

function blowCandle(idx) {
    const flame = document.getElementById('flame' + idx);
    if (!flame || flame.classList.contains('out')) return;

    flame.classList.add('out');
    candlesOut++;
    updateCandlesLeftText();

    // Som de apagar vela (ruído rápido)
    const ctx = ensureAudio();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / buf.length);
    const src = ctx.createBufferSource();
    const gn  = ctx.createGain();
    src.buffer = buf;
    gn.gain.value = 0.08;
    src.connect(gn);
    gn.connect(ctx.destination);
    src.start();

    showToast('💨 Pfffff! Vela apagada!');

    if (candlesOut === cakeTotalCandles) {
        setTimeout(() => {
            const wish = WISH_MESSAGES[Math.floor(Math.random() * WISH_MESSAGES.length)];
            const msgBox  = document.getElementById('cakeMsgBox');
            const msgText = document.getElementById('cakeMsgText');
            msgText.innerHTML = `<div style="font-size:1.8rem;margin-bottom:8px">🎂✨🎉</div>${wish}`;
            msgBox.style.display = 'block';
            launchRichConfetti();
            playMelody(HBD_MELODY);
            showToast('🎉 Parabéns Laura! Faça um pedido!');
            unlockAchievement('blowCandles');
        }, 400);
    }
}

function updateCandlesLeftText() {
    const left = cakeTotalCandles - candlesOut;
    const el = document.getElementById('cakeCandlesLeft');
    if (!el) return;
    if (left === 0) {
        el.textContent = '🎂 Todas as velas apagadas! Parabéns!';
        el.style.color = '#ffd600';
    } else {
        el.textContent = `🕯 ${left} vela${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}`;
        el.style.color = '';
    }
}

// ============================================================
//  LIVRO DE VISITAS — com Supabase + localStorage fallback
// ============================================================
const STORAGE_KEY_GUESTS = 'fazendaGuests_v2';
const SUPABASE_TABLE      = 'fazenda_visitas';   // tabela no Supabase
const GUEST_AVATARS = ['🐄','🐖','🐑','🐓','🌻','🦋','🌸','⭐','🎀','🦄','🌈','🎂','🎈','🌾'];

// ---- Abrir modal e carregar mensagens ----
async function openGuestBook() {
    openModal('guestModal');
    await renderGuestMessages();
}

// ---- Picker de emoji no textarea ----
function addGuestEmoji(emoji) {
    const ta = document.getElementById('guestMsg');
    if (!ta) return;
    const pos = ta.selectionStart ?? ta.value.length;
    ta.value = ta.value.slice(0, pos) + emoji + ta.value.slice(pos);
    ta.focus();
    try { ta.setSelectionRange(pos + emoji.length, pos + emoji.length); } catch {}
}

// ---- Submeter mensagem (Supabase + localStorage) ----
async function submitGuestMsg() {
    const nameEl = document.getElementById('guestName');
    const msgEl  = document.getElementById('guestMsg');
    const name   = nameEl.value.trim();
    const msg    = msgEl.value.trim();

    if (!name) { showToast('✏️ Escreva seu nome primeiro!'); nameEl.focus(); return; }
    if (!msg)  { showToast('✏️ Escreva uma mensagem!');     msgEl.focus(); return; }

    const avatar  = GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)];
    const now     = new Date();
    const timeStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });

    const entry = { name, msg, message: msg, avatar, time: timeStr, id: Date.now() };

    // 1️⃣ Salva localmente imediato (UX fast)
    const localGuests = loadGuestsLocal();
    localGuests.unshift(entry);
    saveGuestsLocal(localGuests);

    // 2️⃣ Tenta enviar ao Supabase em background
    saveGuestToSupabase(name, msg, avatar);

    nameEl.value = '';
    msgEl.value  = '';

    await renderGuestMessages();
    showToast(`💌 Mensagem de ${name} enviada! 🎉`);
    playTone(523, 'sine', 0,   0.1, 0.06);
    playTone(659, 'sine', 0.1, 0.1, 0.07);
    playTone(784, 'sine', 0.2, 0.15, 0.08);
    unlockAchievement('signBook');
}

// ---- Salvar no Supabase ----
async function saveGuestToSupabase(name, msg, avatar) {
    try {
        if (!window._supabase) return;
        const { error } = await _supabase
            .from(SUPABASE_TABLE)
            .insert([{ name, message: msg, avatar }]);
        if (error) console.warn('[GuestBook Supabase insert]', error.message);
    } catch (e) {
        console.warn('[GuestBook Supabase]', e.message);
    }
}

// ---- Carregar do Supabase ----
async function loadGuestsFromSupabase() {
    try {
        if (!window._supabase) return null;
        const { data, error } = await _supabase
            .from(SUPABASE_TABLE)
            .select('id, name, message, avatar, created_at')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) { console.warn('[GuestBook Supabase load]', error.message); return null; }
        return (data || []).map(row => ({
            name:   row.name,
            msg:    row.message,
            avatar: row.avatar || '🌸',
            time:   new Date(row.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }),
            id: row.id,
        }));
    } catch (e) {
        console.warn('[GuestBook Supabase]', e.message);
        return null;
    }
}

// ---- localStorage helpers ----
function loadGuestsLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_GUESTS) || '[]'); }
    catch { return []; }
}
function saveGuestsLocal(guests) {
    localStorage.setItem(STORAGE_KEY_GUESTS, JSON.stringify(guests.slice(0, 50)));
}

// ---- Renderizar mensagens (Supabase → fallback local) ----
async function renderGuestMessages() {
    const list = document.getElementById('guestMsgsList');
    if (!list) return;

    // Skeleton loader enquanto busca
    list.innerHTML = `
        <div class="guest-loading">
            <div class="guest-skeleton"></div>
            <div class="guest-skeleton" style="width:80%"></div>
            <div class="guest-skeleton" style="width:60%"></div>
        </div>`;

    // Tenta Supabase primeiro
    let guests = await loadGuestsFromSupabase();

    // Fallback: localStorage
    if (!guests || guests.length === 0) {
        guests = loadGuestsLocal();
    } else {
        // Mescla mensagens locais que ainda não foram para o Supabase
        // (enviadas recentemente, identificadas pelo timestamp local)
        saveGuestsLocal(guests); // Sincroniza local com Supabase
    }

    if (!guests.length) {
        list.innerHTML = '<div class="guest-empty-msg">🌸 Seja o primeiro a deixar uma mensagem para a Laura! 🌸</div>';
        return;
    }

    list.innerHTML = guests.map(g => `
        <div class="guest-msg-card">
            <div class="guest-msg-avatar">${g.avatar || '🌸'}</div>
            <div class="guest-msg-body">
                <div class="guest-msg-name">${escapeHtml(g.name)}</div>
                <div class="guest-msg-text">${escapeHtml(g.msg || g.message || '')}</div>
                <div class="guest-msg-time">${g.time || ''}</div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
//  HELPERS DE MODAL
// ============================================================
function openModal(id) {
    // Fechar todos os outros modais primeiro
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
        if (m.id !== id) closeModal(m.id);
    });
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    playTone(480, 'sine', 0, 0.12, 0.05);
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    // Só restaurar scroll se não houver mais modais abertos
    if (!document.querySelector('.modal-overlay.open')) {
        document.body.style.overflow = '';
    }
}

function checkModalClose(event, id) {
    // Fechar ao clicar no overlay (fora do .modal-box)
    if (event.target === event.currentTarget) closeModal(id);
}

// Fechar modais com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
});

// ============================================================
//  PIX ACHIEVEMENT HOOK
// ============================================================
const _origCopyPix = window.copyPix;
window.copyPix = function() {
    if (_origCopyPix) _origCopyPix.call(this);
    unlockAchievement('pixCopied');
};

// ============================================================
//  NIGHT MODE ACHIEVEMENT
// ============================================================
(function hookNightMode() {
    // Monitora a classe da cena para detectar modo noite já implementado
    const observer = new MutationObserver((muts) => {
        muts.forEach(m => {
            if (m.target.classList && m.target.classList.contains('night')) {
                unlockAchievement('nightMode');
            }
        });
    });
    const scene = document.querySelector('.scene');
    if (scene) observer.observe(scene, { attributes: true, attributeFilter: ['class'] });
})();

// ============================================================
//  PARABÉNS VIA BOTÃO DO PIANO → ACHIEVEMENT
// ============================================================
const _playHBDBtn = document.getElementById('playHBD');
if (_playHBDBtn) {
    _playHBDBtn.addEventListener('click', () => unlockAchievement('playPiano'), { once: true });
}
