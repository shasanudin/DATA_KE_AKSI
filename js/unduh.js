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
let suratCounter = 0; // counter per generate

const toInt = v => parseInt(v)||0;
const el = id => document.getElementById(id);

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", ()=>{
  loadNavbar();
  bindModeSwitch();
  startUnduh();

  // tombol generate
  const btnGen = el('btnGenerate');
  if(btnGen) btnGen.addEventListener('click', generate);

  const btnPrint = el('btnPrint');
  if(btnPrint) btnPrint.addEventListener('click', ()=>window.print());
});

function loadNavbar(){
  fetch('navbar.html').then(r=>r.text()).then(h=>{
    const nav = el('navbar');
    if(nav) nav.innerHTML = h;
  }).catch(()=>{});
}

function startUnduh(){
  onSnapshot(collection(db,"wilayah_desa"), snapshot=>{
    cachedData = snapshot.docs.map(d=>d.data());
    populateDesa();
  });
}

function populateDesa(){
  const select = el('desaSelect');
  if(!select) return;
  select.innerHTML = "";
  cachedData.sort((a,b)=> (a.nama||"").localeCompare(b.nama||""))
    .forEach((d,i)=>{
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.nama||"-";
      select.appendChild(opt);
    });
}

function bindModeSwitch(){
  const mode = el('mode');
  if(!mode) return;
  mode.addEventListener('change', e=>{
    const wrap = el('desaWrap');
    if(wrap) wrap.style.display = e.target.value==="desa" ? "block" : "none";
  });
}

// ============================
// GENERATE 4 HALAMAN
// ============================
function generate(){
  if(cachedData.length===0){ alert("Data belum siap."); return; }

  // kosongkan semua konten
  ['kontenHal1','kontenHal2','kontenHal3','kontenHal4'].forEach(id=>{
    const elId = el(id);
    if(elId) elId.innerHTML="";
  });

  generateMeta();

  // ----------------------------
  // HALAMAN 1: AGREGASI
  // ----------------------------
  const totalKK = cachedData.reduce((a,d)=>a+toInt(d.total_kk),0);
  const totalD12 = cachedData.reduce((a,d)=>{
    const dv = (d.desil||[]).map(toInt);
    return a+(dv[0]||0)+(dv[1]||0);
  },0);
  const persenD12 = totalKK ? ((totalD12/totalKK)*100).toFixed(2) : 0;

  // jumlah desil
  const sumDesil = [0,0,0,0,0,0]; // 0..4 + 5-9
  cachedData.forEach(d=>{
    const dv = (d.desil||[]).map(toInt);
    for(let i=0;i<5;i++) sumDesil[i]+= dv[i]||0;
    sumDesil[5]+= dv.slice(5,10).reduce((a,v)=>a+v,0);
  });

  el('kontenHal1').innerHTML = `
    <h5 class="text-center font-weight-bold">REKAP AGREGASI KECAMATAN</h5>
    <p>Total KK Kecamatan: <b>${totalKK.toLocaleString('id-ID')}</b></p>
    <p>D1-D2: <b>${totalD12.toLocaleString('id-ID')}</b> (${persenD12}%)</p>
    <table class="table table-bordered">
      <thead>
        <tr><th>Desil 1</th><th>Desil 2</th><th>Desil 3</th><th>Desil 4</th><th>Desil 5</th><th>Desil 6-10</th></tr>
      </thead>
      <tbody>
        <tr>${sumDesil.map(v=>`<td>${v}</td>`).join('')}</tr>
      </tbody>
    </table>
  `;

  // ----------------------------
  // HALAMAN 2: PRIORITAS D1-D2
  // ----------------------------
  const prioritas = cachedData.map(d=>{
    const dv = (d.desil||[]).map(toInt);
    const totalD12Desa = (dv[0]||0)+(dv[1]||0);
    const persen = d.total_kk ? ((totalD12Desa/toInt(d.total_kk))*100).toFixed(2) : 0;
    return {...d,totalD12Desa,persen};
  }).sort((a,b)=> b.totalD12Desa - a.totalD12Desa);

  el('kontenHal2').innerHTML = `
    <table class="table table-bordered">
      <thead>
        <tr><th>Desa</th><th>D1-D2</th><th>Persentase</th></tr>
      </thead>
      <tbody>
        ${prioritas.map(d=>`<tr><td>${d.nama}</td><td>${d.totalD12Desa}</td><td>${d.persen}%</td></tr>`).join('')}
      </tbody>
    </table>
  `;

  // ----------------------------
  // HALAMAN 3: REKAP BANSOS
  // ----------------------------
  el('kontenHal3').innerHTML = cachedData.map(d=>{
    const bansos = d.bansos||{};
    return `<p><b>${d.nama}</b></p><ul>${Object.entries(bansos).map(([k,v])=>`<li>${k}: ${v}</li>`).join('')}</ul>`;
  }).join('');

  // ----------------------------
  // HALAMAN 4: REKAP LAYANAN + QR
  // ----------------------------
  el('kontenHal4').innerHTML = cachedData.map(d=>{
    const layanan = d.layanan||{};
    return `<p><b>${d.nama}</b></p><ul>${Object.entries(layanan).map(([k,v])=>`<li>${k}: ${v}</li>`).join('')}</ul>`;
  }).join('');
}

// ============================
// META: nomor surat & QR
// ============================
function generateMeta(){
  const now = new Date();
  el('tglSekarang').innerText = now.toLocaleDateString('id-ID',{dateStyle:'long'});

  // Nomor surat: 3 digit counter
  suratCounter = (suratCounter+1)%1000;
  el('hashNomor').innerText = suratCounter.toString().padStart(3,'0');

  // QR unik
  const qrId = Math.random().toString(36).substring(2,10).toUpperCase();
  el('hashID').innerText = qrId;

  const qr = el("qrcode");
  qr.innerHTML="";
  new QRCode(qr,{text:qrId,width:80,height:80});
}
