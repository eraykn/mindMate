document.addEventListener('DOMContentLoaded', function() {
    // İlk yükleme kontrolü
    if (!sessionStorage.getItem('mindmate_visited')) {
        document.body.classList.add('first-load');
        sessionStorage.setItem('mindmate_visited', 'true');
    }
    
    // Top sidebar menü işlevselliği
    const menuLinks = document.querySelectorAll('.sidebar-menu a:not(.external-link), .logo-link');
    const sections = document.querySelectorAll('section');
    
    // İlk bölüm dışındaki tüm bölümleri gizli olarak işaretle
    sections.forEach(section => {
        if (!section.classList.contains('active-section')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.display = 'none';
        }
    });

    // Harici bağlantılar için ayrı event listener
    document.querySelectorAll('.external-link').forEach(link => {
        link.addEventListener('click', function() {
            // Harici bağlantılar için varsayılan davranışı koru
            return true;
        });
    });
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aktif menü öğesini güncelle
            const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
            sidebarLinks.forEach(menuLink => menuLink.classList.remove('active'));
            
            // Eğer tıklanan logo-link ise, Ana Sayfa menüsünü aktif yap
            if (this.classList.contains('logo-link')) {
                document.querySelector('.sidebar-menu a[href="#anasayfa"]').classList.add('active');
            } else {
                this.classList.add('active');
            }
            
            // Hedef bölümü al
            const target = this.getAttribute('href');
            const targetSection = document.querySelector(target);
            
            // Aktif bölümü bul
            const activeSection = document.querySelector('section.active-section');
            
            // Eğer aynı bölüme tıklandıysa hiçbir şey yapma
            if (activeSection === targetSection) return;
            
            // Menü geçiş efekti
            animateMenuTransition(this);
            
            // Aktif bölümü kapat
            if (activeSection) {
                // Aktif bölümü hafifçe yukarı kaydır ve saydam yap
                activeSection.style.opacity = '0';
                activeSection.style.transform = 'translateY(-20px)';
                
                // Geçiş tamamlandıktan sonra bölümü gizle ve aktif sınıfını kaldır
                setTimeout(() => {
                    activeSection.style.display = 'none';
                    activeSection.classList.remove('active-section');
                    
                    // Hedef bölümü göster
                    showTargetSection(targetSection);
                }, 400); // 400ms sonra (CSS geçiş süresi)
            } else {
                // Aktif bölüm yoksa hedef bölümü direkt göster
                showTargetSection(targetSection);
            }
        });
    });
    
    // Menü geçiş animasyonu
    function animateMenuTransition(menuItem) {
        const menuItemRect = menuItem.getBoundingClientRect();
        const x = menuItemRect.left + menuItemRect.width / 2;
        const y = menuItemRect.top + menuItemRect.height / 2;
        
        // Dalga efekti için
        const ripple = document.createElement('span');
        ripple.classList.add('menu-ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Hedef bölümü gösterme fonksiyonu
    function showTargetSection(targetSection) {
        if (!targetSection) return;
        
        // Önce bölümü görünür yap ama saydam olarak
        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');
        
        // Redraw/reflow zorla
        targetSection.offsetHeight;
        
        // Aşağıdan yukarı doğru hafif bir kayma ile bölümü göster
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
        
        // Scroll efektlerinin tekrar kontrol edilmesini sağla
        handleScrollAnimation();
    }
    
    // Scroll Down Göstergesi İşlevselliği
    const scrollDownIndicator = document.querySelector('.scroll-down-indicator');
    if (scrollDownIndicator) {
        scrollDownIndicator.addEventListener('click', function() {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // CTA Butonları İşlevselliği
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('href');
            const targetSection = document.querySelector(target);
            const activeSection = document.querySelector('section.active-section');
            
            // Önce menüyü güncelle
            const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
            sidebarLinks.forEach(menuLink => {
                menuLink.classList.remove('active');
                if (menuLink.getAttribute('href') === target) {
                    menuLink.classList.add('active');
                    animateMenuTransition(menuLink);
                }
            });
            
            // Aynı geçiş efektini uygula
            if (activeSection === targetSection) return;
            
            if (activeSection) {
                activeSection.style.opacity = '0';
                activeSection.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    activeSection.style.display = 'none';
                    activeSection.classList.remove('active-section');
                    
                    showTargetSection(targetSection);
                }, 400);
            } else {
                showTargetSection(targetSection);
            }
        });
    });
    
    // Scroll efektleri için yeni fonksiyonlar
    const scrollElements = document.querySelectorAll('.scroll-element');
    
    // Bir element görünür mü kontrolü
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Element ekranda kısmen görünür olduğunda true döndür
        const vertInView = (rect.top <= windowHeight * 0.8 && rect.bottom >= windowHeight * 0.2);
        const horInView = (rect.left <= windowWidth && rect.right >= 0);
        
        return (vertInView && horInView);
    }
    
    // Scroll olayında tüm elementleri kontrol et
    function handleScrollAnimation() {
        scrollElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('active');
            }
        });
    }
    
    // Scroll olayını dinle
    window.addEventListener('scroll', handleScrollAnimation);
    
    // Sayfa yüklendiğinde görünür tüm elementleri aktifleştir
    function activateInitialElements() {
        scrollElements.forEach(element => {
            if (isElementInViewport(element)) {
                setTimeout(() => {
                    element.classList.add('active');
                }, 300); // Küçük bir gecikme ekleyelim
            }
        });
    }
    
    // Sayfa ilk yüklendiğinde animasyonları başlat
    window.addEventListener('load', activateInitialElements);
    
    // Sayfa tamamen yüklendikten sonra bir kez daha kontrol et
    setTimeout(activateInitialElements, 1000);
    
    // Sayfayı yeniden boyutlandırma olayında da kontrol et
    window.addEventListener('resize', handleScrollAnimation);
    
    // Varsayılan olarak Ana Sayfa menü öğesini ve bölümünü etkinleştir
    if(menuLinks.length > 0 && sections.length > 0) {
        setTimeout(() => {
            document.querySelector('.sidebar-menu a[href="#anasayfa"]').classList.add('active');
            sections[0].classList.add('active-section');
            sections[0].style.opacity = '1';
            sections[0].style.transform = 'translateY(0)';
            sections[0].style.display = 'block';
        }, 1200); // En son menü animasyonu tamamlanana kadar bekleyin
    }
});