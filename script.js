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

/** Інтерактивність: 3D Tilt та Паралакс **/
function initInteractivity() {
    // Паралакс фонових блобів
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        
        document.querySelectorAll('.blob').forEach((blob, index) => {
            const speed = (index + 1) * 30;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // 3D ефект для карток (тільки для десктопів)
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            document.querySelectorAll('.item').forEach(item => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
                    const dx = (x - rect.width / 2) / 10;
                    const dy = (y - rect.height / 2) / 10;
                    item.style.transform = `perspective(1000px) rotateX(${-dy}deg) rotateY(${dx}deg) translateY(-10px)`;
                } else {
                    item.style.transform = '';
                }
            });
        });
    }
}

/** Мобільне меню **/
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });
}

/** Тема та Мова **/
function initCore() {
    // Тема
    const themeBtn = document.querySelector('#theme-toggle');
    const applyTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        themeBtn.innerHTML = t === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };
    applyTheme(localStorage.getItem('theme') || 'light');
    themeBtn.onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');

    // Мова
    const langBtn = document.querySelector('#lang-toggle');
    const updateLang = (lang) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) el.innerText = translations[lang][key];
        });
        langBtn.innerText = lang === 'ua' ? 'EN' : 'UA';
        localStorage.setItem('language', lang);
    };
    updateLang(localStorage.getItem('language') || 'ua');
    langBtn.onclick = () => updateLang(localStorage.getItem('language') === 'ua' ? 'en' : 'ua');
}

/** Галерея **/
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
const lightboxImg = document.createElement('img');
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

lightbox.onclick = () => {
    lightbox.classList.remove('show');
    setTimeout(() => lightbox.style.display = 'none', 400);
};

async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`);
        const data = await response.json();
        
        container.innerHTML = '';
        data.resources.forEach(res => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_700,h_700,g_auto,f_auto,q_auto/v${res.version}/${res.public_id}.${res.format}`;
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${res.version}/${res.public_id}.${res.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.loading = "lazy";
            img.onclick = (e) => {
                e.stopPropagation();
                lightboxImg.src = fullUrl;
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
            };

            div.appendChild(img);
            container.appendChild(div);
            observer.observe(div);
        });
    } catch (e) {
        container.innerHTML = '<p style="grid-column:1/-1; opacity:0.5">Перевірте налаштування Cloudinary (Resource List)</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCore();
    initMobileMenu();
    initInteractivity();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
