/**
 * Fungsi untuk memproses data dan menampilkan laporan
 */
async function generateReport() {
    const tipe = document.getElementById('tipeLaporan').value;
    const wilayahIdx = document.getElementById('wilayahSelect').value;
    const kontenData = document.getElementById('kontenData');
    const judulLaporan = document.getElementById('judulLaporan');
    
    kontenData.innerHTML = '<p class="text-center py-5">Memuat Data...</p>';

    try {
        const response = await fetch('data/dtsen.json');
        const data = await response.json();
        
        document.getElementById('periodeText').innerText = data.updated || "Januari 2026";
        const vID = 'SBR-' + Math.random().toString(36).substr(2, 7).toUpperCase();
        document.getElementById('hashID').innerText = vID;

        if (tipe === 'agregat') {
            judulLaporan.innerText = "LAPORAN AGREGASI DTSEN KECAMATAN";
            renderAgregat(data, kontenData);
        } else if (tipe === 'prioritas') {
            judulLaporan.innerText = "DAFTAR PRIORITAS INTERVENSI (DESIL 1 & 2)";
            renderPrioritas(data, kontenData);
        } else if (tipe === 'wilayah') {
            const w = data.wilayah[wilayahIdx];
            if (w) {
                judulLaporan.innerText = `DETAIL DATA DTSEN ${w.nama.toUpperCase()}`;
                renderDetailWilayah(w, kontenData);
            }
        }

        // Render QR Code
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
            text: `https://verif.tksksumber.id/${vID}`,
            width: 85,
            height: 85,
            correctLevel: QRCode.CorrectLevel.H
        });

    } catch (e) {
        console.error(e);
        kontenData.innerHTML = '<div class="alert alert-danger">Error: Gagal memproses data.</div>';
    }
}

function renderAgregat(data, container) {
    let sum = Array(10).fill(0);
    let total = 0;
    data.wilayah.forEach(w => {
        total += w.total_kk;
        w.desil.forEach((v, i) => sum[i] += v);
    });

    let html = `<table class="table table-bordered table-sm text-center">
        <thead class="bg-light"><tr><th>DESIL</th><th>JUMLAH KK</th><th>PERSENTASE</th></tr></thead><tbody>`;
    sum.forEach((v, i) => {
        html += `<tr><td>Desil ${i+1}</td><td>${v.toLocaleString()}</td><td>${((v/total)*100).toFixed(1)}%</td></tr>`;
    });
    html += `<tr class="font-weight-bold"><td>TOTAL</td><td>${total.toLocaleString()}</td><td>100%</td></tr></tbody></table>`;
    container.innerHTML = html;
}

function renderPrioritas(data, container) {
    const sorted = [...data.wilayah].sort((a,b) => (b.desil[0]+b.desil[1]) - (a.desil[0]+a.desil[1]));
    let html = `<table class="table table-bordered table-sm text-center">
        <thead class="bg-light"><tr><th>RANK</th><th>WILAYAH</th><th>D1</th><th>D2</th><th>TOTAL D1+D2</th></tr></thead><tbody>`;
    sorted.forEach((w, i) => {
        html += `<tr><td>${i+1}</td><td class="text-left">${w.nama}</td><td>${w.desil[0]}</td><td>${w.desil[1]}</td><td class="font-weight-bold">${w.desil[0]+w.desil[1]}</td></tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderDetailWilayah(w, container) {
    let html = `<p><strong>Total KK:</strong> ${w.total_kk}</p>
        <table class="table table-bordered table-sm text-center">
        <thead class="bg-light"><tr><th>DESIL</th><th>JUMLAH</th><th>PERSEN</th></tr></thead><tbody>`;
    w.desil.forEach((v, i) => {
        html += `<tr><td>Desil ${i+1}</td><td>${v}</td><td>${((v/w.total_kk)*100).toFixed(1)}%</td></tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/dtsen.json')
        .then(r => r.json())
        .then(data => {
            const s = document.getElementById('wilayahSelect');
            if (s) {
                data.wilayah.forEach((w, i) => {
                    let o = document.createElement('option');
                    o.value = i;
                    o.textContent = w.nama;
                    s.appendChild(o);
                });
            }
        })
        .catch(err => console.error("Gagal load JSON:", err));

    const tipeLap = document.getElementById('tipeLaporan');
    if (tipeLap) {
        tipeLap.onchange = function() {
            const container = document.getElementById('selectWilayahContainer');
            if (container) {
                container.style.display = (this.value === 'wilayah') ? 'block' : 'none';
            }
        };
    }
});
