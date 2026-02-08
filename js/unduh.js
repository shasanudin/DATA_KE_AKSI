import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot }
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain: "data-ke-aksi-auth.firebaseapp.com",
  projectId: "data-ke-aksi-auth"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STATE =================
let cachedData = [];

// ================= UTIL =================
const el = id => document.getElementById(id);
const toInt = v => parseInt(v) || 0;

// ================= LOAD DATA =================
onSnapshot(collection(db,"wilayah_desa"), snap=>{
  cachedData = snap.docs.map(d=>d.data());
  populateDesa();
});

// ================= DESA DROPDOWN =================
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

// ================= MODE SWITCH =================
el("mode").addEventListener("change",e=>{
  el("desaWrap").style.display =
    e.target.value==="desa" ? "block" : "none";
});

// ================= GENERATE =================
window.generate = function(){

  if(cachedData.length===0){
    alert("Data belum siap");
    return;
  }

  const mode = el("mode").value;
  const jenis = el("jenisLaporan").value;
  const konten = el("kontenData");
  const judul = el("judulLaporan");

  // ========== AGREGASI KECAMATAN ==========
  if(mode==="agregat"){

    let totalKK=0, total=0;

    cachedData.forEach(d=>{
      totalKK += toInt(d.total_kk);

      if(jenis==="dtsen"){
        total += toInt(d.desil?.[0]) + toInt(d.desil?.[1]);
      }
      if(jenis==="bansos"){
        total += toInt(d.bansos?.bpnt)
               + toInt(d.bansos?.pkh)
               + toInt(d.bansos?.pbi);
      }
      if(jenis==="layanan"){
        total += toInt(d.layanan?.dtks)
               + toInt(d.layanan?.pengaduan)
               + toInt(d.layanan?.sktm);
      }
    });

    const persen = totalKK ? ((total/totalKK)*100).toFixed(2) : 0;

    konten.innerHTML = `
    <table class="table table-bordered">
      <tr><th width="40%">Total KK Kecamatan</th><td>${totalKK}</td></tr>
      <tr><th>Total ${jenis.toUpperCase()}</th><td>${total}</td></tr>
      <tr><th>Persentase</th><td>${persen}%</td></tr>
    </table>`;

    judul.innerText = "AGREGASI KECAMATAN - " + jenis.toUpperCase();
  }

  // ========== PRIORITAS ==========
  if(mode==="prioritas"){

    const rows = cachedData
      .map(d=>{
        let val=0;
        if(jenis==="dtsen")
          val = toInt(d.desil?.[0]) + toInt(d.desil?.[1]);
        if(jenis==="bansos")
          val = toInt(d.bansos?.bpnt)
              + toInt(d.bansos?.pkh)
              + toInt(d.bansos?.pbi);
        if(jenis==="layanan")
          val = toInt(d.layanan?.dtks)
              + toInt(d.layanan?.pengaduan)
              + toInt(d.layanan?.sktm);

        return {nama:d.nama,val,total_kk:d.total_kk};
      })
      .sort((a,b)=>b.val-a.val)
      .map(d=>{
        const p=d.total_kk?((d.val/d.total_kk)*100).toFixed(2):0;
        return `
        <tr>
          <td>${d.nama}</td>
          <td class="text-right">${d.val}</td>
          <td class="text-right">${p}%</td>
        </tr>`;
      }).join("");

    konten.innerHTML = `
    <table class="table table-bordered table-sm">
      <thead>
        <tr>
          <th>Desa</th>
          <th>Jumlah</th>
          <th>% dari KK</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

    judul.innerText = "PRIORITAS DESA - " + jenis.toUpperCase();
  }

  // ========== REKAP DESA ==========
  if(mode==="desa"){

    const d = cachedData[el("desaSelect").value];
    let total=0;

    if(jenis==="dtsen")
      total = toInt(d.desil?.[0]) + toInt(d.desil?.[1]);
    if(jenis==="bansos")
      total = toInt(d.bansos?.bpnt)
            + toInt(d.bansos?.pkh)
            + toInt(d.bansos?.pbi);
    if(jenis==="layanan")
      total = toInt(d.layanan?.dtks)
            + toInt(d.layanan?.pengaduan)
            + toInt(d.layanan?.sktm);

    const persen = d.total_kk
      ? ((total/d.total_kk)*100).toFixed(2)
      : 0;

    konten.innerHTML = `
    <table class="table table-bordered table-sm">
      <tr><th width="40%">Nama Desa</th><td>${d.nama}</td></tr>
      <tr><th>Total KK</th><td>${d.total_kk}</td></tr>
      <tr><th>Total ${jenis.toUpperCase()}</th><td>${total}</td></tr>
      <tr><th>Persentase</th><td>${persen}%</td></tr>
    </table>`;

    judul.innerText = "REKAP DESA " + d.nama.toUpperCase();
  }
};
