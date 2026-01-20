let globalData;
let myQR;

// Inisialisasi Data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const res = await fetch('data/dtsen.json');
        globalData = await res.json();
        
        // Setup Elemen Dasar
        const periodeEl = document.getElementById('periodeText');
        const tglEl = document.getElementById('tglSekarang');
        if(periodeEl) periodeEl.innerText = globalData.updated;
        if(tglEl) tglEl.innerText = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});

        // Setup Dropdown Wilayah
        const sel = document.getElementById('wilayahSelect');
        if (sel) {
            globalData.wilayah.forEach((w, i) => {
                let opt = document.createElement('option');
                opt.value = i; opt.textContent = w.nama;
                sel.appendChild(opt);
            });
        }

        // Toggle Container Wilayah
        const tipeLaporan = document.getElementById('tipeLaporan');
        if (tipeLaporan) {
            tipeLaporan.addEventListener('change', (e) => {
                const container = document.getElementById('selectWilayahContainer');
                if(container) container.style.display = (e.target.value === 'wilayah') ? 'block' : 'none';
            });
        }
    } catch (err) {
        console.error("Gagal memuat aplikasi:", err);
    }
}

// Fungsi Utama Generate Report
function generateReport() {
    if (!globalData) return alert("Data sedang dimuat, mohon tunggu...");

    const tipe = document.getElementById('tipeLaporan').value;
    const konten = document.getElementById('kontenData');
    const judul = document.getElementById('judulLaporan');
    let html = "";
    let payload = "";

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
            [...Array(5).keys()].map(i => [
                `Desil ${i+1}`, 
                formatNum(agregat[i]), 
                ((agregat[i]/grandTotal)*100).toFixed(1) + '%'
            ]).concat([
                ['Desil 6-10', formatNum(agregat.slice(5).reduce((a,b)=>a+b,0)), ((agregat.slice(5).reduce((a,b)=>a+b,0)/grandTotal)*100).toFixed(1) + '%'],
                [`<strong>TOTAL</strong>`, `<strong>${formatNum(grandTotal)}</strong>`, '100%']
            ])
        );
        payload = `Kec-Sum-${grandTotal}`;

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
        payload = `Prio-${ranking.length}`;

    } else {
        const w = globalData.wilayah[document.getElementById('wilayahSelect').value];
        judul.innerText = `LAPORAN DETAIL WILAYAH: ${w.nama}`;
        const calcP = (v) => ((v/w.total_kk)*100).toFixed(1) + '%';
        const d610 = w.desil.slice(5).reduce((a,b)=>a+b,0);

        html = renderTable(['PARAMETER', 'JUMLAH KK', 'PERSENTASE'], [
            ['Total KK', formatNum(w.total_kk), '100%'],
            ['Sangat Miskin (D1)', formatNum(w.desil[0]), calcP(w.desil[0])],
            ['Miskin (D2)', formatNum(w.desil[1]), calcP(w.desil[1])],
            ['Rentan (D3-D4)', formatNum(w.desil[2]+w.desil[3]), calcP(w.desil[2]+w.desil[3])],
            ['Mampu (D6-10)', formatNum(d610), calcP(d610)]
        ]);
        payload = `Wil-${w.nama}-${w.total_kk}`;
    }

    konten.innerHTML = html;
    updateStatus(payload);
}

// Helper Render Tabel
function renderTable(headers, rows) {
    return `<table class="table table-bordered table-sm text-center">
        <thead class="thead-light"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

// Update QR dan Hash
function updateStatus(payload) {
    const hash = btoa(payload + globalData.updated).substring(0, 10).toUpperCase();
    document.getElementById('hashID').innerText = `SIGN-${hash}`;
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, { text: `VERIFIED-${hash}`, width: 90, height: 90 });
}
