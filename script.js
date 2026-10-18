const WA = 'https://wa.me/628111612316';
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const P = [
  {id:'pakcoy', name:'Pakcoy Hidroponik', price:30000, per:'kg', unit:'kg', lbl:'Jumlah (kg)', note:'Renyah, segar, dipanen sesuai pesanan.', img:'https://raw.githubusercontent.com/dexxiittt/Image/main/Pokcoy.jpg'},
  {id:'sweet', name:'Sweet Mint', price:10000, per:'50 gram', unit:'pak (50 g)', lbl:'Jumlah 50g', note:'Aroma manis lembut untuk teh dan minuman.', img:'https://raw.githubusercontent.com/dexxiittt/Image/main/Sweet%20mint.jpg'},
  {id:'apple', name:'Apple Mint', price:15000, per:'50 gram', unit:'pak (50 g)', lbl:'Jumlah 50g', note:'Daun berbulu dengan aroma apel yang segar.', img:'https://raw.githubusercontent.com/dexxiittt/Image/main/Apple%20mint.jpg'}
];

// Render produk di halaman utama
document.getElementById('grid').innerHTML = P.map(p => `
  <article class="card flex flex-col overflow-hidden">
    <img src="${p.img}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;display:block">
    <div class="flex flex-1 flex-col gap-3 p-5">
      <div>
        <h3 class="text-xl font-extrabold">${p.name}</h3>
        <p class="text-sm" style="color:var(--muted)">${p.note}</p>
      </div>
      <p class="text-2xl font-extrabold" style="color:var(--calm)">${rp(p.price)} <span class="text-sm font-medium" style="color:var(--muted)">/ ${p.per}</span></p>
      <div class="mt-auto flex flex-col gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold">${p.lbl}</span>
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
  </article>`).join('');

const clamp = v => Math.max(1, Math.min(99, parseInt(v) || 1));
const grid = document.getElementById('grid');

// Handler tombol stepper (+ / -), + Keranjang, dan Beli Sekarang
grid.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if(!b) return;
  const id = b.dataset.id;
  const inp = document.getElementById('q-' + id);
  let currentVal = clamp(inp ? inp.value : 1);

  if(b.dataset.act === 'minus') {
    currentVal = clamp(currentVal - 1);
    if(inp) inp.value = currentVal;
  }
  if(b.dataset.act === 'plus') {
    currentVal = clamp(currentVal + 1);
    if(inp) inp.value = currentVal;
  }
  if(b.dataset.act === 'add') {
    addCart(id, currentVal);
  }
  if(b.dataset.act === 'buy') {
    addCart(id, currentVal, true);
    openOrder();
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

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);

  const itemsText = order.map(i => {
    const p = P.find(x => x.id === i.id);
    let name = p ? p.name : i.id;
    if (i.id === 'pakcoy') name = 'pokcoy';
    else name = name.toLowerCase();
    return `${i.n} ${name}`;
  });

  let daftarPesanan = '';
  if (itemsText.length === 1) {
    daftarPesanan = itemsText[0];
  } else if (itemsText.length === 2) {
    daftarPesanan = itemsText.join(' dan ');
  } else if (itemsText.length > 2) {
    daftarPesanan = itemsText.slice(0, -1).join(', ') + ', dan ' + itemsText[itemsText.length - 1];
  }

  const totalHarga = rp(total(order));
  let text = `Halo kak, pesan ${daftarPesanan}`;

  const nama = f.get('nama');
  const alamat = f.get('alamat');
  const bayar = f.get('bayar');
  if (nama || alamat) {
    text += `\n\nDetail Pemesan:\nNama: ${nama}\nAlamat: ${alamat}\nPembayaran: ${bayar}\nTotal Belanja: ${totalHarga}`;
  }

  const waUrl = `${WA}?text=${encodeURIComponent(text)}`;

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
Object.keys(cart).forEach(id => { if(P.some(p => p.id===id)) cart[id] = clamp(cart[id]); else delete cart[id]; });

const saveCart = () => { try { localStorage.setItem('amz-cart', JSON.stringify(cart)); } catch(_) {} };
const cartItems = () => Object.keys(cart).map(id => ({id, n: parseInt(cart[id]) || 1}));
const total = items => items.reduce((s, i) => {
  const prod = P.find(p => p.id===i.id);
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

// Fungsi Tambah Keranjang
function addCart(id, n, quiet){
  n = clamp(n);
  cart[id] = Math.min(99, (parseInt(cart[id]) || 0) + n);
  saveCart();
  renderCart();

  const inp = document.getElementById('q-' + id);
  if(inp) inp.value = 1;

  if(!quiet) toast((P.find(p => p.id===id)?.name || 'Produk') + ' masuk keranjang');
}

// Render Item di Modal Keranjang
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
    const p = P.find(x => x.id===id), n = parseInt(cart[id]) || 1;
    if(!p) return '';
    return `<div class="border-b py-3" style="border-color:var(--line)"><div class="flex justify-between gap-3"><div><p class="font-extrabold">${p.name}</p><p class="text-sm" style="color:var(--muted)">${rp(p.price)} / ${p.per}</p></div><p class="font-extrabold">${rp(p.price*n)}</p></div><div class="mt-2 flex items-center justify-between"><div class="stepper"><button type="button" data-c="minus" data-id="${id}" aria-label="Kurangi ${p.name}">−</button><input value="${n}" readonly aria-label="Jumlah ${p.name}"><button type="button" data-c="plus" data-id="${id}" aria-label="Tambah ${p.name}">+</button></div><button type="button" class="btn-hapus" data-c="del" data-id="${id}"><i class="fa-solid fa-trash-can"></i><span>Hapus</span></button></div></div>`;
  }).join('') + `<div class="mt-4 flex justify-between text-lg font-extrabold"><span>Total</span><span>${rp(total(cartItems()))}</span></div><button type="button" class="btn mt-4 w-full" data-c="checkout">Checkout semua</button>`;
}

function showShop(){
  dlg.classList.add('hidden');
  document.querySelector('main').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// Render Ringkasan Pesanan di Halaman Checkout
function renderSummary(){
  order = cartItems();
  if(!order.length){ showShop(); toast('Keranjang masih kosong'); return; }
  document.getElementById('sumList').innerHTML = order.map(i => {
    const p = P.find(x => x.id===i.id);
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
