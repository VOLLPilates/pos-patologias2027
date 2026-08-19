(function(){
  var dataEl = document.getElementById("curriculos-data");
  var curriculos = {};
  try { curriculos = dataEl ? JSON.parse(dataEl.textContent) : {}; } catch (error) { curriculos = {}; }

  // Lazy-load YouTube videos only after the visitor clicks the thumbnail.
  function carregarVideo(thumbnailId, containerId, videoId) {
    var thumbnail = document.getElementById(thumbnailId);
    var container = document.getElementById(containerId);
    if (!thumbnail || !container) return;
    thumbnail.style.display = "none";
    container.innerHTML = '<iframe loading="lazy" width="520" height="292" style="border-radius: 10px; max-width: 100%;" src="https://www.youtube.com/embed/' + videoId + '" title="Curso de Pilates Formação Completa Presencial da VOLL Pilates!" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
  }

  window.carregarVideo1 = function() {
    carregarVideo("video1Thumbnail", "video1Container", "iyME8e6su80");
  };

  window.carregarVideo2 = function() {
    carregarVideo("video2Thumbnail", "video2Container", "h50AHMrwpg4");
  };

  // Testimonials carousel: duplicates cards only when needed and keeps the loop smooth.
  function setupTestimonialsCarousel() {
    var container = document.getElementById("vollCarouselContainer");
    if (!container || container.dataset.vollCarouselReady === "true") return;

    var cards = Array.prototype.slice.call(container.querySelectorAll(".voll-testimonial-card"));
    if (!cards.length) return;

    function cardKey(card) {
      var author = card.querySelector(".voll-author-name");
      var image = card.querySelector("img");
      return [
        author ? author.textContent : "",
        image ? image.getAttribute("src") : "",
        card.textContent
      ].join("|").replace(/\s+/g, " ").trim();
    }

    function alreadyDuplicated(items) {
      if (items.length < 2 || items.length % 2 !== 0) return false;
      var half = items.length / 2;
      for (var i = 0; i < half; i += 1) {
        if (cardKey(items[i]) !== cardKey(items[i + half])) return false;
      }
      return true;
    }

    if (!alreadyDuplicated(cards)) {
      container.innerHTML = container.innerHTML + container.innerHTML;
    }

    container.dataset.vollCarouselReady = "true";
    container.style.transform = "translateX(0)";

    var scrollPosition = 0;
    var scrollSpeed = 0.3;
    var isPaused = false;
    var isInViewport = typeof window.IntersectionObserver === "undefined";
    var animationFrameId = 0;
    var reduceMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var loopWidth = 0;

    function updateLoopWidth() {
      loopWidth = container.scrollWidth / 2;
      if (loopWidth > 0 && scrollPosition >= loopWidth) {
        scrollPosition = 0;
      }
    }

    function scheduleLoopWidthUpdate() {
      window.requestAnimationFrame(function() {
        updateLoopWidth();
        startAutoScroll();
      });
    }

    updateLoopWidth();
    window.addEventListener("resize", scheduleLoopWidthUpdate, { passive: true });
    container.querySelectorAll("img").forEach(function(image) {
      if (!image.complete) {
        image.addEventListener("load", scheduleLoopWidthUpdate, { once: true });
      }
    });

    function shouldAnimate() {
      return !isPaused && isInViewport && !document.hidden && loopWidth > 0 && !(reduceMotionQuery && reduceMotionQuery.matches);
    }

    function stopAutoScroll() {
      if (!animationFrameId) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    function startAutoScroll() {
      if (!animationFrameId && shouldAnimate()) {
        animationFrameId = window.requestAnimationFrame(autoScroll);
      }
    }

    function autoScroll() {
      animationFrameId = 0;
      if (!shouldAnimate()) return;

      scrollPosition += scrollSpeed;
      if (scrollPosition >= loopWidth) {
        scrollPosition = 0;
      }

      container.style.transform = "translateX(-" + scrollPosition + "px)";
      animationFrameId = window.requestAnimationFrame(autoScroll);
    }

    container.addEventListener("mouseenter", function() {
      isPaused = true;
      stopAutoScroll();
    });

    container.addEventListener("mouseleave", function() {
      isPaused = false;
      startAutoScroll();
    });

    if (typeof window.IntersectionObserver !== "undefined") {
      var carouselObserver = new window.IntersectionObserver(function(entries) {
        isInViewport = entries.some(function(entry) { return entry.isIntersecting; });
        if (isInViewport) startAutoScroll();
        else stopAutoScroll();
      }, { rootMargin: "100px 0px" });
      carouselObserver.observe(container);
    }

    document.addEventListener("visibilitychange", function() {
      if (document.hidden) stopAutoScroll();
      else startAutoScroll();
    });

    if (reduceMotionQuery) {
      var handleReducedMotion = function() {
        if (reduceMotionQuery.matches) stopAutoScroll();
        else startAutoScroll();
      };
      if (typeof reduceMotionQuery.addEventListener === "function") {
        reduceMotionQuery.addEventListener("change", handleReducedMotion);
      } else if (typeof reduceMotionQuery.addListener === "function") {
        reduceMotionQuery.addListener(handleReducedMotion);
      }
    }

    startAutoScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupTestimonialsCarousel);
  } else {
    setupTestimonialsCarousel();
  }

  document.addEventListener("click", function(event) {
    var anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    var href = anchor.getAttribute("href");
    if (href === "#") {
      event.preventDefault();
      return;
    }
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // FAQ accordion: animates with the real content height for a natural open/close.
  function animateToggle(item, shouldOpen) {
    var content = item.querySelector(".et_pb_toggle_content");
    if (!content) {
      item.classList.toggle("et_pb_toggle_open", shouldOpen);
      item.classList.toggle("et_pb_toggle_close", !shouldOpen);
      return;
    }

    if (content._vollToggleTransitionEnd) {
      content.removeEventListener("transitionend", content._vollToggleTransitionEnd);
    }

    content.style.overflow = "hidden";

    if (shouldOpen) {
      item.classList.remove("et_pb_toggle_close");
      item.classList.add("et_pb_toggle_open");
      content.style.height = "0px";
      content.style.opacity = "0";
      content.offsetHeight;

      content.style.height = content.scrollHeight + "px";
      content.style.opacity = "1";

      content._vollToggleTransitionEnd = function(event) {
        if (event.propertyName !== "height") return;
        content.removeEventListener("transitionend", content._vollToggleTransitionEnd);
        content._vollToggleTransitionEnd = null;
        if (item.classList.contains("et_pb_toggle_open")) {
          content.style.height = "auto";
          content.style.overflow = "";
        }
      };
      content.addEventListener("transitionend", content._vollToggleTransitionEnd);
      return;
    }

    content.style.height = content.scrollHeight + "px";
    content.style.opacity = "1";
    content.offsetHeight;

    item.classList.remove("et_pb_toggle_open");
    item.classList.add("et_pb_toggle_close");
    content.style.height = "0px";
    content.style.opacity = "0";

    content._vollToggleTransitionEnd = function(event) {
      if (event.propertyName !== "height") return;
      content.removeEventListener("transitionend", content._vollToggleTransitionEnd);
      content._vollToggleTransitionEnd = null;
      if (item.classList.contains("et_pb_toggle_close")) {
        content.style.height = "";
        content.style.overflow = "";
      }
    };
    content.addEventListener("transitionend", content._vollToggleTransitionEnd);
  }

  document.addEventListener("click", function(event) {
    var title = event.target.closest(".et_pb_toggle_title");
    if (!title || !title.closest(".et_pb_section_10")) return;
    var item = title.closest(".et_pb_toggle");
    if (!item) return;
    animateToggle(item, item.classList.contains("et_pb_toggle_close"));
  });

  var modal = document.getElementById("curriculoModal");
  var modalTitle = document.getElementById("curriculoTitulo");
  var modalDesc = document.getElementById("curriculoDescricao");
  var modalContent = document.getElementById("curriculoConteudo");

  function openCurriculo(id) {
    var item = curriculos[id] || {
      titulo: "Currículo",
      descricao: "",
      conteudo: "<p>Currículo pendente na captura local.</p>"
    };
    if (!modal || !modalTitle || !modalContent) return;
    modalTitle.textContent = item.titulo || "Currículo";
    if (modalDesc) {
      modalDesc.textContent = item.descricao || "";
      modalDesc.style.display = item.descricao ? "" : "none";
    }
    modalContent.innerHTML = item.conteudo || "";
    modal.classList.add("ativo");
    document.body.style.overflow = "hidden";
  }

  function closeCurriculo() {
    if (!modal) return;
    modal.classList.remove("ativo");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function(event) {
    var trigger = event.target.closest("a,button,[role='button']");
    if (!trigger || !trigger.className) return;
    var match = String(trigger.className).match(/curriculo-[a-z0-9]{8}/i);
    if (!match) return;
    event.preventDefault();
    openCurriculo(match[0]);
  });

  document.getElementById("curriculoFechar")?.addEventListener("click", function(event) {
    event.preventDefault();
    closeCurriculo();
  });

  modal?.addEventListener("click", function(event) {
    if (event.target === modal) closeCurriculo();
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") closeCurriculo();
  });

})();

// Typebot bubble: desktop loads after render; mobile waits for user intent to avoid CLS in PageSpeed.
(function(){
  function loadTypebot() {
    if (window.__vollTypebotLoaded) return;
    window.__vollTypebotLoaded = true;
    import("https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3.4/dist/web.js")
      .then(function(module) {
        var Typebot = module.default;
        Typebot.initBubble({
          typebot: "pos-patologias",
          apiHost: "https://iavoll.exerciciosdepilates.com.br",
          className: "someMN",
          previewMessage: {
            message: "Ola, tem alguma duvida?",
            autoShowDelay: 15000,
            avatarUrl: "https://vollpilates.com.br/wp-content/uploads/2024/07/curso_de_pilates_lgo_voll_pilates.webp"
          },
          theme: {
            button: { backgroundColor: "#00615a" },
            chatWindow: { backgroundColor: "#00615a" }
          }
        });
      })
      .catch(function() {});
  }

  function scheduleTypebot() {
    var isSmallViewport = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;

    if (isSmallViewport) {
      var loadAfterIntent = function() {
        window.removeEventListener("scroll", loadAfterIntent);
        window.removeEventListener("pointerdown", loadAfterIntent);
        window.removeEventListener("keydown", loadAfterIntent);
        loadTypebot();
      };

      window.addEventListener("scroll", loadAfterIntent, { once: true, passive: true });
      window.addEventListener("pointerdown", loadAfterIntent, { once: true, passive: true });
      window.addEventListener("keydown", loadAfterIntent, { once: true });
      return;
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadTypebot, { timeout: 5000 });
      return;
    }
    window.setTimeout(loadTypebot, 2500);
  }

  if (document.readyState === "complete") {
    scheduleTypebot();
  } else {
    window.addEventListener("load", scheduleTypebot, { once: true });
  }
})();
