const CLOUD_NAME = 'grefle';

const translations = {
    ua: {
        nav_about: "Про мене", nav_photos: "Фотографії", nav_drawings: "Малюнки",
        badge: "Visual Artist", hero_greet: "Привіт, я",
        hero_desc: "Досліджую світ крізь об'єктив та цифрові полотна в пошуках сенсу",
        footer: "© 2026 Grefle. Створено з акцентом на візуальну чистоту."
    },
    en: {
        nav_about: "About", nav_photos: "Photography", nav_drawings: "Artworks",
        badge: "Visual Artist", hero_greet: "Hi, I'm",
        hero_desc: "Exploring the world through lenses and digital canvases in search of meaning",
        footer: "© 2026 Grefle. Focused on visual purity."
    }
};

/** Мова **/
function initLanguage() {
    const btn = document.querySelector('#lang-toggle');
    let lang = localStorage.getItem('language') || 'ua';
    const update = (l) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[l][key]) el.innerText = translations[l][key];
        });
        btn.innerText = l === 'ua' ? 'EN' : 'UA';
        localStorage.setItem('language', l);
    };
    update(lang);
    btn.onclick = () => { lang = lang === 'ua' ? 'en' : 'ua'; update(lang); };
}

/** Lightbox з індикатором завантаження **/
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
const lightboxImg = document.createElement('img');
const loader = document.createElement('div');
loader.className = 'loader';
lightbox.append(lightboxImg, loader);
document.body.appendChild(lightbox);

lightbox.onclick = () => {
    lightbox.classList.remove('show');
    setTimeout(() => lightbox.style.display = 'none', 400);
};

/** Галерея **/
async function loadGallery(tag, containerId, observer) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`);
        const data = await response.json();
        
        container.innerHTML = '';
        data.resources.forEach(res => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // Прев'ю (швидке завантаження)
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_800,h_800,g_auto,f_auto,q_auto/v${res.version}/${res.public_id}.${res.format}`;
            // Оригінал (висока якість)
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto:good/v${res.version}/${res.public_id}.${res.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.onload = () => img.classList.add('loaded');

            img.onclick = (e) => {
                e.stopPropagation();
                lightbox.style.display = 'flex';
                lightbox.classList.add('loading');
                lightboxImg.style.opacity = '0';
                
                lightboxImg.src = fullUrl;
                lightboxImg.onload = () => {
                    lightbox.classList.remove('loading');
                    lightboxImg.style.opacity = '1';
                    lightbox.classList.add('show');
                };
            };

            div.appendChild(img);
            container.appendChild(div);
            observer.observe(div);
        });
    } catch (e) {
        container.innerHTML = '<p style="opacity:0.5; grid-column:1/-1; text-align:center;">Помилка Cloudinary: Resource List</p>';
    }
}

/** Анімація Scroll **/
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

/** Тема **/
function initTheme() {
    const btn = document.querySelector('#theme-toggle');
    const html = document.documentElement;
    const apply = (t) => {
        html.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        btn.innerHTML = t === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };
    apply(localStorage.getItem('theme') || 'light');
    btn.onclick = () => apply(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    const observer = initScrollReveal();
    loadGallery('photos', 'photos-grid', observer);
    loadGallery('artworks', 'drawings-grid', observer);
});
