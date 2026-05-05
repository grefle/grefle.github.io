const CLOUD_NAME = 'grefle';

let scrollObserver;

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

async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Restricted');
        
        const data = await response.json();
        container.innerHTML = '';

        data.resources.forEach((resource, index) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // Стискання до 800px для швидкості
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
        container.innerHTML = '<p style="padding:20px; opacity:0.5;">Налаштуйте теги та Security у Cloudinary</p>';
    }
}

function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    const icon = toggleBtn.querySelector('i');
    const html = document.documentElement;
    
    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Зміна іконки
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    toggleBtn?.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(next);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    scrollObserver = initScrollReveal();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
