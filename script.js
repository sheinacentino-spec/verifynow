const STORE_KEY = 'ov_employees';
let employees = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');

function subscriberSearch(){
  const q = document.getElementById('subscriberSearchInput').value.trim().toLowerCase();
  const out = document.getElementById('resultWrap');
  out.innerHTML = '';
  if(!q){
    out.innerHTML = '<div class="muted">Enter a name or ID to verify.</div>';
    return;
  }

  const found = employees.find(e => e.id.toLowerCase() === q || e.name.toLowerCase().includes(q));
  if(!found){
    out.innerHTML = '<div class="muted">No technician found.</div>';
    return;
  }

  out.innerHTML = `
    <div class="result-card">
      <img class="result-photo" src="${found.img}" alt="${found.name}">
      <div class="result-info">
        <h3>${found.name}</h3>
        <p><strong>ID:</strong> ${found.id}</p>
        <p><strong>Position:</strong> ${found.pos}</p>
        <div class="verified-pill">✅ Verified — Olympian ICT Technician</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <img src="${found.qr}" width="92" style="border-radius:8px;background:rgba(255,255,255,0.02)"/>
        <button class="btn-verify" onclick="openProfileModal('${found.id}')">Open Profile</button>
      </div>
    </div>
  `;
}

/* ADMIN LOGIC */
const ADMIN_PW = 'Olympian2025';
document.getElementById('adminBtn').addEventListener('click', openAdminLoginModal);

function openAdminLoginModal(){
  if(document.getElementById('adminOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.className = 'modal-backdrop';
  overlay.innerHTML = `
    <div class="modal-card">
      <h3 style="color:var(--mustard)">Admin Access</h3>
      <input id="adminPasswordInput" type="password" placeholder="Enter Password"
        style="width:80%;padding:10px;margin-top:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:white">
      <button class="btn-verify" style="margin-top:12px" id="submitAdmin">Unlock</button>
      <button class="close-modal" onclick="document.body.removeChild(this.parentElement.parentElement)">Close</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('submitAdmin').addEventListener('click', verifyAdminPassword);
}

function verifyAdminPassword(){
  const pw = document.getElementById('adminPasswordInput').value;
  if(pw === ADMIN_PW){ openAdminPanel(); }
  else alert('Incorrect password');
}

/* ADMIN PANEL */
function openAdminPanel(){
  document.querySelector('.modal-backdrop').remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop';
  overlay.innerHTML = `
    <div class="modal-card" style="width:90%;max-width:900px;text-align:left;">
      <h3 style="color:var(--mustard)">Admin Panel</h3>
      <p style="opacity:0.8;">Manage technicians (add, delete, or view)</p>
      <input id="a_id" placeholder="Employee ID" style="padding:8px;border-radius:8px;width:140px">
      <input id="a_name" placeholder="Full Name" style="padding:8px;border-radius:8px;width:220px">
      <input id="a_pos" placeholder="Position" style="padding:8px;border-radius:8px;width:180px">
      <input id="a_img" type="file" accept="image/*" style="color:white">
      <button class="btn-verify" id="a_add">Add & Generate QR</button>
      <div id="adminGrid" style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;"></div>
      <button class="close-modal" onclick="document.body.removeChild(this.parentElement.parentElement)">Close Admin</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('a_add').addEventListener('click', adminAddEmployee);
  renderAdminGrid();
}

function adminAddEmployee(){
  const id = a_id.value.trim(), name = a_name.value.trim(), pos = a_pos.value.trim() || 'Technician';
  const file = a_img.files[0];
  if(!id || !name || !file){ alert('Fill all fields & upload an image.'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    const img = e.target.result;
    const qr = new QRious({
      value: window.location.href.split('?')[0] + '?id=' + encodeURIComponent(id),
      size: 160
    });
    employees.push({ id, name, pos, img, qr: qr.toDataURL() });
    localStorage.setItem(STORE_KEY, JSON.stringify(employees));
    renderAdminGrid();
  };
  reader.readAsDataURL(file);
}

function renderAdminGrid(){
  const grid = document.getElementById('adminGrid');
  if(!grid) return;
  grid.innerHTML = employees.map((e,i)=>`
    <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;text-align:center">
      <img src="${e.img}" style="width:90px;height:90px;border-radius:10px;object-fit:cover">
      <div style="color:var(--mustard);font-weight:700;margin-top:6px">${e.name}</div>
      <div style="font-size:13px;">${e.id}</div>
      <div style="font-size:13px;opacity:0.8">${e.pos}</div>
      <img src="${e.qr}" width="80" style="margin-top:6px;border-radius:8px">
      <div style="margin-top:8px;">
        <button class="btn-verify" onclick="openProfileModal('${e.id}')">Open</button>
        <button class="btn-verify" style="background:#d44;color:white" onclick="adminDelete(${i})">Delete</button>
      </div>
    </div>`).join('');
}

function adminDelete(i){
  if(confirm('Delete this technician?')) {
    employees.splice(i,1);
    localStorage.setItem(STORE_KEY, JSON.stringify(employees));
    renderAdminGrid();
  }
}

/* MODAL PROFILE VIEW */
function openProfileModal(id){
  const e = employees.find(x=>x.id===id);
  if(!e){ alert('Technician not found'); return; }
  const m = document.createElement('div');
  m.className = 'modal-backdrop';
  m.innerHTML = `
    <div class="modal-card">
      <img src="${e.img}">
      <h3>${e.name}</h3>
      <p><strong>ID:</strong> ${e.id}</p>
      <p>${e.pos}</p>
      <p style="color:#bfffe0;font-weight:700">✅ Verified Olympian ICT Technician</p>
      <img src="${e.qr}" width="100" style="border-radius:8px;margin-top:8px">
      <button class="close-modal" onclick="document.body.removeChild(this.parentElement.parentElement)">Close</button>
    </div>`;
  document.body.appendChild(m);
}

/* Support QR deep link */
(function(){
  const id = new URLSearchParams(location.search).get('id');
  if(!id) return;
  setTimeout(()=>{
    const e = employees.find(x=>x.id===id);
    if(e) openProfileModal(id);
    else {
      const m=document.createElement('div');
      m.className='modal-backdrop';
      m.innerHTML='<div class="modal-card"><h3>Technician Not Found</h3><button class="close-modal" onclick="document.body.removeChild(this.parentElement.parentElement)">Close</button></div>';
      document.body.appendChild(m);
    }
  },200);
})();
