// Polished static site JS (Option 1)
// Features:
// - Responsive mobile menu
// - Theme toggle persisted
// - Gallery rendered from localStorage (admin-editable)
// - Modal with keyboard/thumbnail navigation
// - Contact form validation + toast + persistence of messages for admin
// - Scroll reveal

(() => {
  /* DOM helpers */
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Keys
  const THEME_KEY = 'jain_theme_v2';
  const GALLERY_KEY = 'jain_gallery_v2';
  const MESSAGES_KEY = 'jain_messages_v2';

  // Elements
  const menuToggle = $('#menu-toggle');
  const mainNav = $('#main-nav');
  const themeToggle = $('#theme-toggle');
  const toast = $('#toast');
  const galleryGrid = $('#gallery-grid');
  const modal = $('#modal');
  const modalImg = $('#modal-img');
  const modalCaption = $('#modal-caption');
  const modalThumbs = $('#modal-thumbs');
  const modalPrev = $('#modal-prev');
  const modalNext = $('#modal-next');
  const modalClose = $('#modal-close');
  const yearEl = $('#year');
  const contactForm = $('#contact-form');

  // Default gallery (placeholder images — replace with originals)
  const defaultGallery = [
    { src:'images/jain1.jpg', caption:'Central lawn — Jain University' },
    { src:'images/jain2.jpg', caption:'Academic block at dusk' },
    { src:'images/jain3.jpg', caption:'Library & study area' },
    { src:'images/jain4.jpg', caption:'Student common space' }
  ];

  /* Theme */
  function applyTheme(t){
    document.body.classList.toggle('light', t === 'light');
    themeToggle.textContent = t === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-pressed', t === 'light');
  }
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  /* Mobile menu */
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* Year */
  yearEl.textContent = new Date().getFullYear();

  /* Scroll reveal */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, {threshold: 0.12});
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* Gallery persistence */
  function getGallery(){
    try { return JSON.parse(localStorage.getItem(GALLERY_KEY)) || defaultGallery.slice(); }
    catch { return defaultGallery.slice(); }
  }
  function saveGallery(arr){ localStorage.setItem(GALLERY_KEY, JSON.stringify(arr)); }

  function renderGallery(){
    const gallery = getGallery();
    if (!gallery.length) {
      galleryGrid.innerHTML = '<p class="muted">No images yet. Add images via admin.</p>';
      return;
    }
    galleryGrid.innerHTML = gallery.map((it,i) => `
      <figure class="card reveal" data-idx="${i}">
        <img src="${it.src}" alt="${escapeHtml(it.caption||'Campus photo')}" loading="lazy" tabindex="0">
        <figcaption>${escapeHtml(it.caption || '')}</figcaption>
      </figure>
    `).join('');
    // attach listeners
    $$('#gallery-grid img').forEach((img, i) => {
      img.addEventListener('click', () => openModal(i));
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(i); });
    });
    // reapply reveals
    $$('.reveal').forEach(el => revealObserver.observe(el));
  }
  renderGallery();

  /* Modal */
  let current = 0;
  function openModal(index){
    const g = getGallery();
    if (!g.length) return;
    current = index;
    modalImg.src = g[current].src;
    modalImg.alt = g[current].caption || '';
    modalCaption.textContent = g[current].caption || '';
    buildThumbs(current);
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(()=> modal.querySelector('img')?.focus?.(), 120);
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    modalImg.src = '';
  }
  function prev(){ current = (current - 1 + getGallery().length) % getGallery().length; openModal(current); }
  function next(){ current = (current + 1) % getGallery().length; openModal(current); }

  function buildThumbs(activeIdx){
    modalThumbs.innerHTML = getGallery().map((it,i) => `<img src="${it.src}" alt="${escapeHtml(it.caption||'')}" class="${i===activeIdx?'active':''}" data-i="${i}" loading="lazy">`).join('');
    $$('#modal-thumbs img').forEach(img => img.addEventListener('click', () => openModal(Number(img.dataset.i))));
  }

  modalPrev.addEventListener('click', prev);
  modalNext.addEventListener('click', next);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeModal();
    }
  });

  /* Contact form */
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 3200);
  }
  function getMessages(){ try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; } catch { return []; } }
  function saveMessage(obj){
    const arr = getMessages();
    arr.unshift(obj);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(arr));
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    if (!name || !email || !message) { showToast('Please complete all fields.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { showToast('Please enter a valid email.'); return; }
    saveMessage({ name, email, message, date: new Date().toISOString() });
    contactForm.reset();
    showToast('Thank you — your message has been saved.');
  });

  /* Utility */
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* Expose admin API for admin page */
  window.__JAIN_UI = {
    getMessages,
    getGallery,
    addGalleryItem: (item) => { const g = getGallery(); g.push(item); saveGallery(g); renderGallery(); },
    removeGalleryAtIndex: (i) => { const g = getGallery(); if (i>=0 && i<g.length){ g.splice(i,1); saveGallery(g); renderGallery(); } },
    resetGallery: () => { saveGallery(defaultGallery.slice()); renderGallery(); }
  };

  // small polyfill for focus outline on keyboard users
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.documentElement.classList.add('show-focus'); });
})();