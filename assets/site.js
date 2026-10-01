(function () {
  // Lazy-load and play/pause looping videos as they enter/leave the viewport.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = document.querySelectorAll('video[data-src]');

  function load(v) {
    if (!v.getAttribute('src')) v.setAttribute('src', v.dataset.src);
  }

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          load(v);
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.15 });
    vids.forEach(function (v) { io.observe(v); });
  } else {
    // No autoplay: show posters and let the user start a video by clicking.
    vids.forEach(function (v) { v.controls = true; v.preload = 'none'; });
    vids.forEach(function (v) { v.addEventListener('play', function () { load(v); }, { once: true }); });
  }

  // Tabs: swap the video source and caption.
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var v = box.querySelector('video');
    var cap = box.querySelector('[data-caption]');
    box.querySelectorAll('[role=tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('[role=tab]').forEach(function (x) { x.classList.toggle('active', x === b); });
        v.pause();
        v.setAttribute('poster', b.dataset.poster);
        v.dataset.src = b.dataset.video;
        v.setAttribute('src', b.dataset.video);
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        cap.textContent = b.dataset.cap;
      });
    });
  });

  // Click-to-load embedded data viewer.
  document.querySelectorAll('[data-viewer]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = b.dataset.viewer;
      f.title = 'MotionPersona data viewer';
      f.allow = 'fullscreen';
      f.loading = 'lazy';
      b.parentNode.replaceChild(f, b);
    });
  });

  // Nav border once scrolled.
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Copy BibTeX.
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = document.getElementById(b.dataset.copy).textContent;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {});
    });
  });

  // Left contents rail: appears after the hero, highlights the section being read.
  var toc = document.getElementById('toc');
  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[data-spy]'));
    var targets = links.map(function (a) { return document.getElementById(a.dataset.spy); });
    var hero = document.getElementById('top');
    function spy() {
      var y = window.innerHeight * 0.35;
      var cur = -1;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].getBoundingClientRect().top <= y) cur = i;
      }
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
      var past = hero ? hero.getBoundingClientRect().bottom < window.innerHeight * 0.4 : window.scrollY > 600;
      toc.classList.toggle('show', past);
    }
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    spy();
  }
})();
