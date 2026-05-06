const CLOUD_NAME = 'grefle';

const translations = {
    ua: {
        nav_about: "Про мене",
        nav_photos: "Фотографії",
        nav_drawings: "Малюнки",
        badge: "Visual Artist",
        hero_greet: "Привіт, я",
        hero_desc: "Досліджую світ крізь об'єктив та цифрові полотна в пошуках сенсу",
        footer: "© 2026 Grefle. Створено з акцентом на візуальну чистоту."
    },
    en: {
        nav_about: "About",
        nav_photos: "Photography",
        nav_drawings: "Artworks",
        badge: "Visual Artist",
        hero_greet: "Hi, I'm",
        hero_desc: "Exploring the world through lenses and digital canvases in search of meaning",
        footer: "© 2026 Grefle. Focused on visual purity."
    }
};

/** Мова **/
function initLanguage() {
    const langBtn = document.querySelector('#lang-toggle');
    let currentLang = localStorage.getItem('language') || 'ua';

    const updateText = (lang) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) el.innerText = translations[lang][key];
        });
        langBtn.innerText = lang === 'ua' ? 'EN' : 'UA';
        localStorage.setItem('language', lang);
    };

    updateText(currentLang);
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ua' ? 'en' : 'ua';
        updateText(currentLang);
    });
}

/** Анімація появи **/
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

/** Lightbox **/
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
const lightboxImg = document.createElement('img');
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

lightbox.addEventListener('click', () => {
    lightbox.classList.remove('show');
    setTimeout(() => lightbox.style.display = 'none', 400);
});

/** Галерея (З КОРЕКЦІЄЮ ЯКОСТІ) **/
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
            
            // ПРЕВ'Ю: 800px для чіткості в сітці
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_800,h_800,g_auto,f_auto,q_auto:good/v${res.version}/${res.public_id}.${res.format}`;
            
            // ПОВНЕ ФОТО: Максимальна якість для Lightbox
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto:best/v${res.version}/${res.public_id}.${res.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.loading = "lazy";
            img.alt = "Grefle Art";
            
            img.onclick = () => {
                lightboxImg.src = fullUrl; // Завантажуємо якісну версію
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
            };

            div.appendChild(img);
            container.appendChild(div);
            observer.observe(div);
        });
    } catch (e) {
        container.innerHTML = '<p style="opacity:0.5; grid-column:1/-1; text-align:center;">Enable Resource List in Cloudinary Settings</p>';
    }
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
    
    // Плавний ефект нави при скролі
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.padding = '0.9rem 8%';
            nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
        } else {
            nav.style.padding = '1.2rem 8%';
            nav.style.boxShadow = 'none';
        }
    });
});
