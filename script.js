const CLOUD_NAME = 'grefle';
let scrollObserver;

/**
 * 1. ЛОГІКА КУРСОРУ
 */
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 15 + 'px';
    cursor.style.top = e.clientY - 15 + 'px';
});

// Ефект при наведенні на посилання
document.querySelectorAll('a, button, .item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(2)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

/**
 * 2. ПРИВІТАННЯ ЗА ЧАСОМ ДОБИ
 */
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting');
    if (hour < 6) greetingEl.innerText = "Доброї ночі";
    else if (hour < 12) greetingEl.innerText = "Доброго ранку";
    else if (hour < 18) greetingEl.innerText = "Доброго дня";
    else greetingEl.innerText = "Доброго вечора";
}

/**
 * 3. ОСНОВНІ ФУНКЦІЇ (Оптимізовані)
 */
async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`);
        const data = await response.json();
        container.innerHTML = '';

        data.resources.forEach((resource, index) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,g_auto,w_700,h_700,f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            
            div.innerHTML = `<img src="${previewUrl}" loading="lazy" alt="Art">`;
            
            // Клік для Lightbox
            div.addEventListener('click', () => {
                const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
                window.open(fullUrl, '_blank'); // Тимчасовий варіант або ваш Lightbox
            });

            container.appendChild(div);
            scrollObserver.observe(div);
        });
    } catch (err) { console.error(err); }
}

function initScrollReveal() {
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.style.opacity = "1";
            }
        });
    }, { threshold: 0.1 });
}

document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    scrollObserver = initScrollReveal();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
    
    // Перемикач теми
    document.getElementById('theme-toggle').onclick = () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
});
