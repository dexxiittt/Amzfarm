const WA = 'https://wa.me/628111612316';
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');

// Data Produk & Variasi
const P = [
  {
    id: 'pakcoy',
    name: 'Pakcoy Hidroponik',
    variants: [
      { id: '1kg', price: 30000, per: 'kg', unit: '1kg', lbl: 'Jumlah (kg)', name: 'Pakcoy Hidroponik (1 kg)' },
      { id: '250g', price: 3000, per: '250 gram', unit: '250g', lbl: 'Jumlah (250g)', name: 'Pakcoy Hidroponik (250g)' }
    ],
    selectedVariant: 0,
    note: 'Renyah, segar, dipanen sesuai pesanan.',
    img: 'https://raw.githubusercontent.com/dexxiittt/Image/main/Pokcoy.jpg'
  },
  {
    id: 'sweet',
    name: 'Sweet Mint',
    price: 10000,
    per: '50 gram',
    unit: 'pak (50 g)',
    lbl: 'Jumlah 50g',
    note: 'Aroma manis lembut untuk teh dan minuman.',
    img: 'https://raw.githubusercontent.com/dexxiittt/Image/main/Sweet%20mint.jpg'
  },
  {
    id: 'apple',
    name: 'Apple Mint',
    price: 15000,
    per: '50 gram',
    unit: 'pak (50 g)',
    lbl: 'Jumlah 50g',
    note: 'Daun berbulu dengan aroma apel yang segar.',
    img: 'https://raw.githubusercontent.com/dexxiittt/Image/main/Apple%20mint.jpg'
  }
];

// Helper untuk mendapatkan informasi detail item (dukungan variasi & item biasa)
function getItemInfo(itemKey) {
  if (itemKey.includes('-')) {
    const [pId, vId] = itemKey.split('-');
    const p = P.find(x => x.id === pId);
    if (p && p.variants) {
      const v = p.variants.find(x => x.id === vId) || p.variants[0];
      return {
        id: itemKey,
        productId: p.id,
        variantId: v.id,
        name: v.name,
        price: v.price,
        per: v.per,
        unit: v.unit
      };
    }
  }
  const p = P.find(x => x.id === itemKey);
  if (p) {
    return {
      id: p.id,
      productId: p.id,
      variantId: null,
      name: p.name,
      price: p.price,
      per: p.per,
      unit: p.unit
    };
  }
  return null;
}

// Render Produk di Halaman Utama
document.getElementById('grid').innerHTML = P.map(p => {
  const isVariant = Array.isArray(p.variants) && p.variants.length > 0;
  const currentVar = isVariant ? p.variants[p.selectedVariant || 0] : p;
  const priceDisplay = rp(currentVar.price);
  const perDisplay = currentVar.per;
  const lblDisplay = currentVar.lbl;

  let priceHtml = '';
  if (isVariant) {
    priceHtml = `
      <div class="price-dropdown-wrapper">
        <p class="text-2xl font-extrabold" style="color:var(--calm)">
          <span id="price-display-${p.id}">${priceDisplay}</span>
          <span id="per-display-${p.id}" class="text-sm font-medium" style="color:var(--muted)">/ ${perDisplay}</span>
        </p>
        <button type="button" class="variant-toggle-btn" data-act="toggle-variant" data-id="${p.id}" aria-label="Pilih variasi harga ${p.name}">
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div id="dropdown-${p.id}" class="variant-dropdown-menu hidden">
          ${p.variants.map((v, idx) => `
            <button type="button" class="variant-dropdown-item ${idx === (p.selectedVariant || 0) ? 'active' : ''}" data-act="select-variant" data-id="${p.id}" data-idx="${idx}">
              <span>${rp(v.price)} /${v.per}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    priceHtml = `
      <p class="text-2xl font-extrabold" style="color:var(--calm)">
        ${priceDisplay} <span class="text-sm font-medium" style="color:var(--muted)">/ ${perDisplay}</span>
      </p>
    `;
  }

  return `
  <article class="card flex flex-col overflow-hidden">
    <img src="${p.img}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;display:block">
    <div class="flex flex-1 flex-col gap-3 p-5">
      <div>
        <h3 class="text-xl font-extrabold">${p.name}</h3>
        <p class="text-sm" style="color:var(--muted)">${p.note}</p>
      </div>
      ${priceHtml}
      <div class="mt-auto flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <span id="lbl-${p.id}" class="text-sm font-semibold">${lblDisplay}</span>
          <div class="stepper">
            <button type="button" data-act="minus" data-id="${p.id}" aria-label="Kurangi jumlah ${p.name}">−</button>
            <input id="q-${p.id}" type="number" min="1" max="99" value="1" inputmode="numeric" aria-label="Jumlah ${p.name}" data-id="${p.id}">
            <button type="button" data-act="plus" data-id="${p.id}" aria-label="Tambah jumlah ${p.name}">+</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn alt" style="padding-inline:.5rem" data-act="add" data-id="${p.id}">+ Keranjang</button>
          <button type="button" class="btn" style="padding-inline:.5rem" data-act="buy" data-id="${p.id}">Beli sekarang</button>
        </div>
      </div>
    </div>
  </article>`;
}).join('');

const clamp = v => Math.max(1, Math.min(99, parseInt(v) || 1));
const grid = document.getElementById('grid');

// Event Listener Klik Grid Produk
grid.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); 
  if(!b) return;

  const act = b.dataset.act;
  const id = b.dataset.id;
  const p = P.find(x => x.id === id);

  // Toggle Dropdown Variasi
  if (act === 'toggle-variant') {
    e.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      document.querySelectorAll('.variant-dropdown-menu').forEach(el => {
        if (el !== dropdown) el.classList.add('hidden');
      });
      dropdown.classList.toggle('hidden');
    }
    return;
  }

  // Pilih Variasi dari Dropdown Custom
  if (act === 'select-variant') {
    e.stopPropagation();
    const idx = parseInt(b.dataset.idx);
    if (p && p.variants) {
      p.selectedVariant = idx;
      const v = p.variants[idx];

      const priceEl = document.getElementById(`price-display-${id}`);
      const perEl = document.getElementById(`per-display-${id}`);
      const lblEl = document.getElementById(`lbl-${id}`);

      if (priceEl) priceEl.textContent = rp(v.price);
      if (perEl) perEl.textContent = '/ ' + v.per;
      if (lblEl) lblEl.textContent = v.lbl;

      const dropdown = document.getElementById(`dropdown-${id}`);
      if (dropdown) {
        dropdown.querySelectorAll('.variant-dropdown-item').forEach((item, itemIdx) => {
          if (itemIdx === idx) item.classList.add('active');
          else item.classList.remove('active');
        });
        dropdown.classList.add('hidden');
      }
    }
    return;
  }

  // Stepper & Tombol Beli
  const inp = document.getElementById('q-' + id);
  let currentVal = clamp(inp ? inp.value : 1);

  if (act === 'minus') {
    currentVal = clamp(currentVal - 1);
    if(inp) inp.value = currentVal;
  }
  if (act === 'plus') {
    currentVal = clamp(currentVal + 1);
    if(inp) inp.value = currentVal;
  }
  if (act === 'add') {
    addCart(id, currentVal);
  }
  if (act === 'buy') {
    addCart(id, currentVal, true);
    openOrder();
  }
});

// Tutup Dropdown saat Klik di Luar Area
document.addEventListener('click', e => {
  if (!e.target.closest('.price-dropdown-wrapper')) {
    document.querySelectorAll('.variant-dropdown-menu').forEach(el => el.classList.add('hidden'));
  }
});

grid.addEventListener('change', e => {
  if(e.target.matches('input[data-id]')){
    e.target.value = clamp(e.target.value);
  }
});

const dlg = document.getElementById('checkoutPage'), form = document.getElementById('form');
if (document.querySelector('footer')) {
  document.querySelector('footer').before(dlg);
}

let order = [], fromCart = false;

function openOrder(){
  fromCart = true;
  if(!Object.keys(cart).length) return toast('Keranjang masih kosong');

  renderSummary();
  if(cartDlg && cartDlg.open) cartDlg.close();

  document.getElementById('formView').classList.remove('hidden');
  document.getElementById('okView').classList.add('hidden');
  document.querySelector('main').classList.add('hidden');
  dlg.classList.remove('hidden');
  window.scrollTo(0, 0);
}

document.getElementById('close').onclick = showShop;
document.getElementById('done').onclick = showShop;
document.querySelectorAll('header.top a[href^="#"]').forEach(a => a.addEventListener('click', showShop));

// Form Submit Handler
form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);

  const itemsTextArr = order.map(i => {
    const item = getItemInfo(i.id);
    if (!item) return '';
    if (i.id === 'pakcoy-1kg' || i.id === 'pakcoy') {
      return `${i.n} pakcoy (${i.n}kg)`;
    } else if (i.id === 'pakcoy-250g') {
      return `${i.n} pakcoy 250g (${i.n * 250}gram)`;
    } else if (i.id === 'sweet') {
      return `${i.n} sweet mint (${i.n * 50}gram)`;
    } else if (i.id === 'apple') {
      return `${i.n} apple mint (${i.n * 50}gram)`;
    } else {
      return `${i.n} ${item.name.toLowerCase()}`;
    }
  }).filter(Boolean);

  let daftarPesananWA = '';
  if (itemsTextArr.length === 1) {
    daftarPesananWA = itemsTextArr[0];
  } else if (itemsTextArr.length === 2) {
    daftarPesananWA = itemsTextArr.join(' dan ');
  } else if (itemsTextArr.length > 2) {
    daftarPesananWA = itemsTextArr.slice(0, -1).join(', ') + ', dan ' + itemsTextArr[itemsTextArr.length - 1];
  }

  const totalHarga = rp(total(order));
  let text = `Halo kak, pesan ${daftarPesananWA}`;

  const nama = f.get('nama');
  const alamat = f.get('alamat');
  const bayar = f.get('bayar');
  if (nama || alamat) {
    text += `\n\nDetail Pemesan:\nNama: ${nama}\nAlamat: ${alamat}\nPembayaran: ${bayar}\nTotal Belanja: ${totalHarga}`;
  }

  const waUrl = `${WA}?text=${encodeURIComponent(text)}`;

  const itemBoxesHtml = itemsTextArr.map(item => `
    <div class="p-2.5 my-1.5 rounded-xl border border-[rgba(166,232,110,0.25)] bg-[rgba(166,232,110,0.08)] text-sm font-semibold text-[var(--calm)]">
      ${item}
    </div>
  `).join('');

  document.getElementById('okItemText').innerHTML = itemBoxesHtml || '-';
  document.getElementById('okNama').textContent = nama || '-';
  document.getElementById('okBayar').textContent = bayar || '-';
  document.getElementById('okAlamat').textContent = alamat || '-';
  document.getElementById('okTotal').textContent = totalHarga;

  document.getElementById('msg').textContent = text;
  document.getElementById('waGo').href = waUrl;
  document.getElementById('formView').classList.add('hidden');
  document.getElementById('okView').classList.remove('hidden');

  window.open(waUrl, '_blank');

  form.reset();
  if(fromCart){ cart = {}; saveCart(); renderCart(); }
});

const cartDlg = document.getElementById('cartDlg');
let cart = {};
try { cart = JSON.parse(localStorage.getItem('amz-cart') || '{}') || {}; } catch(_) { cart = {}; }
Object.keys(cart).forEach(id => { if(getItemInfo(id)) cart[id] = clamp(cart[id]); else delete cart[id]; });

const saveCart = () => { try { localStorage.setItem('amz-cart', JSON.stringify(cart)); } catch(_) {} };
const cartItems = () => Object.keys(cart).map(id => ({id, n: parseInt(cart[id]) || 1}));
const total = items => items.reduce((s, i) => {
  const prod = getItemInfo(i.id);
  return s + (prod ? prod.price * i.n : 0);
}, 0);

let tt;
function toast(t){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => el.classList.remove('show'), 2200);
}

// Tambah ke Keranjang
function addCart(id, n, quiet){
  n = clamp(n);
  const p = P.find(x => x.id === id);
  let itemKey = id;
  if (p && p.variants) {
    const v = p.variants[p.selectedVariant || 0];
    itemKey = `${id}-${v.id}`;
  }

  cart[itemKey] = Math.min(99, (parseInt(cart[itemKey]) || 0) + n);
  saveCart();
  renderCart();

  const inp = document.getElementById('q-' + id);
  if(inp) inp.value = 1;

  const itemInfo = getItemInfo(itemKey);
  if(!quiet) toast((itemInfo?.name || 'Produk') + ' masuk keranjang');
}

// Render Modal Keranjang
function renderCart(){
  const ids = Object.keys(cart);
  const badge = document.getElementById('cartCount');
  const count = ids.reduce((s, id) => s + (parseInt(cart[id]) || 0), 0);
  if(badge) {
    badge.textContent = count;
    badge.style.display = count ? 'grid' : 'none';
  }

  const body = document.getElementById('cartBody');
  if(!body) return;

  if(!ids.length){
    body.innerHTML = '<p style="color:var(--muted)">Keranjang masih kosong. Pilih produk, lalu tekan “+ Keranjang”.</p><button type="button" class="btn mt-4 w-full" data-c="close">Lihat produk</button>';
    return;
  }

  body.innerHTML = ids.map(id => {
    const p = getItemInfo(id), n = parseInt(cart[id]) || 1;
    if(!p) return '';
    return `<div class="border-b py-3" style="border-color:var(--line)"><div class="flex justify-between gap-3"><div><p class="font-extrabold">${p.name}</p><p class="text-sm" style="color:var(--muted)">${rp(p.price)} / ${p.per}</p></div><p class="font-extrabold">${rp(p.price*n)}</p></div><div class="mt-2 flex items-center justify-between"><div class="stepper"><button type="button" data-c="minus" data-id="${id}" aria-label="Kurangi ${p.name}">−</button><input value="${n}" readonly aria-label="Jumlah ${p.name}"><button type="button" data-c="plus" data-id="${id}" aria-label="Tambah ${p.name}">+</button></div><button type="button" class="btn-hapus" data-c="del" data-id="${id}"><i class="fa-solid fa-trash-can"></i><span>Hapus</span></button></div></div>`;
  }).join('') + `<div class="mt-4 flex justify-between text-lg font-extrabold"><span>Total</span><span>${rp(total(cartItems()))}</span></div><button type="button" class="btn mt-4 w-full" data-c="checkout">Checkout semua</button>`;
}

function showShop(){
  dlg.classList.add('hidden');
  document.querySelector('main').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// Render Ringkasan Pesanan
function renderSummary(){
  order = cartItems();
  if(!order.length){ showShop(); toast('Keranjang masih kosong'); return; }
  document.getElementById('sumList').innerHTML = order.map(i => {
    const p = getItemInfo(i.id);
    if(!p) return '';
    return `<li class="border-b py-3" style="border-color:var(--line)"><div class="flex justify-between gap-3"><div><p class="font-extrabold">${p.name}</p><p class="text-sm" style="color:var(--muted)">${rp(p.price)} / ${p.per}</p></div><p class="font-extrabold">${rp(p.price*i.n)}</p></div><div class="mt-2 flex items-center justify-between"><div class="stepper"><button type="button" data-s="minus" data-id="${i.id}" aria-label="Kurangi ${p.name}">−</button><input value="${i.n}" readonly aria-label="Jumlah ${p.name}"><button type="button" data-s="plus" data-id="${i.id}" aria-label="Tambah ${p.name}">+</button></div><button type="button" class="btn-hapus" data-s="del" data-id="${i.id}"><i class="fa-solid fa-trash-can"></i><span>Hapus</span></button></div></li>`;
  }).join('');
  document.getElementById('sumTotal').textContent = rp(total(order));
}

document.getElementById('sumList').addEventListener('click', e => {
  const b = e.target.closest('[data-s]'); if(!b) return;
  const c = b.dataset.s, id = b.dataset.id;
  if(c==='plus') cart[id] = Math.min(99, (parseInt(cart[id])||0) + 1);
  if(c==='minus') cart[id] = Math.max(1, (parseInt(cart[id])||0) - 1);
  if(c==='del') delete cart[id];
  saveCart(); renderCart(); renderSummary();
});

document.getElementById('cartBtn').onclick = () => { renderCart(); cartDlg.showModal(); };
document.getElementById('cartClose').onclick = () => cartDlg.close();

cartDlg.addEventListener('click', e => {
  if(e.target===cartDlg) return cartDlg.close();
  const b = e.target.closest('[data-c]'); if(!b) return;
  const c = b.dataset.c, id = b.dataset.id;
  if(c==='close') return cartDlg.close();
  if(c==='checkout') return openOrder();
  if(c==='plus') cart[id] = Math.min(99, (parseInt(cart[id])||0) + 1);
  if(c==='minus') cart[id] = Math.max(1, (parseInt(cart[id])||0) - 1);
  if(c==='del') delete cart[id];
  saveCart(); renderCart();
});

renderCart();

document.getElementById('copy').onclick = async ev => {
  try { await navigator.clipboard.writeText(document.getElementById('msg').textContent); ev.target.textContent = 'Tersalin'; }
  catch(_) { ev.target.textContent = 'Salin manual dari kotak di atas'; }
};
