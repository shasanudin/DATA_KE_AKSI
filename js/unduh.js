import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from
"https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain: "data-ke-aksi-auth.firebaseapp.com",
  projectId: "data-ke-aksi-auth"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cachedData = [];

const el = id => document.getElementById(id);
const toInt = v => parseInt(v) || 0;

onSnapshot(collection(db,"wilayah_desa"), snap=>{
  cachedData = snap.docs.map(d=>d.data());
  populateDesa();
});

function populateDesa(){
  const s = el("desaSelect");
  s.innerHTML="";
  cachedData
    .sort((a,b)=>a.nama.localeCompare(b.nama))
    .forEach((d,i)=>{
      const o=document.createElement("option");
      o.value=i; o.textContent=d.nama;
      s.appendChild(o);
    });
}

el("mode").addEventListener("change",e=>{
  el("desaWrap").style.display =
    e.target.value==="desa"?"block":"none";
});

window.generate = function(){

  const mode = el("mode").value;
  const konten = el("kontenData");
  const judul = el("judulLaporan");

  // ================= AGREGAT =================
  if(mode==="agregat"){

    let totalKK=0, totalD12=0;

    cachedData.forEach(d=>{
      totalKK+=toInt(d.total_kk);
      if(d.desil){
        totalD12+=toInt(d.desil[0])+toInt(d.desil[1]);
      }
    });

    const persen = totalKK
      ? ((totalD12/totalKK)*100).toFixed(2)
      : 0;

    konten.innerHTML=`
    <table class="table table-bordered">
      <tr><th>Total KK</th><td>${totalKK}</td></tr>
      <tr><th>D1–D2</th><td>${totalD12}</td></tr>
      <tr><th>Persentase</th><td>${persen}%</td></tr>
    </table>`;

    judul.innerText="REKAP AGREGASI KECAMATAN";
  }

  // ================= PRIORITAS =================
  if(mode==="prioritas"){

    const rows = cachedData
      .map(d=>{
        const d12 = d.desil
          ? toInt(d.desil[0])+toInt(d.desil[1]) : 0;
        const persen = d.total_kk
          ? ((d12/d.total_kk)*100).toFixed(2) : 0;
        return {...d,d12,persen};
      })
      .sort((a,b)=>b.d12-a.d12)
      .map(d=>`
        <tr>
          <td>${d.nama}</td>
          <td class="text-right">${d.d12}</td>
          <td class="text-right">${d.persen}%</td>
        </tr>
      `).join("");

    konten.innerHTML=`
    <table class="table table-bordered table-sm">
      <thead>
        <tr>
          <th>Desa</th>
          <th>D1–D2</th>
          <th>% dari KK</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

    judul.innerText="PRIORITAS DTSEN D1–D2";
  }

  // ================= DESA =================
  if(mode==="desa"){

    const d = cachedData[el("desaSelect").value];
    const d12 = d.desil
      ? toInt(d.desil[0])+toInt(d.desil[1]) : 0;
    const persen = d.total_kk
      ? ((d12/d.total_kk)*100).toFixed(2) : 0;

    konten.innerHTML=`
    <table class="table table-bordered table-sm">
      <tr><th>Nama Desa</th><td>${d.nama}</td></tr>
      <tr><th>Total KK</th><td>${d.total_kk}</td></tr>
      <tr><th>D1–D2</th><td>${d12}</td></tr>
      <tr><th>Persentase</th><td>${persen}%</td></tr>
    </table>`;

    judul.innerText="REKAP DESA "+d.nama.toUpperCase();
  }

  meta();
};

function meta(){
  const now=new Date();
  const hash=Math.random().toString(36).substring(2,7).toUpperCase();
  el("tglSekarang").innerText =
    now.toLocaleDateString("id-ID",{dateStyle:"long"});
  el("hashNomor").innerText=hash;
  el("hashID").innerText=hash;

  el("qrcode").innerHTML="";
  new QRCode(el("qrcode"),{text:hash,width:80,height:80});
}
