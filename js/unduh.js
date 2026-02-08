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

let data = [];
const el = id => document.getElementById(id);
const toInt = v => parseInt(v)||0;

/* LOAD */
onSnapshot(collection(db,"wilayah_desa"), s=>{
  data = s.docs.map(d=>d.data());
});

/* GENERATE */
window.generate = function(){

  const totalKK = data.reduce((a,b)=>a+toInt(b.total_kk),0);

  /* ===== DTSEN ===== */
  let dtsen = Array(10).fill(0);
  data.forEach(d=>{
    d.desil?.forEach((v,i)=>dtsen[i]+=toInt(v));
  });

  const d610 = dtsen.slice(5).reduce((a,b)=>a+b,0);

  let html = `
  <h6 class="font-weight-bold">A. REKAP DTSEN</h6>
  <table class="table table-bordered table-sm">
  <tr><th>Desil</th><th>Jumlah</th><th>%</th></tr>`;

  for(let i=0;i<5;i++){
    html+=`<tr>
      <td>D${i+1}</td>
      <td>${dtsen[i]}</td>
      <td>${((dtsen[i]/totalKK)*100).toFixed(2)}%</td>
    </tr>`;
  }

  html+=`
  <tr>
    <td>D6–D10</td>
    <td>${d610}</td>
    <td>${((d610/totalKK)*100).toFixed(2)}%</td>
  </tr></table>`;

  /* ===== BANSOS ===== */
  let bpnt=0,pkh=0,pbi=0;
  data.forEach(d=>{
    bpnt+=toInt(d.bansos?.bpnt);
    pkh+=toInt(d.bansos?.pkh);
    pbi+=toInt(d.bansos?.pbi);
  });

  html+=`
  <h6 class="font-weight-bold">B. BANTUAN SOSIAL</h6>
  <table class="table table-bordered table-sm">
  <tr><th>Jenis</th><th>Jumlah</th><th>%</th></tr>
  <tr><td>BPNT</td><td>${bpnt}</td><td>${((bpnt/totalKK)*100).toFixed(2)}%</td></tr>
  <tr><td>PKH</td><td>${pkh}</td><td>${((pkh/totalKK)*100).toFixed(2)}%</td></tr>
  <tr><td>PBI</td><td>${pbi}</td><td>${((pbi/totalKK)*100).toFixed(2)}%</td></tr>
  </table>`;

  /* ===== PELAYANAN ===== */
  let dtks=0,peng=0,sktm=0;
  data.forEach(d=>{
    dtks+=toInt(d.layanan?.dtks);
    peng+=toInt(d.layanan?.pengaduan);
    sktm+=toInt(d.layanan?.sktm);
  });

  html+=`
  <h6 class="font-weight-bold">C. PELAYANAN SOSIAL</h6>
  <table class="table table-bordered table-sm">
  <tr><th>Jenis</th><th>Jumlah</th><th>%</th></tr>
  <tr><td>DTKS</td><td>${dtks}</td><td>${((dtks/totalKK)*100).toFixed(2)}%</td></tr>
  <tr><td>Pengaduan</td><td>${peng}</td><td>${((peng/totalKK)*100).toFixed(2)}%</td></tr>
  <tr><td>SKTM</td><td>${sktm}</td><td>${((sktm/totalKK)*100).toFixed(2)}%</td></tr>
  </table>`;

  el("kontenHal1").innerHTML = html;

  /* ===== HALAMAN 2 PRIORITAS ===== */
  const prior = data.map(d=>{
    const v=d.desil||[];
    return {nama:d.nama,total:(toInt(v[0])+toInt(v[1]))};
  }).sort((a,b)=>b.total-a.total);

  el("kontenHal2").innerHTML = `
  <table class="table table-bordered table-sm">
  <tr><th>No</th><th>Desa</th><th>D1–D2</th></tr>
  ${prior.map((d,i)=>`
    <tr><td>${i+1}</td><td>${d.nama}</td><td>${d.total}</td></tr>
  `).join("")}
  </table>`;

  generateMeta();
};

/* META */
function generateMeta(){
  const hash=Math.random().toString(36).substring(2,7).toUpperCase();
  el("hashNomor").innerText = hash;
  el("hashID").innerText = hash;
  el("tglSekarang").innerText =
    new Date().toLocaleDateString("id-ID",{dateStyle:"long"});
  const qr=el("qrcode");
  qr.innerHTML="";
  new QRCode(qr,{text:"VERIF-"+hash,width:80,height:80});
}
