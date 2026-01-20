let globalData;

// Load data saat halaman dibuka
async function initApp() {
    try {
        const res = await fetch('data/dtsen.json');
        globalData = await res.json();
    } catch (err) {
        console.error("Gagal load data/dtsen.json");
    }
}
initApp();

async function generateReport() {
    if (!globalData) return alert("Data sedang dimuat...");

    const tipe = document.getElementById('tipeLaporan').value;
    const reportID = "DTSEN-" + Date.now();
    const msgPayload = `Kec-Sumber-${tipe}-${globalData.updated}`;

    // Tampilkan Header Laporan
    document.getElementById('reportPreview').style.display = 'block';
    document.getElementById('periodeText').innerText = globalData.updated;
    document.getElementById('tglSekarang').innerText = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});

    // 1. Render Tabel Berdasarkan Tipe
    if (tipe === 'agregat') {
        document.getElementById('judulLaporan').innerText = "Laporan Agregasi Kec. Sumber";
        renderAgregat();
    } else {
        document.getElementById('judulLaporan').innerText = "Daftar Prioritas Kerentanan Sosial";
        renderPrioritas();
    }

    // 2. Jalankan Pembuatan QR
    prepareQR(reportID, msgPayload);
}

function prepareQR(id, msg) {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; // Reset QR

    // Tampilkan ID unik
    document.getElementById('hashID').innerText = id;

    // METODE AWAL: Minta Signature Manual
    const sig = prompt("Masukkan Signature HEX (Dari Signer Tool) untuk validasi QR ini:", "");

    if (sig) {
        const payload = { id: id, msg: msg, sig: sig.trim() };
        new QRCode(qrDiv, {
            text: JSON.stringify(payload),
            width: 120,
            height: 120
        });
        alert("Dokumen berhasil ditandatangani secara digital.");
    } else {
        alert("Peringatan: Mencetak tanpa tanda tangan digital.");
        new QRCode(qrDiv, {
            text: JSON.stringify({id: id, msg: msg, sig: "UNSIGNED"}),
            width: 120,
            height: 120
        });
    }
}

// Fungsi pembantu render tabel
function renderAgregat() {
    let html = `<table class="table table-bordered table-sm text-center">
        <thead class="thead-light"><tr><th>Kategori</th><th>Jumlah KK</th></tr></thead>
        <tbody><tr><td>Total Terdata</td><td>${globalData.wilayah.reduce((a,b)=>a+b.total_kk,0).toLocaleString('id-ID')}</td></tr></tbody>
    </table>`;
    document.getElementById('kontenData').innerHTML = html;
}

function renderPrioritas() {
    document.getElementById('kontenData').innerHTML = "<p class='text-center'>Data Prioritas Terlampir.</p>";
}
