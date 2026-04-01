const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('loveOverlay');

const lovePhrases = [
    'I love you',
    'Seni seviyorum',
    'Je t’aime',
    'Ich liebe dich',
    'Te amo',
    'Ti amo',
    'Я тебя люблю',
    'أحبك',
    '愛してる',
    '사랑해',
    'Eu te amo',
    'Ik hou van jou',
    'Σε αγαπώ',
    'Kocham cię',
    'אני אוהב אותך',
];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let animationStart = performance.now();

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawTunnel(now) {
    const elapsed = (now - animationStart) / 1000;
    const introBoost = Math.max(0, 1 - elapsed / 20);
    const travelSpeed = 0.42 + introBoost * 0.45;

    ctx.clearRect(0, 0, width, height);

    const background = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.62);
    background.addColorStop(0, 'rgba(113, 48, 245, 0.26)');
    background.addColorStop(0.38, 'rgba(43, 7, 102, 0.16)');
    background.addColorStop(1, 'rgba(4, 1, 13, 0)');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 160; i += 1) {
        const depthSeed = ((i / 160) + elapsed * travelSpeed) % 1;
        const depth = 1 - depthSeed;
        const perspective = Math.pow(depth, 1.75);
        const radius = 28 + perspective * Math.min(width, height) * 0.56;
        const angle = elapsed * 0.72 + i * 0.18 + depth * 16;
        const swirl = 1 + Math.sin(elapsed * 0.55 + i * 0.4) * 0.16;
        const x = centerX + Math.cos(angle) * radius * swirl;
        const y = centerY + Math.sin(angle) * radius * 0.78 * swirl;
        const size = 0.8 + perspective * 5.6;
        const alpha = 0.08 + perspective * 0.62;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, ${180 + Math.floor(perspective * 55)}, 247, ${alpha})`;
        ctx.shadowBlur = 24 + perspective * 26;
        ctx.shadowColor = `rgba(182, 118, 255, ${alpha})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.shadowBlur = 0;

    for (let ring = 0; ring < 24; ring += 1) {
        const z = ((ring / 24) + elapsed * travelSpeed * 0.22) % 1;
        const depth = 1 - z;
        const perspective = Math.pow(depth, 2.15);
        const radius = perspective * Math.min(width, height) * 0.52;
        const rotation = elapsed * 0.36 + ring * 0.23;
        const alpha = 0.04 + perspective * 0.14;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 196, 245, ${alpha})`;
        ctx.lineWidth = 1.1 + perspective * 1.8;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(156, 96, 255, ${alpha})`;
        ctx.ellipse(0, 0, radius, radius * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    requestAnimationFrame(drawTunnel);
}

function spawnLoveWord() {
    const word = document.createElement('span');
    const fromLeft = Math.random() > 0.5;
    const phrase = lovePhrases[Math.floor(Math.random() * lovePhrases.length)];
    const top = 10 + Math.random() * 76;
    const duration = 4200 + Math.random() * 2800;
    const driftY = (Math.random() - 0.5) * 90;
    const scale = 0.9 + Math.random() * 0.9;

    word.className = 'love-word';
    word.textContent = phrase;
    word.style.top = `${top}%`;
    word.style.fontSize = `${1.1 + Math.random() * 1.5}rem`;
    word.style.transform = `translate3d(${fromLeft ? '-18vw' : '118vw'}, 0, 0) scale(${scale})`;
    overlay.appendChild(word);

    const animation = word.animate(
        [
            { opacity: 0, transform: `translate3d(${fromLeft ? '-18vw' : '118vw'}, 0, 0) scale(${scale})` },
            { opacity: 1, offset: 0.2, transform: `translate3d(${fromLeft ? '10vw' : '72vw'}, ${driftY * 0.35}px, 0) scale(${scale + 0.05})` },
            { opacity: 1, offset: 0.7, transform: `translate3d(${fromLeft ? '62vw' : '18vw'}, ${driftY}px, 0) scale(${scale})` },
            { opacity: 0, transform: `translate3d(${fromLeft ? '112vw' : '-20vw'}, ${driftY * 1.15}px, 0) scale(${scale - 0.05})` },
        ],
        { duration, easing: 'ease-in-out' }
    );

    animation.onfinish = () => word.remove();
}

function startLoveWords() {
    for (let i = 0; i < 8; i += 1) {
        setTimeout(spawnLoveWord, i * 260);
    }

    setInterval(spawnLoveWord, 1100);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawTunnel);
startLoveWords();
