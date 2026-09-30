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
});
