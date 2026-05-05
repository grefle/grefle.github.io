const CLOUD_NAME = 'grefle'; // Твій Cloud Name

let scrollObserver;

/**
 * Оптимізована анімація появи
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Зупиняємо стеження після появи
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return observer;
}

/**
 * Lightbox
 */
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    const img = document.createElement('img');
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.style.display = 'none', 300);
    });
    return { lightbox, lightboxImg: img };
}

const { lightbox, lightboxImg } = createLightbox();

/**
 * Завантаження галереї з оптимізацією Cloudinary
 */
async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Помилка доступу');
        
        const data = await response.json();
        container.innerHTML = '';

        data.resources.forEach((resource, index) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // ОПТИМІЗАЦІЯ: c_scale,w_800 стискає фото до 800px по ширині
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,w_800,f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.loading = "lazy";
            
            img.addEventListener('click', () => {
                lightboxImg.src = fullUrl;
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
            });

            div.appendChild(img);
            container.appendChild(div);
            if(scrollObserver) scrollObserver.observe(div);
        });
    } catch (err) {
        container.innerHTML = '<p style="opacity:0.5; text-align:center;">Увімкніть Resource List у Cloudinary</p>';
    }
}

/**
 * Тема
 */
function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    html.setAttribute('data-theme', savedTheme);

    toggleBtn?.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    scrollObserver = initScrollReveal();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
