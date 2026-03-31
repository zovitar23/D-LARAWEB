function showStats() {
    const statsSection = document.getElementById('stats');
    const dayCounter = document.getElementById('dayCount');
    const dayCountVisible = document.getElementById('dayCountVisible');
    const btn = document.getElementById('keşfetBtn');
    const hero = document.querySelector('#startSection');

    if (hero) hero.style.display = 'none';

    statsSection.classList.remove('hidden');
    countTo(dayCountVisible, +dayCountVisible.getAttribute('data-target'));
    btn.setAttribute('disabled', 'true');
    btn.innerText = 'Kaydedildi';
}
function countTo(element, target) {
    const duration = 1200;
    const frameTime = 20;
    let current = 0;
    const increment = Math.ceil(target / (duration / frameTime));

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.innerText = target;
            clearInterval(timer);
            element.classList.add('animated');
        } else {
            element.innerText = current;
        }
    }, frameTime);
}
function countTo(element, target) {
    const duration = 1200;
    const frameTime = 20;
    let current = 0;
    const increment = Math.ceil(target / (duration / frameTime));

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.innerText = target;
            clearInterval(timer);
            element.classList.add('animated');
        } else {
            element.innerText = current;
        }
    }, frameTime);
}