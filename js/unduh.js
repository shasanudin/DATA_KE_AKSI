import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot }
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/* FIREBASE */
const app = initializeApp({
  apiKey:"AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain:"data-ke-aksi-auth.firebaseapp.com",
  projectId:"data-ke-aksi-auth"
});
const db = getFirestore(app);

/* STATE */
let data = [];
const el = id => document.getElementById(id);
const toInt = v => parseInt(v)||0;

/* LOAD DATA REALTIME */
onSnapshot(collection(db,"wilayah_desa"), s=>{
  data = s.docs.map(d=>{
    return {...d.data(), id: d.id};
  });
});

/* GENERATE LAPORAN */
window.generate = function(){

  if(!data.length){
    alert("Data belum tersedia.");
    return;
  }

  const totalKK = data.reduce((a,b)=>a+toInt(b.total_kk),0);

  /* ===== HALAMAN 1: DTSEN + Persentase ===== */
  let dtsen = Array(10).fill(0);
  data.forEach(d=>{
    d.desil?.forEach((v,i)=>dtsen[i]+=toInt(v));
  });
  const d610 = dtsen.slice(5).reduce((a,b)=>a+b,0);

  let html1 = `<h6 class="font-weight-bold">A. REKAP DTSEN</h6>
  <table class="table table-bordered table-sm">
  <tr><th>Desil</th><th>Jumlah</th><th>% dari Total KK</th></tr>`;

  for(let i=0;i<5;i++){
    html1+=`<tr>
      <td>D${i+1}</td>
      <td>${dtsen[i]}</td>
      <td>${((dtsen[i]/totalKK)*100).toFixed(2)}%</td>
    </tr>`;
  }

  html1+=`<tr>
    <td>D6–D10</td>
    <td>${d610}</td>
    <td>${((d610/totalKK)*100).toFixed(2)}%</td>
  </tr></table>`;

  el("kontenHal1").innerHTML = html1;

  /* ===== HALAMAN 2: PRIORITAS DESA (D1+D2) ===== */
  const prior = data.map(d=>{
    const v=d.desil||[];
    return {nama:d.nama,total:(toInt(v[0])+toInt(v[1]))};
  }).sort((a,b)=>b.total-a.total);

  el("kontenHal2").innerHTML = `
  <h6 class="font-weight-bold">B. PRIORITAS DESA (D1+D2)</h6>
  <table class="table table-bordered table-sm">
  <tr><th>No</th><th>Desa</th><th>D1–D2</th></tr>
  ${prior.map((d,i)=>`
    <tr><td>${i+1}</td><td>${d.nama}</td><td>${d.total}</td></tr>
  `).join("")}
  </table>`;

  /* ===== HALAMAN 3: REKAP BANSOS PERDESA ===== */
  let html3 = `<h6 class="font-weight-bold">C. REKAP BANSOS PER DESA</h6>
  <table class="table table-bordered table-sm">
  <tr><th>No</th><th>Desa</th><th>BPNT</th><th>PKH</th><th>PBI</th></tr>`;
  data.forEach((d,i)=>{
    html3+=`<tr>
      <td>${i+1}</td>
      <td>${d.nama}</td>
      <td>${toInt(d.bansos?.bpnt)}</td>
      <td>${toInt(d.bansos?.pkh)}</td>
      <td>${toInt(d.bansos?.pbi)}</td>
    </tr>`;
  });
  html3+=`</table>`;
  el("kontenHal3").innerHTML = html3;

  /* ===== HALAMAN 4: REKAP PELAYANAN PERDESA ===== */
  let html4 = `<h6 class="font-weight-bold">D. REKAP PELAYANAN PER DESA</h6>
  <table class="table table-bordered table-sm">
  <tr><th>No</th><th>Desa</th><th>DTKS</th><th>Pengaduan</th><th>SKTM</th></tr>`;
  data.forEach((d,i)=>{
    html4+=`<tr>
      <td>${i+1}</td>
      <td>${d.nama}</td>
      <td>${toInt(d.layanan?.dtks)}</td>
      <td>${toInt(d.layanan?.pengaduan)}</td>
      <td>${toInt(d.layanan?.sktm)}</td>
    </tr>`;
  });
  html4+=`</table>`;
  el("kontenHal4").innerHTML = html4;

  generateMeta();
};

/* META: Nomor surat 3 digit + QR Code ECSDA */
function generateMeta(){
  // Nomor surat: 3 digit
  const nomor3 = Math.floor(100 + Math.random()*900); // 100–999
  el("hashNomor").innerText = nomor3;

  // ID verifikasi unik untuk QR
  const idVerif = "ECSDA-" + Math.floor(10000 + Math.random()*90000);
  el("hashID").innerText = idVerif;

  el("tglSekarang").innerText =
    new Date().toLocaleDateString("id-ID",{dateStyle:"long"});

  const qr=el("qrcode");
  qr.innerHTML="";
  new QRCode(qr,{
    text: idVerif,
    width:80,
    height:80
  });
}
