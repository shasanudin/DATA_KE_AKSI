let globalData;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const res = await fetch('data/dtsen.json');
        globalData = await res.json();
        
        document.getElementById('periodeText').innerText = globalData.updated;
        document.getElementById('tglSekarang').innerText = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});

        const sel = document.getElementById('wilayahSelect');
        if (sel) {
            globalData.wilayah.forEach((w, i) => {
                let opt = document.createElement('option');
                opt.value = i; opt.textContent = w.nama;
                sel.appendChild(opt);
            });
        }

        const tipeLaporan = document.getElementById('tipeLaporan');
        if (tipeLaporan) {
            tipeLaporan.addEventListener('change', (e) => {
                const container = document.getElementById('selectWilayahContainer');
                container.style.display = (e.target.value === 'wilayah') ? 'block' : 'none';
            });
        }
    } catch (err) {
        console.error("Gagal memuat aplikasi:", err);
    }
}

function generateReport() {
    if (!globalData) return alert("Data sedang dimuat...");

    const tipe = document.getElementById('tipeLaporan').value;
    const konten = document.getElementById('kontenData');
    const judul = document.getElementById('judulLaporan');
    let html = "";
    let msgPayload = ""; // Ini data yang akan divalidasi oleh verifikasi.html
    let reportID = "DTSEN-" + Date.now(); // Generate ID unik

    const formatNum = (n) => n.toLocaleString('id-ID');

    if (tipe === 'agregat') {
        judul.innerText = "LAPORAN AGREGASI DTSEN KECAMATAN SUMBER";
        let agregat = Array(10).fill(0);
        let grandTotal = 0;
        globalData.wilayah.forEach(w => {
            grandTotal += w.total_kk;
            w.desil.forEach((v, i) => { agregat[i] += v; });
        });

        html = renderTable(['KATEGORI', 'JUMLAH KK', 'PERSENTASE'], 
            [...Array(5).keys()].map(i => [`Desil ${i+1}`, formatNum(agregat[i]), ((agregat[i]/grandTotal)*100).toFixed(1) + '%'])
            .concat([
                ['Desil 6-10', formatNum(agregat.slice(5).reduce((a,b)=>a+b,0)), ((agregat.slice(5).reduce((a,b)=>a+b,0)/grandTotal)*100).toFixed(1) + '%'],
                [`<strong>TOTAL</strong>`, `<strong>${formatNum(grandTotal)}</strong>`, '100%']
            ])
        );
        msgPayload = `Kec-Sumber-TotalKK:${grandTotal}-Tgl:${globalData.updated}`;

    } else if (tipe === 'prioritas') {
        judul.innerText = "DAFTAR PRIORITAS INTERVENSI SOSIAL (D1-D2)";
        let ranking = globalData.wilayah.map(w => ({
            n: w.nama,
            v: w.desil[0] + w.desil[1],
            p: (((w.desil[0] + w.desil[1])/w.total_kk)*100).toFixed(1)
        })).sort((a,b) => b.v - a.v);

        html = renderTable(['RANK', 'DESA/KELURAHAN', 'JUMLAH D1-2', '% KERENTANAN'], 
            ranking.map((r, i) => [i+1, r.n, formatNum(r.v), r.p + '%'])
        );
        msgPayload = `Prioritas-Kec-Sumber-DesaCount:${ranking.length}`;

    } else {
        const w = globalData.wilayah[document.getElementById('wilayahSelect').value];
        judul.innerText = `LAPORAN DETAIL WILAYAH: ${w.nama}`;
        const d610 = w.desil.slice(5).reduce((a,b)=>a+b,0);

        html = renderTable(['PARAMETER', 'JUMLAH KK', 'PERSENTASE'], [
            ['Total KK', formatNum(w.total_kk), '100%'],
            ['Sangat Miskin (D1)', formatNum(w.desil[0]), ((w.desil[0]/w.total_kk)*100).toFixed(1) + '%'],
            ['Mampu (D6-10)', formatNum(d610), ((d610/w.total_kk)*100).toFixed(1) + '%']
        ]);
        msgPayload = `Wilayah-${w.nama}-TotalKK:${w.total_kk}`;
    }

    konten.innerHTML = html;
    
    // Tampilkan instruksi untuk penandatanganan
    prepareQR(reportID, msgPayload);
}

function renderTable(headers, rows) {
    return `<table class="table table-bordered table-sm text-center">
        <thead class="thead-light"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

// FUNGSI SINKRONISASI DENGAN VERIFIKASI.HTML
function prepareQR(id, msg) {
    // 1. Update Hash ID di tampilan
    const hash = btoa(id).substring(0, 10).toUpperCase();
    document.getElementById('hashID').innerText = `ID: ${hash}`;

    // 2. Minta Signature (Di dunia nyata, Anda menempelkan Signature dari signer.html ke sini)
    // Untuk keperluan demo/pengembangan, kita tampilkan MSG yang harus di-sign
    console.log("MSG untuk Signer:", msg);
    
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = `<small class="text-muted">Siap Cetak</small>`;

    // PENTING: Untuk menghasilkan QR yang valid di verifikasi.html, 
    // Anda harus menjalankan signer.html, lalu masukkan JSON-nya ke variabel di bawah ini:
    
    /* let finalPayload = {
        id: id,
        msg: msg,
        sig: "HASIL_DARI_SIGNER_HTML"
    };
    new QRCode(qrDiv, { text: JSON.stringify(finalPayload), width: 90, height: 90 });
    */
    
    // Sementara, kita buat QR sederhana agar tidak error saat generate (tapi verifikasi akan gagal sampai ada SIG)
    new QRCode(qrDiv, { text: JSON.stringify({id: id, msg: msg, sig: "UNSIGNED"}), width: 90, height: 90 });
}
