import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot }
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain: "data-ke-aksi-auth.firebaseapp.com",
  projectId: "data-ke-aksi-auth"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= STATE ================= */
let cachedData = [];

/* ================= UTIL ================= */
const el = id => document.getElementById(id);
const toInt = v => parseInt(v) || 0;

/* ================= LOAD DATA ================= */
onSnapshot(collection(db,"wilayah_desa"), snap=>{
  cachedData = snap.docs.map(d=>d.data());
  populateDesa();
});

/* ================= DESA DROPDOWN ================= */
function populateDesa(){
  const s = el("desaSelect");
  if(!s) return;
  s.innerHTML="";
  cachedData
    .sort((a,b)=>(a.nama||"").localeCompare(b.nama||""))
    .forEach((d,i)=>{
      const o=document.createElement("option");
      o.value=i;
      o.textContent=d.nama;
      s.appendChild(o);
    });
}

/* ================= MODE SWITCH ================= */
el("mode").addEventListener("change",e=>{
  el("desaWrap").style.display =
    e.target.value==="desa" ? "block" : "none";
});

/* ================= GENERATE ================= */
window.generate = function(){

  const mode = el("mode").value;
  const konten = el("kontenData");
  const judul = el("judulLaporan");

  let html = "";

  const hitung = (d, jenis)=>{
    if(jenis==="dtsen")
      return toInt(d.desil?.[0]) + toInt(d.desil?.[1]);
    if(jenis==="bansos")
      return toInt(d.bansos?.bpnt)
           + toInt(d.bansos?.pkh)
           + toInt(d.bansos?.pbi);
    if(jenis==="layanan")
      return toInt(d.layanan?.dtks)
           + toInt(d.layanan?.pengaduan)
           + toInt(d.layanan?.sktm);
    return 0;
  };

  const jenisList = [
    {key:"dtsen",label:"A. DTSEN (D1–D2)"},
    {key:"bansos",label:"B. BANSOS"},
    {key:"layanan",label:"C. LAYANAN SOSIAL"}
  ];

  if(mode==="agregat"){

    jenisList.forEach(j=>{
      let totalKK=0, total=0;

      cachedData.forEach(d=>{
        totalKK+=toInt(d.total_kk);
        total+=hitung(d,j.key);
      });

      const persen=totalKK?((total/totalKK)*100).toFixed(2):0;

      html+=`
      <h6 class="font-weight-bold mt-3">${j.label}</h6>
      <table class="table table-bordered table-sm">
        <tr><th width="40%">Total KK</th><td>${totalKK}</td></tr>
        <tr><th>Jumlah</th><td>${total}</td></tr>
        <tr><th>Persentase</th><td>${persen}%</td></tr>
      </table>`;
    });

    judul.innerText="LAPORAN TERPADU AGREGASI KECAMATAN";
  }

  if(mode==="desa"){
    const d=cachedData[el("desaSelect").value];

    jenisList.forEach(j=>{
      const val=hitung(d,j.key);
      const persen=d.total_kk?((val/d.total_kk)*100).toFixed(2):0;

      html+=`
      <h6 class="font-weight-bold mt-3">${j.label}</h6>
      <table class="table table-bordered table-sm">
        <tr><th width="40%">Nama Desa</th><td>${d.nama}</td></tr>
        <tr><th>Jumlah</th><td>${val}</td></tr>
        <tr><th>Persentase</th><td>${persen}%</td></tr>
      </table>`;
    });

    judul.innerText="LAPORAN TERPADU DESA "+d.nama.toUpperCase();
  }

  konten.innerHTML = html;
  generateMeta();
};

/* ================= META ================= */
function generateMeta(){
  const now=new Date();
  const hash=Math.random().toString(36).substring(2,7).toUpperCase();

  el("tglSekarang").innerText =
    now.toLocaleDateString("id-ID",{dateStyle:"long"});
  el("hashNomor").innerText = hash;
  el("hashID").innerText = hash;

  const qr = el("qrcode");
  qr.innerHTML="";
  new QRCode(qr,{text:"VERIF-"+hash,width:80,height:80});
}
