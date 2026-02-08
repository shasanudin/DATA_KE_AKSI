// ============================
// FIREBASE MODULAR (SAMA INDEX)
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// CONFIG SAMA PERSIS INDEX
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

let cachedData = [];

// ============================
// LOAD NAVBAR (SAMAKAN INDEX)
// ============================
fetch('navbar.html')
  .then(r => r.text())
  .then(h => document.getElementById('navbar').innerHTML = h)
  .catch(()=>{});

// ============================
// REALTIME DATA LISTENER
// ============================
function startUnduh() {

  onSnapshot(collection(db, "wilayah_desa"), (snapshot) => {

    cachedData = [];

    snapshot.forEach(doc => {
      cachedData.push(doc.data());
    });

    populateDesa();
  });

}

// ============================
// POPULATE DROPDOWN DESA
// ============================
function populateDesa() {

  const select = document.getElementById('desaSelect');

  if(!select) return;

  select.innerHTML = "";

  cachedData
    .sort((a,b)=> (a.nama||"").localeCompare(b.nama||""))
    .forEach((d,i)=>{
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.nama;
      select.appendChild(opt);
    });

}

// ============================
// MODE SWITCH
// ============================
document.getElementById('mode').addEventListener('change', e => {

  document.getElementById('desaWrap').style.display =
    e.target.value === "desa" ? "block" : "none";

});

// ============================
// GENERATE LAPORAN
// ============================
window.generate = function() {

  if(cachedData.length === 0){
    alert("Data belum siap.");
    return;
  }

  const mode = document.getElementById('mode').value;
  const konten = document.getElementById('kontenData');

  if(mode === "agregat") {

    let totalKK = 0;
    let totalD12 = 0;

    cachedData.forEach(d => {
      totalKK += parseInt(d.total_kk||0);

      if(d.desil){
        const dv = d.desil.map(v=>parseInt(v)||0);
        totalD12 += dv[0] + dv[1];
      }
    });

    konten.innerHTML = `
      <p>Total KK Kecamatan : <b>${totalKK.toLocaleString('id-ID')}</b></p>
      <p>Miskin Ekstrem D1-D2 : <b>${totalD12.toLocaleString('id-ID')}</b></p>
    `;

    document.getElementById('judulLaporan').innerText =
      "REKAP AGREGASI KECAMATAN SUMBER";
  }

  if(mode === "prioritas") {

    let rows = "";

    cachedData.forEach(d=>{

      const dv = d.desil || [];
      const prioritas =
        (parseInt(dv[0])||0)+(parseInt(dv[1])||0);

      rows += `
        <tr>
          <td>${d.nama}</td>
          <td>${prioritas.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    konten.innerHTML = `
      <table class="table table-bordered">
        <thead>
          <tr><th>Desa</th><th>D1-D2</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    document.getElementById('judulLaporan').innerText =
      "PRIORITAS DTSEN D1-D2";
  }

  if(mode === "desa") {

    const idx = document.getElementById('desaSelect').value;
    const d = cachedData[idx];

    if(!d) return;

    konten.innerHTML = `
      <p>Nama Desa : <b>${d.nama}</b></p>
      <p>Total KK : <b>${(d.total_kk||0).toLocaleString('id-ID')}</b></p>
    `;

    document.getElementById('judulLaporan').innerText =
      "REKAP DESA " + d.nama.toUpperCase();
  }

  generateMeta();

};

// ============================
// META CETAK
// ============================
function generateMeta(){

  const now = new Date();

  document.getElementById('tglSekarang').innerText =
    now.toLocaleDateString('id-ID',{dateStyle:'long'});

  const hash = Math.random().toString(36).substring(2,7).toUpperCase();

  document.getElementById('hashNomor').innerText = hash;
  document.getElementById('hashID').innerText = hash;

  document.getElementById('qrcode').innerHTML="";
  new QRCode(document.getElementById("qrcode"), {
    text: hash,
    width:80,
    height:80
  });

}

// ============================
// START
// ============================
startUnduh();
