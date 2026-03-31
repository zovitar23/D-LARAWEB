function showStats() {
    const statsSection = document.getElementById('stats');
    const dayCounter = document.getElementById('dayCount');
    const btn = document.getElementById('keşfetBtn');
    const hero = document.querySelector('.hero');
    const header = document.querySelector('.top-nav');

    if (hero) hero.style.display = 'none';
    if (header) header.style.display = 'none';

    statsSection.classList.remove('hidden');
    countTo(dayCounter, +dayCounter.getAttribute('data-target'));
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