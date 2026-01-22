// Fungsi utama untuk generate laporan
async function generateReport() {
    const tipe = document.getElementById('tipeLaporan').value;
    const wilayahIdx = document.getElementById('wilayahSelect').value;
    const kontenData = document.getElementById('kontenData');
    const judulLaporan = document.getElementById('judulLaporan');
    
    // Tampilkan loading sederhana
    kontenData.innerHTML = '<p class="text-center py-5">Memproses data...</p>';

    try {
        const response = await fetch('data/dtsen.json');
        const data = await response.json();
        
        // Update Periode & Hash ID untuk verifikasi
        document.getElementById('periodeText').innerText = data.updated || "Januari 2026";
        document.getElementById('hashID').innerText = 'SBR-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        if (tipe === 'agregat') {
            judulLaporan.innerText = "LAPORAN AGREGASI DTSEN KECAMATAN";
            renderAgregat(data, kontenData);
        } else if (tipe === 'prioritas') {
            judulLaporan.innerText = "DAFTAR PRIORITAS INTERVENSI (DESIL 1 & 2)";
            renderPrioritas(data, kontenData);
        } else if (tipe === 'wilayah') {
            const namaWilayah = data.wilayah[wilayahIdx].nama;
            judulLaporan.innerText = `LAPORAN DETAIL DATA DTSEN ${namaWilayah.toUpperCase()}`;
            renderDetailWilayah(data.wilayah[wilayahIdx], kontenData);
        }

        // Cari bagian ini di dalam fungsi generateReport() di js/unduh.js
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = ""; // Bersihkan QR lama

        new QRCode(qrContainer, {
            text: `https://tksksumber.com/verifikasi/${document.getElementById('hashID').innerText}`,
            width: 85,
            height: 85,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

// Tambahan opsional: Pastikan gambar QR yang dihasilkan otomatis memiliki margin auto
        setTimeout(() => {
            const qrImg = qrContainer.querySelector('img');
            if(qrImg) {
                qrImg.style.margin = "0 auto";
            }
        }, 100);

// 1. Render Tabel Agregat Kecamatan
function renderAgregat(data, container) {
    let agregat = Array(10).fill(0);
    let totalKK = 0;

    data.wilayah.forEach(w => {
        totalKK += w.total_kk;
        w.desil.forEach((val, i) => { agregat[i] += val; });
    });

    let html = `
        <table class="table table-bordered table-sm mt-3 text-center">
            <thead class="bg-light">
                <tr>
                    <th>KATEGORI</th>
                    <th>DESIL</th>
                    <th>JUMLAH KK</th>
                    <th>PERSENTASE</th>
                </tr>
            </thead>
            <tbody>`;
    
    const labelEkonomi = ["Sangat Miskin", "Miskin", "Hampir Miskin", "Rentan", "Menengah Bawah", "Menengah", "Menengah Atas", "Mampu", "Sejahtera", "Sangat Sejahtera"];

    agregat.forEach((nilai, i) => {
        const persen = ((nilai / totalKK) * 100).toFixed(2);
        html += `
            <tr>
                <td class="text-left">${labelEkonomi[i]}</td>
                <td>Desil ${i + 1}</td>
                <td>${nilai.toLocaleString('id-ID')}</td>
                <td>${persen}%</td>
            </tr>`;
    });

    html += `
            <tr class="font-weight-bold bg-light">
                <td colspan="2">TOTAL KECAMATAN</td>
                <td>${totalKK.toLocaleString('id-ID')}</td>
                <td>100%</td>
            </tr>
        </tbody></table>`;
    
    container.innerHTML = html;
}

// 2. Render Tabel Prioritas (Ranking D1+D2)
function renderPrioritas(data, container) {
    const sorted = [...data.wilayah].sort((a, b) => (b.desil[0] + b.desil[1]) - (a.desil[0] + a.desil[1]));

    let html = `
        <table class="table table-bordered table-sm mt-3 text-center">
            <thead class="bg-light">
                <tr>
                    <th>RANK</th>
                    <th>DESA / KELURAHAN</th>
                    <th>DESIL 1</th>
                    <th>DESIL 2</th>
                    <th>TOTAL (D1+D2)</th>
                    <th>BEBAN WILAYAH</th>
                </tr>
            </thead>
            <tbody>`;

    sorted.forEach((w, i) => {
        const d12 = w.desil[0] + w.desil[1];
        const beban = ((d12 / w.total_kk) * 100).toFixed(1);
        html += `
            <tr>
                <td>${i + 1}</td>
                <td class="text-left">${w.nama}</td>
                <td>${w.desil[0].toLocaleString()}</td>
                <td>${w.desil[1].toLocaleString()}</td>
                <td class="font-weight-bold">${d12.toLocaleString()}</td>
                <td>${beban}%</td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// 3. Render Detail Per Wilayah
function renderDetailWilayah(wilayah, container) {
    let html = `
        <div class="row mb-3">
            <div class="col-6"><strong>Nama Wilayah:</strong> ${wilayah.nama}</div>
            <div class="col-6 text-right"><strong>Total KK:</strong> ${wilayah.total_kk.toLocaleString()}</div>
        </div>
        <table class="table table-bordered table-sm text-center">
            <thead class="bg-light">
                <tr>
                    <th>DESIL</th>
                    <th>JUMLAH KK</th>
                    <th>PROPORSI</th>
                    <th>STATUS</th>
                </tr>
            </thead>
            <tbody>`;

    wilayah.desil.forEach((nilai, i) => {
        const persen = ((nilai / wilayah.total_kk) * 100).toFixed(1);
        html += `
            <tr>
                <td>Desil ${i + 1}</td>
                <td>${nilai.toLocaleString()}</td>
                <td>${persen}%</td>
                <td class="small">${i < 2 ? 'Prioritas' : 'Pemantauan'}</td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Inisialisasi Dropdown Wilayah saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/dtsen.json')
        .then(r => r.json())
        .then(data => {
            const select = document.getElementById('wilayahSelect');
            data.wilayah.forEach((w, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = w.nama;
                select.appendChild(opt);
            });
        });

    // Toggle dropdown wilayah
    document.getElementById('tipeLaporan').addEventListener('change', function() {
        const container = document.getElementById('selectWilayahContainer');
        container.style.display = (this.value === 'wilayah') ? 'block' : 'none';
    });
});
