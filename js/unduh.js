// ==============================
// GLOBAL VARIABLES
// ==============================
let dataJSON = null;
const hashID = Math.random().toString(36).substring(2, 8).toUpperCase();

// ==============================
// INIT ON LOAD
// ==============================
window.onload = () => {
    document.getElementById('tglSekarang').innerText = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    document.getElementById('hashNomor').innerText = Math.floor(100 + Math.random() * 899);
    document.getElementById('hashID').innerText = hashID;

    loadDTSEN();
};

// ==============================
// LOAD DTSEN DATA
// ==============================
function loadDTSEN() {
    fetch('data/dtsen.json')
        .then(r => r.json())
        .then(data => {
            dataJSON = data;
            const select = document.getElementById('desaSelect');
            select.innerHTML = "";

            data.wilayah.forEach(w => {
                let opt = document.createElement('option');
                opt.value = w.nama;
                opt.textContent = `${w.jenis} ${w.nama}`;
                select.appendChild(opt);
            });
        })
        .catch(err => {
            console.error("Gagal memuat data:", err);
        });
}

document.getElementById('mode').addEventListener('change', e => {
    document.getElementById('desaWrap').style.display = (e.target.value === 'desa') ? 'block' : 'none';
});

// ==============================
// GENERATE MAIN
// ==============================
function generate() {
    const mode = document.getElementById('mode').value;
    const container = document.getElementById('kontenData');
    
    if (!dataJSON) return;

    if (mode === 'agregat') {
        renderAgregat(dataJSON, container);
        updateQR("AGREGAT");
        document.getElementById('judulLaporan').innerText = "AGREGASI DATA DTSEN KECAMATAN SUMBER";
    } else if (mode === 'prioritas') {
        renderPrioritas(dataJSON, container);
        updateQR("PRIORITAS");
        document.getElementById('judulLaporan').innerText = "DAFTAR PRIORITAS KERENTANAN DTSEN (D1-D2)";
    } else if (mode === 'desa') {
        renderPerDesa(); // Menggunakan fungsi detail per desa
        updateQR("DESA");
        document.getElementById('judulLaporan').innerText = "REKAP DTSEN PER DESA / KELURAHAN";
    }
}

// ==========================================
// 1. RENDER TABEL AGREGAT (Logika Baru Anda)
// ==========================================
function renderAgregat(data, container) {
    let sum = Array(10).fill(0);
    let total = 0;
    
    data.wilayah.forEach(w => {
        total += w.total_kk;
        w.desil.forEach((v, i) => sum[i] += v);
    });

    const sumDesil6_10 = sum.slice(5).reduce((a, b) => a + b, 0);

    let html = `
        <table class="table table-bordered table-sm text-center">
            <thead class="bg-light">
                <tr>
                    <th>KATEGORI</th>
                    <th>DESIL</th>
                    <th>JUMLAH KK</th>
                    <th>PERSENTASE</th>
                </tr>
            </thead>
            <tbody>`;

    const labels = ["Sangat Miskin", "Miskin", "Hampir Miskin", "Rentan", "Menengah Bawah"];
    
    for (let i = 0; i < 5; i++) {
        html += `
            <tr>
                <td class="text-left">${labels[i]}</td>
                <td>Desil ${i + 1}</td>
                <td class="text-right">${sum[i].toLocaleString('id-ID')}</td>
                <td class="text-right">${((sum[i] / total) * 100).toFixed(1)}%</td>
            </tr>`;
    }

    html += `
            <tr class="bg-light">
                <td class="text-left font-italic">Lainnya (Mampu/Sejahtera)</td>
                <td>Desil 6 - 10</td>
                <td class="text-right">${sumDesil6_10.toLocaleString('id-ID')}</td>
                <td class="text-right">${((sumDesil6_10 / total) * 100).toFixed(1)}%</td>
            </tr>
            <tr class="font-weight-bold" style="background: #eee;">
                <td colspan="2">TOTAL KECAMATAN SUMBER</td>
                <td class="text-right">${total.toLocaleString('id-ID')}</td>
                <td class="text-right">100%</td>
            </tr>
        </tbody></table>`;
    
    container.innerHTML = html;
}

// ============================================
// 2. RENDER PRIORITAS (Logika Sorting & Persentase Anda)
// ============================================
function renderPrioritas(data, container) {
    const sorted = [...data.wilayah].sort((a, b) => {
        const bebanA = (a.desil[0] + a.desil[1]) / a.total_kk;
        const bebanB = (b.desil[0] + b.desil[1]) / b.total_kk;
        return bebanB - bebanA;
    });

    let html = `
        <table class="table table-bordered table-sm text-center">
            <thead class="bg-light">
                <tr>
                    <th rowspan="2" class="align-middle">RANK</th>
                    <th rowspan="2" class="align-middle">DESA / KELURAHAN</th>
                    <th colspan="2">PRIORITAS</th>
                    <th rowspan="2" class="align-middle">TOTAL (D1+D2)</th>
                    <th rowspan="2" class="align-middle bg-warning text-dark">% KERENTANAN</th>
                </tr>
                <tr>
                    <th>D1</th>
                    <th>D2</th>
                </tr>
            </thead>
            <tbody>`;

    sorted.forEach((w, i) => {
        const totalD12 = w.desil[0] + w.desil[1];
        const persenKerentanan = ((totalD12 / w.total_kk) * 100).toFixed(1);
        
        html += `
            <tr>
                <td>${i + 1}</td>
                <td class="text-left">${w.nama}</td>
                <td>${w.desil[0].toLocaleString('id-ID')}</td>
                <td>${w.desil[1].toLocaleString('id-ID')}</td>
                <td class="font-weight-bold">${totalD12.toLocaleString('id-ID')}</td>
                <td class="font-weight-bold text-danger">${persenKerentanan}%</td>
            </tr>`;
    });

    html += `</tbody></table>
    <p class="small text-muted mt-2">* Data diurutkan berdasarkan persentase beban kerentanan tertinggi (Prioritas Penanganan).</p>`;
    
    container.innerHTML = html;
}

// ============================================
// 3. RENDER PER DESA (Detail Desil)
// ============================================
function renderPerDesa() {
    const selectedDesa = document.getElementById('desaSelect').value;
    const w = dataJSON.wilayah.find(item => item.nama === selectedDesa);
    if (!w) return;

    let rows = '';
    const labels = ["Sangat Miskin (D1)", "Miskin (D2)", "Hampir Miskin (D3)", "Rentan (D4)", "Menengah Bawah (D5)"];
    
    for (let i = 0; i < 5; i++) {
        let val = w.desil[i];
        let persen = ((val / w.total_kk) * 100).toFixed(1);
        rows += `<tr><td class="text-left">${labels[i]}</td><td class="text-right">${val.toLocaleString('id-ID')}</td><td class="text-right">${persen}%</td></tr>`;
    }

    let d610 = w.desil.slice(5).reduce((a, b) => a + b, 0);
    rows += `
    <tr class="bg-light">
        <td class="text-left font-italic">Lainnya (D6-D10)</td>
        <td class="text-right">${d610.toLocaleString('id-ID')}</td>
        <td class="text-right">${((d610 / w.total_kk) * 100).toFixed(1)}%</td>
    </tr>
    <tr class="font-weight-bold">
        <td>TOTAL KK</td>
        <td class="text-right">${w.total_kk.toLocaleString('id-ID')}</td>
        <td class="text-right">100%</td>
    </tr>`;

    document.getElementById('kontenData').innerHTML = `
    <h6 class="mb-3">Detail Wilayah: <b>${w.jenis} ${w.nama}</b></h6>
    <table class="table table-bordered table-sm text-center">
        <thead class="bg-light">
            <tr><th>KATEGORI</th><th>JUMLAH</th><th>PERSENTASE</th></tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

// ==============================
// QR CODE
// ==============================
function updateQR(tipe) {
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: `VERIF-TKSK-SUMBER-${tipe}-${hashID}`,
        width: 70,
        height: 70
    });
}
