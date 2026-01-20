// Variabel global untuk Chart
let myChart;

fetch('data/dtsen.json')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('wilayahSelect');
        
        // 1. Update Header Tanggal
        const updateHeader = document.getElementById('updateDataHeader');
        if (updateHeader) updateHeader.innerText = data.updated;

        // 2. Hitung Agregat Seluruh Kecamatan untuk Stat Cards
        let totalKKKec = 0;
        let d12Kec = 0;
        let d34Kec = 0;
        let d510Kec = 0;

        data.wilayah.forEach(w => {
            totalKKKec += w.total_kk;
            // Menjumlahkan angka riil (bukan %) untuk agregat kecamatan
            d12Kec += (w.desil[0] + w.desil[1]);
            d34Kec += (w.desil[2] + w.desil[3]);
            d510Kec += w.desil.slice(4).reduce((a, b) => a + b, 0);
        });

        // Isi angka ke Card Dashboard (Gunakan toLocaleString agar ada titik ribuan)
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        safeSetText('totalKK', totalKKKec.toLocaleString('id-ID'));
        safeSetText('desil12', d12Kec.toLocaleString('id-ID'));
        safeSetText('desil34', d34Kec.toLocaleString('id-ID'));
        safeSetText('desil510', d510Kec.toLocaleString('id-ID'));

        // 3. Inisialisasi Dropdown Wilayah
        if (select) {
            data.wilayah.forEach((w, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = w.nama;
                select.appendChild(opt);
            });

            select.addEventListener('change', e => renderDashboardChart(e.target.value, data));
            
            // Render awal (wilayah pertama)
            renderDashboardChart(0, data);
        }
    })
    .catch(err => console.error("Gagal memuat data:", err));

function renderDashboardChart(idx, data) {
    const w = data.wilayah[idx];
    const d = w.desil;
    const total = w.total_kk;

    // Helper hitung %
    const kePersen = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

    const ctx = document.getElementById('desilChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6-10'],
            datasets: [{
                label: 'Persentase (%)',
                data: [
                    kePersen(d[0]), kePersen(d[1]), 
                    kePersen(d[2]), kePersen(d[3]), 
                    kePersen(d[4]), kePersen(d.slice(5).reduce((a,b)=>a+b,0))
                ],
                backgroundColor: ['#dc3545', '#dc3545', '#ffc107', '#ffc107', '#28a745', '#28a745'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
