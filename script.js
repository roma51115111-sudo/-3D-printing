document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById('header');
  const logo = document.getElementById('logo');
  const video1 = document.getElementById('video1');
  const video2 = document.getElementById('video2');
  const heroContent = document.getElementById('heroContent');
  const overlay = document.getElementById('overlay');
  const heroTitleSpans = document.querySelectorAll('.animated-title span');
  const heroText = document.querySelector('.hero-text');
  const heroBtn = document.querySelector('.hero-btn');

  let headerVisible = false;

  // --- Перезапуск анімації гіфки ---
  const originalSrc = logo.getAttribute('src').split('?')[0];
  logo.setAttribute('src', originalSrc + '?t=' + new Date().getTime());

  // --- Ховаємо хедер при запуску першого відео ---
  video1.addEventListener('play', () => {
    header.classList.remove('scrolled');
  });

  // --- Коли перше відео завершилось — показуємо друге відео та хедер ---
  video1.addEventListener('ended', () => {
    setTimeout(() => {
      video2.style.display = 'block';
      video2.play();
      header.classList.remove('hidden');
      header.classList.remove('scrolled');
      headerVisible = true;
    }, 500);
  });

  // --- Поява контенту героя при запуску другого відео ---
  video2.addEventListener('play', () => {
    heroContent.classList.add('visible');
    heroTitleSpans.forEach((span) => {
      setTimeout(() => {
        span.classList.add('visible');
      }, parseInt(span.dataset.delay));
    });

    setTimeout(() => heroText.classList.add('visible'), 1400);
    setTimeout(() => heroBtn.classList.add('visible'), 1800);
  });

  // --- Потемніння після завершення другого відео ---
  video2.addEventListener('ended', () => {
    overlay.classList.add('visible');
  });

  // --- Слідкуємо за прокруткою ---
  window.addEventListener('scroll', () => {
    if (!headerVisible) return;
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
//код кнопки:
document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы
  const moodToggle = document.getElementById('housingMoodToggle');
  const housingBlock = document.querySelector('.creative-block.wide');
  
  // Проверяем, что элементы существуют
  if (moodToggle && housingBlock) {
      const toggleText = moodToggle.querySelector('.toggle-text');
      
      // Загружаем сохраненное состояние
      const savedMode = localStorage.getItem('housingMood');
      if (savedMode === 'night') {
          housingBlock.classList.add('night-mode');
          moodToggle.classList.add('night-mode');
          if (toggleText) toggleText.textContent = 'Night mode';
      }
      
      // Обработчик клика
      moodToggle.addEventListener('click', function(e) {
          e.preventDefault(); // Предотвращаем возможное всплытие события
          
          // Переключаем классы
          this.classList.toggle('night-mode');
          housingBlock.classList.toggle('night-mode');
          
          // Обновляем текст и сохраняем состояние
          if (toggleText) {
              if (this.classList.contains('night-mode')) {
                  toggleText.textContent = 'Night mode';
                  localStorage.setItem('housingMood', 'night');
                  
                  // Анимация при переключении на ночной режим
                  this.style.transform = 'scale(0.95)';
                  setTimeout(() => {
                      this.style.transform = '';
                  }, 200);
              } else {
                  toggleText.textContent = 'Day mode';
                  localStorage.setItem('housingMood', 'day');
              }
          }
          
          console.log('Mode toggled:', this.classList.contains('night-mode') ? 'night' : 'day'); // Для отладки
      });
      
      // Убираем начальную анимацию
      setTimeout(() => {
          moodToggle.style.animation = 'none';
      }, 1000);
  } else {
      console.error('Elements not found!'); // Для отладки
  }
});
// ===============================
// ======== КОД ГАЛЕРЕЇ ==========
// ===============================
let xPos = 0;
const $galleryRing = $('.gallery-ring');
const $imgs = $('.gallery-img');
const total = $imgs.length;
const galleryAngle = 360 / total;
const blur = 0;
const radius = 1000;

// ===============================
// GSAP VIRTUAL STATE (ENGINE)
// ===============================
const galleryState = {
    rotation: 0,
    // Добавляем целевую позицию для плавного завершения
    targetRotation: 0
};

// ===============================
// IDLE SNAP (без автопрокрутки)
// ===============================
let idleTimer = null;
const IDLE_DELAY = 2000; // мс бездействия

function resetIdleSnap() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        if (!isDragging) {
            snapToClosestSlide();
        }
    }, IDLE_DELAY);
}

// Инициализация GSAP
gsap.set('.gallery-ring', {
    rotationY: 0,
    cursor: 'grab'
});

gsap.set('.gallery-img', {
    rotateY: (i) => i * galleryAngle,
    transformOrigin: `50% 50% ${radius}px`,
    z: -radius,
    scale: 1,
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d'
});

// --- Оновлення фону ---
function updateBackground(rotation) {
    let rot = ((rotation % 360) + 360) % 360;
    let index = Math.round(rot / galleryAngle) % total;
    index = (total - index) % total;
    let bg = $imgs.eq(index).css('background-image');
    $('.section-gallery').css({
        backgroundImage: bg,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        transition: 'background-image 0.5s ease'
    });
}

function updateScales(rotation) {
  const now = Date.now();
  const deltaTime = now - (lastUpdateTime || now);
  lastUpdateTime = now;
  
  for (let i = 0; i < total; i++) {
      const el = $imgs[i];
      
      // Вычисляем позицию картинки относительно центра
      let imgAngle = i * galleryAngle;
      let rot = imgAngle + rotation;
      
      // Нормализуем угол от -180 до 180
      rot = rot % 360;
      if (rot > 180) rot -= 360;
      if (rot < -180) rot += 360;
      
      const absRot = Math.abs(rot);
      
      // ============ ЦЕНТР МАЛЕНЬКИЙ, КРАЯ БОЛЬШИЕ ============
      const centerScale = 0.2;      // Центр - 50%
      const edgeScale = 1.5;        // Края - 150%
      
      // Плавное увеличение от центра к краям
      const t = absRot / 180;       // 0 в центре, 1 на краях
      
      // Линейная интерполяция
      let scale = centerScale + (edgeScale - centerScale) * t;
      
      // ========================================================
      
      // УБИРАЕМ z полностью, работаем только с scale
      // Просто применяем scale напрямую
      el.style.transform = el.style.transform.replace(/scale3d\([^)]*\)/, ''); // Удаляем старый scale
      
      // Применяем анимацию ТОЛЬКО для scale
      if (!el._scaleTween) {
          el._scaleTween = gsap.to(el, {
              scale: scale,
              duration: 0.4,
              ease: "power2.out",
              overwrite: true,
              onComplete: () => {
                  el._scaleTween = null;
              }
          });
      } else {
          el._scaleTween.vars.scale = scale;
          el._scaleTween.invalidate().restart();
      }
      
      // Blur эффект
      const maxBlur = 0;
      const blurAmount = maxBlur * (1 - t);
      
      gsap.to(el, {
          filter: `blur(${blurAmount}px)`,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true
      });
  }
}

let lastUpdateTime = null;

function snapToClosestSlide() {
    const rot = galleryState.rotation;
    const nearestIndex = Math.round(-rot / galleryAngle) % total;
    const targetRotation = -nearestIndex * galleryAngle;
    
    galleryState.targetRotation = targetRotation;
    
    gsap.to(galleryState, {
        rotation: targetRotation,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
            // Продолжаем обновлять масштаб во время анимации
            updateScales(galleryState.rotation);
            updateBackground(galleryState.rotation);
        }
    });
}

// --- Початкова ініціалізація ---
updateBackground(0);
updateScales(0);

let isDragging = false;
let lastMouseX = 0;
let velocity = 0;
let lastTime = 0;

// --- Управління мишею (drag) ---
$(window).on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);

function dragStart(e) {
    isDragging = true;
    clearTimeout(idleTimer);
    
    if (e.touches) {
        e.clientX = e.touches[0].clientX;
    }
    
    lastMouseX = e.clientX;
    lastTime = Date.now();
    velocity = 0;
    
    gsap.set('.gallery-ring', { cursor: 'grabbing' });
    $(window).on('mousemove touchmove', drag);
}

function drag(e) {
    if (!isDragging) return;
    resetIdleSnap();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - lastMouseX;
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > 0) {
        velocity = -deltaX * 0.5; // Сохраняем скорость для инерции
    }
    
    // Применяем вращение
    galleryState.rotation -= deltaX * 0.4;
    lastMouseX = clientX;
    lastTime = currentTime;
}

function dragEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    $(window).off('mousemove touchmove', drag);
    gsap.set('.gallery-ring', { cursor: 'grab' });
    
    // Добавляем инерцию
    if (Math.abs(velocity) > 0.1) {
        const inertiaTween = gsap.to(galleryState, {
            rotation: galleryState.rotation + velocity * 10,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
                // Обновляем масштаб во время инерции
                updateScales(galleryState.rotation);
                updateBackground(galleryState.rotation);
            },
            onComplete: () => {
                resetIdleSnap();
            }
        });
    } else {
        resetIdleSnap();
    }
}

// ===============================
// CLICK NAVIGATION — SMOOTH
// ===============================
$imgs.on('click', function() {
    if (isDragging) return;
    
    const i = $(this).index();
    const targetRotation = -i * galleryAngle;
    
    gsap.to(galleryState, {
        rotation: targetRotation,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
            // Продолжаем обновлять масштаб во время анимации
            updateScales(galleryState.rotation);
            updateBackground(galleryState.rotation);
        }
    });
});

// Основной цикл анимации
function animate() {
    requestAnimationFrame(animate);
    
    const currentRotation = galleryState.rotation;
    $galleryRing[0].style.transform = `rotateY(${currentRotation}deg)`;
    
    // Всегда обновляем фон и масштаб
    updateBackground(currentRotation);
    updateScales(currentRotation);
}

// Запуск анимации
animate();

// Очистка твинов при уходе со страницы
window.addEventListener('beforeunload', () => {
    $imgs.each(function() {
        if (this._scaleTween) {
            this._scaleTween.kill();
        }
    });
});

  // ===============================
// ======== СЛАЙДЕР ВИДЕО ========
// ===============================
const container = document.getElementById('compareContainer');
const slider = document.getElementById('slider');
const videoAfter = document.getElementById('videoAfter');

if (container && slider && videoAfter) {

  let isDraggingSlider = false;
  let autoTween = null;
  const margin = 10;
  let currentLeft = null; // храним текущую позицию

  function setSliderPosition(x, isAuto = false) {
    const rect = container.getBoundingClientRect();
    
    // Ограничиваем x
    if (x < margin) x = margin;
    if (x > rect.width - margin) x = rect.width - margin;
    
    // Запоминаем текущую позицию
    currentLeft = x;
    
    // Применяем позицию слайдера
    slider.style.left = x + 'px';
    
    // Принудительно обновляем clipPath — ВАЖНО: строгое обрезание
    const rightInset = Math.round(rect.width - x);
    videoAfter.style.clipPath = `inset(0px ${rightInset}px 0px 0px)`;
    
    // Небольшой хак для принудительного перерендера в некоторых браузерах
    videoAfter.style.transform = 'translateZ(0)';
    setTimeout(() => { videoAfter.style.transform = ''; }, 0);
  }

  function sliderStartDrag(e) {
    e.preventDefault();
    isDraggingSlider = true;
    if (autoTween) {
      autoTween.kill();
      autoTween = null;
    }
  }

  function sliderDrag(e) {
    if (!isDraggingSlider) return;
    e.preventDefault(); // Добавляем preventDefault
    
    let clientX = e.clientX;
    if (e.touches) clientX = e.touches[0].clientX;
    const rect = container.getBoundingClientRect();
    setSliderPosition(clientX - rect.left);
  }

  function sliderEndDrag() {
    isDraggingSlider = false;
  }

  // === правильная привязка с passive: false для всех ===
  slider.addEventListener('mousedown', sliderStartDrag);
  slider.addEventListener('touchstart', sliderStartDrag, { passive: false });

  window.addEventListener('mousemove', sliderDrag);
  window.addEventListener('touchmove', sliderDrag, { passive: false });

  window.addEventListener('mouseup', sliderEndDrag);
  window.addEventListener('touchend', sliderEndDrag);

  // === центруем при загрузке ===
  function initSlider() {
    const rect = container.getBoundingClientRect();
    setSliderPosition(rect.width / 2);
  }
  initSlider();

  // === корректировка при ресайзе ===
  window.addEventListener('resize', () => {
    const rect = container.getBoundingClientRect();
    // Используем currentLeft если есть, иначе центр
    const left = currentLeft !== null ? currentLeft : rect.width / 2;
    setSliderPosition(Math.min(Math.max(left, margin), rect.width - margin));
  });

  // === автоматическое движение при появлении ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !autoTween) {
        const rect = container.getBoundingClientRect();
        const center = rect.width / 2;

        autoTween = gsap.to({}, {
          duration: 2,
          delay: 2,
          onUpdate: function () {
            const progress = this.progress();
            // От центра к краю
            const position = center - (center - margin) * progress;
            setSliderPosition(position, true);
          },
          onComplete: () => {
            autoTween = null;
          }
        });

        observer.unobserve(container);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(container);

  // === ДОПОЛНИТЕЛЬНО: сброс при проблемах ===
  // Принудительно обновляем clipPath при каждой прокрутке страницы
  window.addEventListener('scroll', function forceClipUpdate() {
    if (currentLeft !== null) {
      const rect = container.getBoundingClientRect();
      const rightInset = Math.round(rect.width - currentLeft);
      videoAfter.style.clipPath = `inset(0px ${rightInset}px 0px 0px)`;
    }
  }, { passive: true });

} else {
  console.warn('Slider elements not found: compareContainer/slider/videoAfter');
}

// ===============================
// ===== HERO 3D CAROUSEL =========
// ===== Framer-feel Engine =======
// ===============================
(function hero3DCarousel() {

  const root = document.querySelector('.section-hero-carousel');
  if (!root) return;

  const ring = root.querySelector('.hero-carousel__ring');
  const cards = [...root.querySelectorAll('.hero-carousel__card')];
  const total = cards.length;
  if (!ring || !total) return;

  // ------------------
  // CONFIG
  // ------------------
  const RADIUS = 500;
  const density = 1;
  const step = 360 / total * density;

  const DRAG_LEFT = 0.12;
  const DRAG_RIGHT = 0.05;

  const INERTIA_SCALE = 8;

  const SNAP_EASE = "expo.out";
  const INERTIA_EASE = "power2.out";

  const ACTIVE_BOOST = 90;
  const NEAR_BOOST = 45;

  const ACTIVE_SCALE = 1.1;
  const NEAR_SCALE = 1.04;

  const TILT_X = -2;
  const TILT_RAD = Math.abs(TILT_X) * Math.PI / 180;

  // ------------------
  // STATE
  // ------------------
  let angle = 0;
  let velocity = 0;
  let lastX = 0;
  let isDown = false;
  let tween = null;
  let targetAngle = 0;
  
    // ------------------
  // AUTO ROTATION
  // ------------------
  let autoRotateSpeed = 0.20; // скорость вращения (чем меньше, тем медленнее)
  let autoRotateEnabled = true;
  let lastInteractionTime = Date.now();
  const AUTO_ROTATE_DELAY = 3000; // пауза после взаимодействия (мс)

  const setRing = gsap.quickSetter(ring, "rotateY", "deg");
  
  // ------------------
  // SMOOTH FALLOFF FUNCTION
  // ------------------
  function smoothFalloff(diff, max) {
    const x = Math.min(diff / max, 1); // нормализуем от 0 до 1
    return 1 - Math.pow(x, 3); // кубическая кривая для плавного падения
  }
  
  // ------------------
  // SCENE LAYOUT once
  // ------------------
  cards.forEach((card, i) => {
    const local = -((total - 1) / 2) * step + i * step;
    card.dataset.local = local;
  
    const h = card.offsetHeight;
    const compensateY = Math.tan(TILT_RAD) * (h / 2);
  
    card.style.setProperty('--z', '0px');
    card.style.setProperty('--scale', '1');
  
    card.style.transform = `
      translate(-50%, -50%)
      translateY(${compensateY}px)
      rotateY(${local}deg)
      translateZ(calc(${RADIUS}px + var(--z)))
      rotateX(${TILT_X}deg)
      scale3d(var(--scale), var(--scale), 1)
    `;
  
    card.style.transformStyle = "preserve-3d";
    card.style.backfaceVisibility = "hidden";
  });
  

  function updateDepth() {

    cards.forEach(card => {
      const local = parseFloat(card.dataset.local);
  
      // ✅ корректная нормализация угла
      const raw = local + angle;
      const diff = ((raw + 180) % 360 + 360) % 360 - 180;
      const absDiff = Math.abs(diff);
  
      const isActive = absDiff < step * 0.45;
      card.classList.toggle('is-active', isActive);
  
      const t = Math.min(absDiff / step, 1);
  
      const scale = 1 + (1 - t) * 0.1;
      const z = (1 - t) * ACTIVE_BOOST;
      const opacity = 0.4 + (1 - t) * 0.6;
  
      card.style.setProperty('--scale', scale.toFixed(3));
      card.style.setProperty('--z', `${z.toFixed(1)}px`);
      card.style.opacity = opacity.toFixed(3);
  
      card.style.filter = isActive ? 'none' : 'blur(1.5px)';
  
      const h = card.offsetHeight;
      const compensateY = Math.tan(TILT_RAD) * (h / 2);
  
      card.style.transform = `
        translate(-50%, -50%)
        translateY(${compensateY}px)
        rotateY(${local}deg)
        translateZ(calc(${RADIUS}px + var(--z)))
        rotateX(${TILT_X}deg)
        scale3d(var(--scale), var(--scale), 1)
      `;
    });
  
  }
  // ------------------
  // RAF LOOP
  // ------------------
  function loop() {
    startAutoRotation(); // ← добавьте эту строку
    angle += (targetAngle - angle) * 0.08;
    setRing(angle);
    updateDepth();
    requestAnimationFrame(loop);
  }
  

  // ------------------
  // SNAP TARGET
  // ------------------
  function getSnapTarget(a) {
    return Math.round(a / step) * step;
  }

    // ------------------
  // AUTO ROTATION LOOP
  // ------------------
  function startAutoRotation() {
    const now = Date.now();
    const timeSinceLastInteraction = now - lastInteractionTime;
    
    if (autoRotateEnabled && timeSinceLastInteraction > AUTO_ROTATE_DELAY) {
      targetAngle += autoRotateSpeed;
    }
  }

  // ------------------
  // СБРОС ТАЙМЕРА ПРИ ВЗАИМОДЕЙСТВИИ
  // ------------------
  function resetAutoRotationTimer() {
    lastInteractionTime = Date.now();
  }


  // ------------------
  // POINTER INPUT
  // ------------------
  root.addEventListener("pointerdown", e => {
    if (e.button !== 0 && e.button !== 2) return;

    isDown = true;
    resetAutoRotationTimer();
    lastX = e.clientX;

    if (tween) tween.kill();
    tween = null;

    velocity = 0;

    root.setPointerCapture(e.pointerId);
  });

  root.addEventListener("pointermove", e => {
    if (!isDown || e.buttons === 0) return;

    const dx = e.clientX - lastX;
    lastX = e.clientX;

    const drag = (e.buttons === 2) ? DRAG_RIGHT : DRAG_LEFT;

    angle += dx * drag;
    targetAngle = angle;
    velocity = dx * drag;

  });

  root.addEventListener("pointerup", e => {
    isDown = false;
    resetAutoRotationTimer();
    root.releasePointerCapture(e.pointerId);

    // ---- 1) INERTIA run ----
    const inertiaTarget = angle + velocity * INERTIA_SCALE;
    targetAngle = getSnapTarget(inertiaTarget);
    const snapTarget = getSnapTarget(inertiaTarget);

    let proxy = { v: angle };

    tween = gsap.to(proxy, {
      v: inertiaTarget,
      duration: 0.35,
      ease: INERTIA_EASE,
      onUpdate() {
        angle = proxy.v;
      },
      onComplete() {

        // ---- 2) SMOOTH SNAP ----
        tween = gsap.to(proxy, {
          v: snapTarget,
          duration: 0.65,
          ease: SNAP_EASE,
          onUpdate() {
            angle = proxy.v;
          }
        });
      }
    });
  });

  // ------------------
  // WHEEL / TRACKPAD
  // ------------------
  root.addEventListener("wheel", e => {
    e.preventDefault();
    resetAutoRotationTimer();
    const delta = e.deltaY || e.deltaX;
    const scroll = gsap.utils.clamp(-40, 40, delta * 0.6);
  
    targetAngle += scroll;
  }, { passive: false });
  
  root.addEventListener("contextmenu", e => e.preventDefault());

  loop();

})();

})();
