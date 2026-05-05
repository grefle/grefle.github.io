const CLOUD_NAME = 'grefle'; 
let scrollObserver;

/**
 * Анімація IntersectionObserver
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

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
        setTimeout(() => lightbox.style.display = 'none', 400);
    });
    return { lightbox, lightboxImg: img };
}

const { lightbox, lightboxImg } = createLightbox();

/**
 * Завантаження галереї Cloudinary
 */
async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Cloudinary access error');
        const data = await response.json();
        
        container.innerHTML = '';

        data.resources.forEach((resource) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // Прев'ю (квадратне стискання для сітки)
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_700,h_700,g_auto,f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            // Повне фото для лайтбоксу
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.alt = "Grefle Art Content";
            img.loading = "lazy";
            
            img.addEventListener('click', () => {
                lightboxImg.src = fullUrl;
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
            });

            div.appendChild(img);
            container.appendChild(div);
            scrollObserver.observe(div);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; opacity:0.5;">Налаштуйте "Resource List" у Cloudinary Settings -> Security</p>';
    }
}

/**
 * Логіка тем
 */
function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    const html = document.documentElement;
    const icon = toggleBtn.querySelector('i');
    
    const applyTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);

    toggleBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'light' ? 'dark' : 'light');
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    scrollObserver = initScrollReveal();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
    
    // Ефект прозорості навігації при скролі
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });
});
