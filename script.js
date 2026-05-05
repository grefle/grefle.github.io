const CLOUD_NAME = 'grefle';

// Функція анімації появи елементів
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return observer;
}

// Завантаження фото
async function loadGallery(tag, containerId, observer) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`);
        const data = await response.json();
        
        container.innerHTML = '';

        data.resources.forEach(resource => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // Оптимізоване посилання (ширина 800px)
            const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,w_800,f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            
            div.innerHTML = `<img src="${url}" loading="lazy">`;
            
            // Відкриття оригіналу в новій вкладці
            div.onclick = () => window.open(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`, '_blank');

            container.appendChild(div);
            observer.observe(div);
        });
    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

// Зміна теми
function setupTheme() {
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    btn.onclick = () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    const observer = initScrollReveal();
    loadGallery('photos', 'photos-grid', observer);
    loadGallery('artworks', 'drawings-grid', observer);
});
