// ============================
// FIREBASE MODULAR
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ============================
// CONFIG
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain: "data-ke-aksi-auth.firebaseapp.com",
  projectId: "data-ke-aksi-auth",
  storageBucket: "data-ke-aksi-auth.firebasestorage.app",
  messagingSenderId: "631382692174",
  appId: "1:631382692174:web:c10a099fb3021849eace1f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// STATE
// ============================
let cachedData = [];

// ============================
// UTIL
// ============================
const toInt = v => parseInt(v) || 0;
const el = id => document.getElementById(id);

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {

  loadNavbar();
  bindModeSwitch();
  startUnduh();

});

// ============================
// NAVBAR
// ============================
function loadNavbar() {

  fetch('navbar.html')
    .then(r => r.text())
    .then(h => {
      const nav = el('navbar');
      if(nav) nav.innerHTML = h;
    })
    .catch(()=>{});

}

// ============================
// REALTIME LISTENER
// ============================
function startUnduh() {

  onSnapshot(collection(db, "wilayah_desa"), (snapshot) => {

    cachedData = snapshot.docs.map(d => d.data());
    populateDesa();

  });

}

// ============================
// DROPDOWN DESA
// ============================
function populateDesa() {

  const select = el('desaSelect');
  if(!select) return;

  select.innerHTML = "";

  cachedData
    .sort((a,b)=> (a.nama||"").localeCompare(b.nama||""))
    .forEach((d,i)=>{

      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.nama || "-";
      select.appendChild(opt);

    });

}

// ============================
// MODE SWITCH
// ============================
function bindModeSwitch(){

  const mode = el('mode');
  if(!mode) return;

  mode.addEventListener('change', e => {

    const wrap = el('desaWrap');
    if(wrap){
      wrap.style.display =
        e.target.value === "desa" ? "block" : "none";
    }

  });

}

// ============================
// GENERATE
// ============================
window.generate = function(){

  if(cachedData.length === 0){
    alert("Data belum siap.");
    return;
  }

  const mode = el('mode').value;
  const konten = el('kontenData');
  const judul = el('judulLaporan');

  if(!konten || !judul) return;

  // ============================
  // AGREGAT
  // ============================
  if(mode === "agregat"){

    const result = cachedData.reduce((acc,d)=>{

      acc.totalKK += toInt(d.total_kk);

      if(d.desil){
        const dv = d.desil.map(toInt);
        acc.totalD12 += (dv[0]||0)+(dv[1]||0);
      }

      return acc;

    },{totalKK:0,totalD12:0});

    konten.innerHTML = `
      <p>Total KK Kecamatan : <b>${result.totalKK.toLocaleString('id-ID')}</b></p>
      <p>Miskin Ekstrem D1-D2 : <b>${result.totalD12.toLocaleString('id-ID')}</b></p>
    `;

    judul.innerText = "REKAP AGREGASI KECAMATAN SUMBER";
  }

  // ============================
  // PRIORITAS
  // ============================
  if(mode === "prioritas"){

    const rows = cachedData.map(d=>{

      const dv = (d.desil||[]).map(toInt);
      const total = (dv[0]||0)+(dv[1]||0);

      return `
        <tr>
          <td>${d.nama||"-"}</td>
          <td>${total.toLocaleString('id-ID')}</td>
        </tr>
      `;

    }).join("");

    konten.innerHTML = `
      <table class="table table-bordered">
        <thead>
          <tr><th>Desa</th><th>D1-D2</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    judul.innerText = "PRIORITAS DTSEN D1-D2";
  }

  // ============================
  // DESA
  // ============================
  if(mode === "desa"){

    const idx = el('desaSelect').value;
    const d = cachedData[idx];
    if(!d) return;

    konten.innerHTML = `
      <p>Nama Desa : <b>${d.nama}</b></p>
      <p>Total KK : <b>${toInt(d.total_kk).toLocaleString('id-ID')}</b></p>
    `;

    judul.innerText = "REKAP DESA " + (d.nama||"").toUpperCase();
  }

  generateMeta();

};

// ============================
// META
// ============================
function generateMeta(){

  const now = new Date();
  const hash = Math.random().toString(36).substring(2,7).toUpperCase();

  el('tglSekarang').innerText =
    now.toLocaleDateString('id-ID',{dateStyle:'long'});

  el('hashNomor').innerText = hash;
  el('hashID').innerText = hash;

  const qr = el("qrcode");
  qr.innerHTML="";

  new QRCode(qr,{
    text:hash,
    width:80,
    height:80
  });

}
