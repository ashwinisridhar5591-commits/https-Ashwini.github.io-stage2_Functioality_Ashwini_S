// Admin dashboard (client-side demo)
// Demo credentials (change if you want)
const DEMO_EMAIL = 'admin@jain.edu';
const DEMO_PASS = 'JainAdmin123';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const dashboard = document.getElementById('dashboard');
  const logoutBtn = document.getElementById('logout');
  const showCreds = document.getElementById('show-creds');
  const tabMessages = document.getElementById('tab-messages');
  const tabGallery = document.getElementById('tab-gallery');
  const panelMessages = document.getElementById('panel-messages');
  const panelGallery = document.getElementById('panel-gallery');
  const messagesList = document.getElementById('messages-list');
  const exportCsv = document.getElementById('export-csv');
  const clearMsgs = document.getElementById('clear-msgs');
  const galleryAdminList = document.getElementById('gallery-admin-list');
  const addImgBtn = document.getElementById('add-img');
  const imgSrc = document.getElementById('img-src');
  const imgCaption = document.getElementById('img-caption');
  const resetGalleryBtn = document.getElementById('reset-gallery');

  showCreds.addEventListener('click', () => alert(`Demo credentials:\nEmail: ${DEMO_EMAIL}\nPassword: ${DEMO_PASS}`));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    if (email === DEMO_EMAIL && pass === DEMO_PASS) {
      loginForm.parentElement.style.display = 'none';
      dashboard.style.display = '';
      loadMessages();
      loadGalleryAdmin();
    } else {
      alert('Invalid credentials (demo). Use the demo credentials shown.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    loginForm.parentElement.style.display = '';
    dashboard.style.display = 'none';
  });

  tabMessages.addEventListener('click', () => { panelMessages.style.display=''; panelGallery.style.display='none'; });
  tabGallery.addEventListener('click', () => { panelMessages.style.display='none'; panelGallery.style.display=''; });

  function getMessages(){ try { return JSON.parse(localStorage.getItem('jain_messages_v2')) || []; } catch { return []; } }
  function setMessages(arr){ localStorage.setItem('jain_messages_v2', JSON.stringify(arr)); }
  function downloadCSV(rows, filename='messages.csv'){
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function loadMessages(){
    const msgs = getMessages();
    if (!msgs.length) { messagesList.innerHTML = '<p class="muted">No messages yet.</p>'; return; }
    messagesList.innerHTML = msgs.map((m,i) => `
      <div style="padding:0.6rem;border-radius:10px;background:var(--card);margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(m.name)}</strong>
          <small class="muted">${new Date(m.date).toLocaleString()}</small>
        </div>
        <div class="muted">${escapeHtml(m.email)}</div>
        <p style="margin-top:0.4rem">${escapeHtml(m.message)}</p>
        <div style="margin-top:0.4rem"><button data-i="${i}" class="btn btn-ghost del-msg">Delete</button></div>
      </div>
    `).join('');
    document.querySelectorAll('.del-msg').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (!confirm('Delete this message?')) return;
      const arr = getMessages(); arr.splice(i,1); setMessages(arr); loadMessages();
    }));
  }

  exportCsv.addEventListener('click', () => {
    const msgs = getMessages();
    if (!msgs.length) { alert('No messages'); return; }
    const rows = [['Name','Email','Message','Date'], ...msgs.map(m => [m.name, m.email, m.message.replace(/\n/g,' '), m.date])];
    downloadCSV(rows);
  });

  clearMsgs.addEventListener('click', () => {
    if (!confirm('Clear all messages?')) return;
    localStorage.removeItem('jain_messages_v2');
    loadMessages();
  });

  // Gallery admin
  function getGallery(){ try { return JSON.parse(localStorage.getItem('jain_gallery_v2')) || []; } catch { return []; } }
  function setGallery(arr){ localStorage.setItem('jain_gallery_v2', JSON.stringify(arr)); }

  function loadGalleryAdmin(){
    const g = getGallery();
    if (!g.length) { galleryAdminList.innerHTML = '<p class="muted">Gallery is empty.</p>'; return; }
    galleryAdminList.innerHTML = g.map((it,i) => `
      <div style="display:flex;gap:0.6rem;align-items:center;padding:0.5rem;border-radius:8px;background:var(--card);margin-bottom:0.5rem">
        <img src="${escapeAttr(it.src)}" style="width:96px;height:64px;object-fit:cover;border-radius:8px" alt="">
        <div style="flex:1">
          <div><strong>${escapeHtml(it.caption || '(no caption)')}</strong></div>
          <div class="muted">${escapeHtml(it.src)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem">
          <button data-i="${i}" class="btn btn-ghost remove-img">Remove</button>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.remove-img').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (!confirm('Remove from gallery?')) return;
      const arr = getGallery(); arr.splice(i,1); setGallery(arr); loadGalleryAdmin();
      // also notify the main page by updating localStorage; the main page reads the gallery key
    }));
  }

  addImgBtn.addEventListener('click', () => {
    const src = imgSrc.value.trim(); const cap = imgCaption.value.trim();
    if (!src) { alert('Provide image path (e.g., images/photo.jpg)'); return; }
    const g = getGallery(); g.push({ src, caption: cap }); setGallery(g); imgSrc.value=''; imgCaption.value=''; loadGalleryAdmin();
    alert('Added. If you added a file, ensure it exists in images/ folder before opening the main page.');
  });

  resetGalleryBtn.addEventListener('click', () => {
    if (!confirm('Reset gallery to default images?')) return;
    localStorage.removeItem('jain_gallery_v2');
    loadGalleryAdmin();
  });

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
});