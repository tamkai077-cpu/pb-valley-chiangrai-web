/**
 * PB Valley Chiang Rai - Main JavaScript
 * Handles navigation, video player switching, and interactive video setup modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 2. Video Player Management
  const defaultVideoConfig = {
    section1: {
      type: 'placeholder',
      src: '',
      title: 'วิดีโอแนะนำบริษัท PB Valley เชียงราย'
    },
    section2: {
      type: 'placeholder',
      src: '',
      title: 'วิดีโอพาชมสวนโกโก้เชียงราย'
    },
    section3: {
      type: 'placeholder',
      src: '',
      title: 'วิดีโอกระบวนการแปรรูปโกโก้'
    }
  };

  let savedConfig = {};
  try {
    const raw = localStorage.getItem('pbvalley_video_config');
    if (raw) savedConfig = JSON.parse(raw);
  } catch (e) {
    console.warn('Cannot read localStorage', e);
  }

  const currentConfig = { ...defaultVideoConfig, ...savedConfig };

  function setupVideoSlot(sectionKey, wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    // ถ้าผู้ใช้ใส่แท็ก <iframe> หรือ <video> ใน VS Code โดยตรงแล้ว
    const existingIframe = wrapper.querySelector('iframe');
    if (existingIframe) {
      const rawSrc = existingIframe.getAttribute('src') || '';
      if (!rawSrc || rawSrc.includes('วางลิงก์')) {
        wrapper.innerHTML = `
          <div class="video-placeholder flex flex-col items-center justify-center p-6 text-center">
            <i class="fa-brands fa-youtube text-5xl text-red-500 mb-3 animate-pulse"></i>
            <h4 class="text-sm font-bold text-white mb-1">รอวางลิงก์ YouTube</h4>
            <p class="text-xs text-stone-300 max-w-sm">เปิดไฟล์ใน VS Code แล้ววางลิงก์ YouTube แทนคำว่า <strong>"วางลิงก์_YouTube_..."</strong> ได้ทันที</p>
          </div>
        `;
        return;
      }
      if (rawSrc.includes('watch?v=') || rawSrc.includes('youtu.be/') || rawSrc.includes('/shorts/')) {
        const vidId = extractYouTubeID(rawSrc);
        if (vidId) {
          existingIframe.src = `https://www.youtube-nocookie.com/embed/${vidId}?rel=0`;
          existingIframe.setAttribute('allowfullscreen', '');
          existingIframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        }
      }
      return;
    }
    if (wrapper.querySelector('video')) {
      return;
    }

    const config = currentConfig[sectionKey];
    const placeholder = wrapper.querySelector('.video-placeholder');
    const mediaContainer = wrapper.querySelector('.media-target');

    if (!config || !config.src || config.type === 'placeholder') {
      if (placeholder) placeholder.classList.remove('hidden');
      if (mediaContainer) mediaContainer.innerHTML = '';
      return;
    }

    if (placeholder) placeholder.classList.add('hidden');

    if (config.type === 'youtube') {
      const videoId = extractYouTubeID(config.src);
      const isFileProtocol = window.location.protocol === 'file:';
      const embedSrc = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`
        : config.src;

      const fileHint = isFileProtocol ? `
        <div class="mt-2 text-center">
          <p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-1.5 px-3 inline-block">
            <i class="fa-solid fa-circle-exclamation text-amber-600 mr-1"></i>
            หากขึ้น <strong>Error 153</strong>: ดับเบิลคลิกไฟล์ <strong>"เปิดเว็บ.bat"</strong> เพื่อเปิดผ่านระบบเซิร์ฟเวอร์จำลอง หรือ 
            ${videoId ? `<a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="underline font-bold text-amber-800 hover:text-amber-900">ดูบน YouTube ↗</a>` : ''}
          </p>
        </div>
      ` : '';

      mediaContainer.innerHTML = `
        <iframe 
          src="${embedSrc}" 
          title="${config.title || 'Video Player'}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin"
          class="w-full h-full object-cover"
          allowfullscreen>
        </iframe>
      `;

      // Update or insert fileHint under video-wrapper if on file:// protocol
      let hintEl = wrapper.parentElement.querySelector('.file-protocol-hint');
      if (isFileProtocol) {
        if (!hintEl) {
          hintEl = document.createElement('div');
          hintEl.className = 'file-protocol-hint';
          wrapper.insertAdjacentElement('afterend', hintEl);
        }
        hintEl.innerHTML = fileHint;
      } else if (hintEl) {
        hintEl.remove();
      }
    } else if (config.type === 'local') {
      mediaContainer.innerHTML = `
        <video controls autoplay playsinline class="w-full h-full object-cover">
          <source src="${config.src}" type="video/mp4">
          เบราว์เซอร์ของคุณไม่รองรับการเล่นแท็กวิดีโอ HTML5
        </video>
      `;
    }
  }

  setupVideoSlot('section1', 'video-player-1');
  setupVideoSlot('section2', 'video-player-2');
  setupVideoSlot('section3', 'video-player-3');

  function extractYouTubeID(url) {
    if (!url) return '';
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  // 3. Modal for Video Configuration / Guide
  const modal = document.getElementById('video-guide-modal');
  const openModalBtns = document.querySelectorAll('.open-video-guide-btn');
  const closeModalBtns = document.querySelectorAll('.close-video-modal-btn');
  const saveVideoSettingsBtn = document.getElementById('save-video-settings-btn');
  const resetVideoSettingsBtn = document.getElementById('reset-video-settings-btn');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input1 = document.getElementById('input-video-1');
      const input2 = document.getElementById('input-video-2');
      const input3 = document.getElementById('input-video-3');

      if (input1) input1.value = currentConfig.section1.src || '';
      if (input2) input2.value = currentConfig.section2.src || '';
      if (input3) input3.value = currentConfig.section3.src || '';

      if (modal) modal.classList.remove('hidden');
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  if (saveVideoSettingsBtn) {
    saveVideoSettingsBtn.addEventListener('click', () => {
      const input1 = document.getElementById('input-video-1')?.value.trim();
      const input2 = document.getElementById('input-video-2')?.value.trim();
      const input3 = document.getElementById('input-video-3')?.value.trim();

      function detectType(val) {
        if (!val) return 'placeholder';
        if (val.includes('youtube.com') || val.includes('youtu.be')) return 'youtube';
        return 'local';
      }

      currentConfig.section1 = {
        type: detectType(input1),
        src: input1 || '',
        title: 'วิดีโอแนะนำบริษัท PB Valley เชียงราย'
      };

      currentConfig.section2 = {
        type: detectType(input2),
        src: input2 || '',
        title: 'วิดีโอพาชมสวนโกโก้เชียงราย'
      };

      currentConfig.section3 = {
        type: detectType(input3),
        src: input3 || '',
        title: 'วิดีโอกระบวนการแปรรูปโกโก้'
      };

      localStorage.setItem('pbvalley_video_config', JSON.stringify(currentConfig));

      setupVideoSlot('section1', 'video-player-1');
      setupVideoSlot('section2', 'video-player-2');
      setupVideoSlot('section3', 'video-player-3');

      if (modal) modal.classList.add('hidden');
      showToast('บันทึกการตั้งค่าวิดีโอเรียบร้อยแล้ว!');
    });
  }

  if (resetVideoSettingsBtn) {
    resetVideoSettingsBtn.addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตคลิปวิดีโอทั้งหมดกลับเป็นสถานะรอใส่คลิปใช่หรือไม่?')) {
        localStorage.removeItem('pbvalley_video_config');
        Object.assign(currentConfig, defaultVideoConfig);
        setupVideoSlot('section1', 'video-player-1');
        setupVideoSlot('section2', 'video-player-2');
        setupVideoSlot('section3', 'video-player-3');
        if (modal) modal.classList.add('hidden');
        showToast('รีเซ็ตการตั้งค่าวิดีโอเรียบร้อยแล้ว');
      }
    });
  }

  function showToast(msg) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 bg-[#2E1B12] text-[#FAF7F2] border border-[#D4A373] px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-10 opacity-0';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
    }, 3200);
  }

  // 4. Section 2: Unified Media Slider (Video First + 8 Top View Photos)
  const farmSlides = document.querySelectorAll('.farm-slide');
  const farmDots = document.querySelectorAll('#farm-slider-dots button');
  const farmThumbs = document.querySelectorAll('.farm-thumb-btn');
  const farmSlideCounter = document.getElementById('farm-slide-counter');
  const farmPrevBtn = document.getElementById('farm-slider-prev');
  const farmNextBtn = document.getElementById('farm-slider-next');
  const farmCarouselFrame = document.querySelector('#farm-media-carousel .relative.overflow-hidden');

  if (farmSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = farmSlides.length;
    let autoSlideInterval = null;

    function goToSlide(index) {
      const prevSlide = currentSlide;
      currentSlide = (index + totalSlides) % totalSlides;

      // If leaving video slide, pause YouTube by postMessage or re-assigning src
      if (prevSlide === 0 && currentSlide !== 0) {
        const videoWrapper = document.getElementById('video-player-2');
        const iframe = videoWrapper ? videoWrapper.querySelector('iframe') : null;
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } catch (e) {}
        }
      }

      // Update slides visibility
      farmSlides.forEach((slide, i) => {
        if (i === currentSlide) {
          slide.classList.remove('opacity-0', 'pointer-events-none');
          slide.classList.add('opacity-100', 'z-10');
        } else {
          slide.classList.remove('opacity-100', 'z-10');
          slide.classList.add('opacity-0', 'pointer-events-none');
        }
      });

      // Update Counter
      if (farmSlideCounter) {
        const slide = farmSlides[currentSlide];
        const title = slide ? slide.getAttribute('data-title') || (currentSlide === 0 ? 'คลิปวิดีโอ' : `ภาพที่ ${currentSlide}`) : '';
        farmSlideCounter.textContent = `${currentSlide + 1} / ${totalSlides}: ${title}`;
      }

      // Update Dots (15 compact dots)
      farmDots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.className = 'w-4 h-1.5 rounded-full bg-white transition-all cursor-pointer';
        } else {
          dot.className = 'w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/70 transition-all cursor-pointer';
        }
      });

      // Update Thumbnails & Auto-scroll active into view
      farmThumbs.forEach((thumb, i) => {
        if (i === currentSlide) {
          thumb.className = 'farm-thumb-btn shrink-0 w-12 sm:w-14 aspect-[4/3] rounded-lg overflow-hidden border-2 border-forest-600 ring-2 ring-forest-600/30 transition-all cursor-pointer opacity-100 scale-105 ' + (i === 0 ? 'bg-cocoa-900 text-white flex flex-col items-center justify-center p-1' : '');
          try {
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (e) {}
        } else {
          thumb.className = 'farm-thumb-btn shrink-0 w-12 sm:w-14 aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent transition-all cursor-pointer opacity-60 hover:opacity-100 ' + (i === 0 ? 'bg-cocoa-900 text-white flex flex-col items-center justify-center p-1' : '');
        }
      });
    }

    if (farmPrevBtn) {
      farmPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlide - 1);
        resetAutoSlide();
      });
    }

    if (farmNextBtn) {
      farmNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlide + 1);
        resetAutoSlide();
      });
    }

    farmDots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(i);
        resetAutoSlide();
      });
    });

    farmThumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(i);
        resetAutoSlide();
      });
    });

    // Autoplay only when viewing photos (slides > 0)
    function startAutoSlide() {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(() => {
        // Only auto advance if user is already browsing photos
        if (currentSlide > 0) {
          goToSlide(currentSlide + 1);
        }
      }, 5000);
    }

    function resetAutoSlide() {
      startAutoSlide();
    }

    startAutoSlide();

    // Pause on hover
    if (farmCarouselFrame) {
      farmCarouselFrame.addEventListener('mouseenter', () => {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
      });
      farmCarouselFrame.addEventListener('mouseleave', () => {
        startAutoSlide();
      });

      // Touch swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;

      farmCarouselFrame.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      farmCarouselFrame.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            goToSlide(currentSlide + 1);
          } else {
            goToSlide(currentSlide - 1);
          }
          resetAutoSlide();
        }
      }, { passive: true });
    }
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 6. Real-time Open/Closed Shop Status (Daily 10:00 - 20:00) with i18n
  let currentLang = localStorage.getItem('pbvalley_lang') || 'th';

  function updateShopStatus() {
    const badge = document.getElementById('shop-status-badge');
    const dot = document.getElementById('shop-status-dot');
    const text = document.getElementById('shop-status-text');

    if (!badge || !dot || !text) return;

    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    // Calculate Asia/Bangkok time (UTC+7)
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(now);

      parts.forEach(p => {
        if (p.type === 'hour') hour = parseInt(p.value, 10);
        if (p.type === 'minute') minute = parseInt(p.value, 10);
      });
    } catch (e) {
      // Fallback to local time
    }

    const currentMinutes = hour * 60 + minute;
    const openMinutes = 10 * 60;   // 10:00 น.
    const closeMinutes = 20 * 60;  // 20:00 น.

    // Open from 10:00 up to 20:00 (closed before 10:00 and from 20:00 onwards)
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (isOpen) {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2 transition-all';
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0';
      text.textContent = (currentLang === 'en') ? 'Open Now • Daily' : 'เปิดให้บริการอยู่ • เปิดทุกวัน';
    } else {
      badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-2 transition-all';
      dot.className = 'w-2 h-2 rounded-full bg-rose-500 shrink-0';
      text.textContent = (currentLang === 'en') ? 'Closed Now • Daily' : 'ปิดให้บริการขณะนี้ • เปิดทุกวัน';
    }
  }

  function initShopStatus() {
    updateShopStatus();
    setInterval(updateShopStatus, 30000);
  }

  initShopStatus();

  // 7. Bilingual i18n System (TH / EN)
  function setLanguage(lang) {
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('pbvalley_lang', lang);

    const dict = window.TRANSLATIONS[lang];

    // Update document title
    if (dict['doc.title']) {
      document.title = dict['doc.title'];
    }

    // Update document language
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Update all elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      }
    });

    // Update switcher buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.className = 'lang-btn px-2.5 py-1 rounded-full text-xs font-bold transition-all text-white bg-gold-600 shadow-sm';
      } else {
        btn.className = 'lang-btn px-2.5 py-1 rounded-full text-xs font-semibold transition-all text-stone-400 hover:text-white';
      }
    });

    // Re-check shop status with new language
    updateShopStatus();

    // Re-render real-time farm weather with new language
    if (typeof renderWeatherUI === 'function') {
      renderWeatherUI();
    }
  }

  // Bind language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        setLanguage(targetLang);
      }
    });
  });

  // Initialize saved or default language
  if (currentLang && currentLang !== 'th') {
    setLanguage(currentLang);
  }

  // 8. Kasalong Showcase & Google Map Tabs
  function initKasalongShowcase() {
    const tabPhotos = document.getElementById('tab-kasalong-photos');
    const tabMap = document.getElementById('tab-kasalong-map');
    const viewPhotos = document.getElementById('kasalong-photos-view');
    const viewMap = document.getElementById('kasalong-map-view');
    const slides = document.querySelectorAll('.kasalong-slide');
    const thumbs = document.querySelectorAll('.kasalong-thumb-btn');
    const counter = document.getElementById('kasalong-slide-counter');
    const prevBtn = document.getElementById('kasalong-prev-btn');
    const nextBtn = document.getElementById('kasalong-next-btn');

    if (!tabPhotos || !tabMap || !viewPhotos || !viewMap) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideTimer = null;

    function switchTab(target) {
      if (target === 'photos') {
        viewPhotos.classList.remove('hidden');
        viewMap.classList.add('hidden');
        tabPhotos.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-bold text-white bg-gold-600 shadow-sm';
        tabMap.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-semibold text-stone-500 hover:text-cocoa-900';
      } else {
        viewPhotos.classList.add('hidden');
        viewMap.classList.remove('hidden');
        tabMap.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-bold text-white bg-gold-600 shadow-sm';
        tabPhotos.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-semibold text-stone-500 hover:text-cocoa-900';
        stopAutoSlide();
      }
    }

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;

      // Update slide frames
      slides.forEach((slide, i) => {
        if (i === currentSlide) {
          slide.classList.remove('opacity-0', 'pointer-events-none');
          slide.classList.add('opacity-100', 'z-10');
        } else {
          slide.classList.remove('opacity-100', 'z-10');
          slide.classList.add('opacity-0', 'pointer-events-none');
        }
      });

      // Update counter
      if (counter) {
        counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }

      // Update thumbnails
      thumbs.forEach((thumb, i) => {
        if (i === currentSlide) {
          thumb.className = 'kasalong-thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gold-500 shadow-sm transition-all group scale-[1.02] opacity-100';
        } else {
          thumb.className = 'kasalong-thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent hover:border-gold-300 opacity-70 hover:opacity-100 shadow-sm transition-all group scale-100';
        }
      });
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = setInterval(() => {
        if (!viewPhotos.classList.contains('hidden')) {
          goToSlide(currentSlide + 1);
        }
      }, 5000);
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    // Tabs click
    tabPhotos.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('photos');
      startAutoSlide();
    });

    tabMap.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('map');
    });

    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlide - 1);
        startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(currentSlide + 1);
        startAutoSlide();
      });
    }

    // Thumbnails click
    thumbs.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        switchTab('photos');
        goToSlide(idx);
        startAutoSlide();
      });
    });

    // Pause on hover
    viewPhotos.addEventListener('mouseenter', stopAutoSlide);
    viewPhotos.addEventListener('mouseleave', startAutoSlide);

    // Touch Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    viewPhotos.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    viewPhotos.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
      startAutoSlide();
    }, { passive: true });

    // Initialize
    goToSlide(0);
    startAutoSlide();
  }

  initKasalongShowcase();

  // 9. Real-Time Farm Weather & Dynamic Atmosphere System (GPS: Lat 20.0886, Lon 99.9795)
  const WMO_MAP = {
    0: { icon: 'fa-sun text-amber-500', th: 'ฟ้าโปร่ง แดดสดใส', en: 'Clear & Sunny' },
    1: { icon: 'fa-cloud-sun text-amber-400', th: 'ท้องฟ้าแจ่มใส เมฆบางส่วน', en: 'Mainly Clear' },
    2: { icon: 'fa-cloud-sun text-amber-400', th: 'มีเมฆเป็นบางส่วน ลมสบาย', en: 'Partly Cloudy' },
    3: { icon: 'fa-cloud text-stone-400', th: 'มีเมฆมาก อากาศร่มรื่น', en: 'Overcast' },
    45: { icon: 'fa-smog text-stone-400', th: 'มีหมอกยามเช้า อากาศเย็น', en: 'Morning Mist' },
    48: { icon: 'fa-smog text-stone-400', th: 'หมอกหนา อากาศเย็นสดชื่น', en: 'Dense Fog' },
    51: { icon: 'fa-cloud-rain text-blue-400', th: 'ละอองฝนโปรยปราย', en: 'Light Drizzle' },
    53: { icon: 'fa-cloud-rain text-blue-400', th: 'ฝนตกปรอยๆ ชุ่มฉ่ำ', en: 'Moderate Drizzle' },
    55: { icon: 'fa-cloud-rain text-blue-500', th: 'ฝนตกพรำๆ อากาศสดชื่น', en: 'Dense Drizzle' },
    61: { icon: 'fa-cloud-showers-heavy text-blue-500', th: 'ฝนตกเบาบาง', en: 'Slight Rain' },
    63: { icon: 'fa-cloud-showers-heavy text-blue-500', th: 'ฝนตกชุ่มฉ่ำ', en: 'Moderate Rain' },
    65: { icon: 'fa-cloud-showers-heavy text-blue-600', th: 'ฝนตกหนัก', en: 'Heavy Rain' },
    80: { icon: 'fa-cloud-sun-rain text-blue-400', th: 'ฝนโปรยสลับแดด', en: 'Passing Showers' },
    81: { icon: 'fa-cloud-showers-heavy text-blue-500', th: 'มีฝนเป็นระยะ', en: 'Intermittent Rain' },
    95: { icon: 'fa-bolt text-amber-500', th: 'มีฝนฟ้าคะนอง', en: 'Thunderstorm' }
  };

  let liveGpsWeather = {
    temp: 31,
    humidity: 62,
    wind: 5.2,
    code: 0
  };

  let latestWeather = { ...liveGpsWeather };
  let activeAtmosphereMode = 'auto'; // 'auto', 'sunny', 'rainy', 'misty', 'night'
  let currentRenderedAtmosphere = '';

  function generateParticlesHTML(type) {
    if (type === 'rainy') {
      let streaks = '';
      for (let i = 0; i < 22; i++) {
        const left = (i * 4.5 + (i % 3) * 1.2).toFixed(1);
        const dur = (0.85 + (i % 5) * 0.15).toFixed(2);
        const delay = ((i * 0.13) % 2).toFixed(2);
        const op = (0.45 + (i % 4) * 0.12).toFixed(2);
        streaks += `<div class="rain-streak" style="left: ${left}%; --rain-opacity: ${op}; animation-duration: ${dur}s; animation-delay: ${delay}s;"></div>`;
      }
      streaks += `
        <div class="falling-leaf leaf-anim-1 text-emerald-400" style="left: 15%; width: 17px; height: 24px; --leaf-duration: 12s; --leaf-opacity: 0.65; animation-delay: 1s;">
          <svg viewBox="0 0 24 38" fill="none" class="w-full h-full"><path d="M12 2 C18 10 22 24 12 36 C2 24 6 10 12 2Z" fill="currentColor"/></svg>
        </div>
        <div class="falling-leaf leaf-anim-2 text-teal-400" style="left: 78%; width: 19px; height: 26px; --leaf-duration: 11s; --leaf-opacity: 0.6; animation-delay: 4s;">
          <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/></svg>
        </div>
      `;
      return streaks;
    }

    if (type === 'night') {
      let fireflies = '';
      for (let i = 0; i < 14; i++) {
        const left = (i * 7 + 3).toFixed(1);
        const top = (15 + (i * 5.5) % 65).toFixed(1);
        const size = (4 + (i % 3)).toFixed(0);
        const dur = (5 + (i % 4) * 1.2).toFixed(1);
        const delay = ((i * 0.35) % 4).toFixed(1);
        fireflies += `<div class="firefly-particle" style="left: ${left}%; top: ${top}%; width: ${size}px; height: ${size}px; animation-duration: ${dur}s; animation-delay: ${delay}s;"></div>`;
      }
      return fireflies;
    }

    if (type === 'misty') {
      let mist = '';
      const positions = [
        { left: '6%', top: '22%', size: '280px', dur: '18s', delay: '0s' },
        { left: '32%', top: '50%', size: '330px', dur: '22s', delay: '2s' },
        { left: '58%', top: '25%', size: '290px', dur: '20s', delay: '4s' },
        { left: '80%', top: '60%', size: '320px', dur: '24s', delay: '1s' }
      ];
      positions.forEach(p => {
        mist += `<div class="mist-particle" style="left: ${p.left}; top: ${p.top}; width: ${p.size}; height: ${p.size}; animation-duration: ${p.dur}; animation-delay: ${p.delay};"></div>`;
      });
      mist += `
        <div class="falling-leaf leaf-anim-2 text-emerald-500/60" style="left: 20%; width: 18px; height: 25px; --leaf-duration: 22s; --leaf-opacity: 0.5; animation-delay: 2s;">
          <svg viewBox="0 0 24 38" fill="none" class="w-full h-full"><path d="M12 2 C18 10 22 24 12 36 C2 24 6 10 12 2Z" fill="currentColor"/></svg>
        </div>
        <div class="falling-leaf leaf-anim-3 text-stone-400" style="left: 55%; width: 20px; height: 28px; --leaf-duration: 24s; --leaf-opacity: 0.45; animation-delay: 6s;">
          <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/></svg>
        </div>
      `;
      return mist;
    }

    // Default 'sunny' / leaves
    return `
      <div class="falling-leaf leaf-anim-1 text-gold-400" style="left: 8%; width: 20px; height: 26px; --leaf-duration: 14s; --leaf-opacity: 0.65; animation-delay: 0s;">
        <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/><path d="M14 5 Q14 18 14 31" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" stroke-linecap="round"/><path d="M14 12 Q19 14 22 18 M14 18 Q19 20 21 25 M14 13 Q9 15 6 18 M14 19 Q9 21 7 25" stroke="rgba(255,255,255,0.3)" stroke-width="0.6" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-2 text-emerald-500/65" style="left: 22%; width: 17px; height: 24px; --leaf-duration: 16s; --leaf-opacity: 0.55; animation-delay: 4.5s;">
        <svg viewBox="0 0 24 38" fill="none" class="w-full h-full"><path d="M12 2 C18 10 22 24 12 36 C2 24 6 10 12 2Z" fill="currentColor"/><path d="M12 6 Q12 20 12 33" stroke="rgba(255,255,255,0.35)" stroke-width="0.8" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-3 text-amber-300" style="left: 35%; width: 22px; height: 29px; --leaf-duration: 15s; --leaf-opacity: 0.6; animation-delay: 8s;">
        <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/><path d="M14 5 Q14 18 14 31" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" stroke-linecap="round"/><path d="M14 12 Q19 14 22 18 M14 18 Q19 20 21 25 M14 13 Q9 15 6 18 M14 19 Q9 21 7 25" stroke="rgba(255,255,255,0.3)" stroke-width="0.6" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-1 text-[#C48E58]" style="left: 48%; width: 18px; height: 24px; --leaf-duration: 17s; --leaf-opacity: 0.5; animation-delay: 2s;">
        <svg viewBox="0 0 24 38" fill="none" class="w-full h-full"><path d="M12 2 C18 10 22 24 12 36 C2 24 6 10 12 2Z" fill="currentColor"/><path d="M12 6 Q12 20 12 33" stroke="rgba(255,255,255,0.35)" stroke-width="0.8" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-2 text-gold-300" style="left: 63%; width: 21px; height: 28px; --leaf-duration: 14.5s; --leaf-opacity: 0.6; animation-delay: 10s;">
        <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/><path d="M14 5 Q14 18 14 31" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" stroke-linecap="round"/><path d="M14 12 Q19 14 22 18 M14 18 Q19 20 21 25 M14 13 Q9 15 6 18 M14 19 Q9 21 7 25" stroke="rgba(255,255,255,0.3)" stroke-width="0.6" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-3 text-emerald-500/60" style="left: 76%; width: 16px; height: 23px; --leaf-duration: 16.5s; --leaf-opacity: 0.55; animation-delay: 5.5s;">
        <svg viewBox="0 0 24 38" fill="none" class="w-full h-full"><path d="M12 2 C18 10 22 24 12 36 C2 24 6 10 12 2Z" fill="currentColor"/><path d="M12 6 Q12 20 12 33" stroke="rgba(255,255,255,0.35)" stroke-width="0.8" stroke-linecap="round"/></svg>
      </div>
      <div class="falling-leaf leaf-anim-1 text-gold-400" style="left: 89%; width: 22px; height: 29px; --leaf-duration: 13.5s; --leaf-opacity: 0.65; animation-delay: 1.2s;">
        <svg viewBox="0 0 28 36" fill="none" class="w-full h-full"><path d="M14 2 C22 8 26 22 14 34 C2 22 6 8 14 2Z" fill="currentColor"/><path d="M14 5 Q14 18 14 31" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" stroke-linecap="round"/><path d="M14 12 Q19 14 22 18 M14 18 Q19 20 21 25 M14 13 Q9 15 6 18 M14 19 Q9 21 7 25" stroke="rgba(255,255,255,0.3)" stroke-width="0.6" stroke-linecap="round"/></svg>
      </div>
    `;
  }

  function applyAtmosphere(type) {
    if (currentRenderedAtmosphere === type) return;
    currentRenderedAtmosphere = type;
    const container = document.getElementById('hero-weather-particles');
    if (container) {
      container.innerHTML = generateParticlesHTML(type);
    }
  }

  function determineAutoAtmosphere() {
    if (activeAtmosphereMode !== 'auto') {
      applyAtmosphere(activeAtmosphereMode);
      return;
    }

    const code = latestWeather.code;
    const now = new Date();
    const hour = now.getHours();
    const isNight = (hour >= 18 || hour < 6);

    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82) || code >= 95) {
      applyAtmosphere('rainy');
    } else if (code === 45 || code === 48) {
      applyAtmosphere('misty');
    } else if (isNight) {
      applyAtmosphere('night');
    } else {
      applyAtmosphere('sunny');
    }
  }

  function renderWeatherUI() {
    const isEn = (currentLang === 'en');
    const weatherInfo = WMO_MAP[latestWeather.code] || {
      icon: 'fa-cloud-sun text-amber-400',
      th: 'อากาศสบายริมทะเลสาบ',
      en: 'Pleasant Lakeside Weather'
    };

    const descText = isEn ? weatherInfo.en : weatherInfo.th;

    // 1. Update Hero Pill
    const heroIcon = document.getElementById('hero-weather-icon');
    const heroText = document.getElementById('hero-weather-text');

    if (heroIcon) {
      heroIcon.className = `fa-solid ${weatherInfo.icon} text-xs transition-transform group-hover:rotate-45`;
    }
    if (heroText) {
      const farmLabel = isEn ? 'Chiang Rai Farm' : 'ไร่เชียงราย';
      heroText.innerHTML = `${farmLabel} <strong id="hero-weather-temp" class="text-gold-300 font-bold">${latestWeather.temp}°C</strong> • <span id="hero-weather-desc">${descText}</span>`;
    }

    // 2. Update Destination Widget
    const mainIcon = document.getElementById('weather-icon-main');
    const mainTemp = document.getElementById('weather-temp-main');
    const mainDesc = document.getElementById('weather-desc-main');
    const humidityVal = document.getElementById('weather-humidity-val');
    const windVal = document.getElementById('weather-wind-val');

    if (mainIcon) {
      mainIcon.className = `fa-solid ${weatherInfo.icon} animate-pulse`;
    }
    if (mainTemp) {
      mainTemp.textContent = `${latestWeather.temp}°C`;
    }
    if (mainDesc) {
      mainDesc.textContent = descText;
    }
    if (humidityVal) {
      humidityVal.textContent = `${latestWeather.humidity}%`;
    }
    if (windVal) {
      windVal.textContent = `${latestWeather.wind} km/h`;
    }

    // 3. Update Atmosphere particles
    determineAutoAtmosphere();
  }

  async function fetchFarmWeather() {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=20.0886&longitude=99.9795&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FBangkok';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Open-Meteo response not ok');
      const data = await res.json();
      if (data && data.current) {
        liveGpsWeather = {
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: data.current.wind_speed_10m,
          code: data.current.weather_code
        };
        if (activeAtmosphereMode === 'auto') {
          latestWeather = { ...liveGpsWeather };
          renderWeatherUI();
        }
      }
    } catch (e) {
      renderWeatherUI();
    }
  }

  function initFarmWeather() {
    renderWeatherUI();
    fetchFarmWeather();
    setInterval(fetchFarmWeather, 600000);

    // Weather Demo Switcher Buttons
    document.querySelectorAll('.weather-demo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-mode');
        activeAtmosphereMode = mode;

        // Update button visual styles
        document.querySelectorAll('.weather-demo-btn').forEach(b => {
          if (b === btn) {
            b.className = 'weather-demo-btn px-2 py-0.5 rounded-md bg-white border border-gold-400 text-gold-900 font-bold text-[10px] shadow-xs transition-all';
          } else {
            b.className = 'weather-demo-btn px-2 py-0.5 rounded-md bg-white/70 hover:bg-white border border-stone-200 hover:border-gold-300 text-stone-600 text-[10px] font-medium transition-all';
          }
        });

        if (mode === 'sunny') {
          latestWeather = { temp: 31, humidity: 62, wind: 5.2, code: 0 };
          renderWeatherUI();
          applyAtmosphere('sunny');
        } else if (mode === 'rainy') {
          latestWeather = { temp: 24, humidity: 88, wind: 14.5, code: 63 };
          renderWeatherUI();
          applyAtmosphere('rainy');
        } else if (mode === 'misty') {
          latestWeather = { temp: 21, humidity: 92, wind: 3.8, code: 45 };
          renderWeatherUI();
          applyAtmosphere('misty');
        } else if (mode === 'night') {
          latestWeather = { temp: 23, humidity: 75, wind: 4.1, code: 1 };
          renderWeatherUI();
          applyAtmosphere('night');
        } else {
          // 'auto' -> restore real GPS weather
          latestWeather = { ...liveGpsWeather };
          renderWeatherUI();
          determineAutoAtmosphere();
        }
      });
    });
  }

  initFarmWeather();
});


