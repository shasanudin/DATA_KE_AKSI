let myChart;

fetch('data/dtsen.json')
    .then(res => res.json())
    .then(data => {
        // --- 1. UPDATE TANGGAL (Header & Body) ---
        // Mencari elemen dengan ID updateDataHeader ATAU updateData
        const dateEl = document.getElementById('updateDataHeader') || document.getElementById('updateData');
        if (dateEl) dateEl.innerText = data.updated;

        // --- 2. HITUNG AGREGAT KECAMATAN (Untuk Stat Cards) ---
        let totalKKKec = 0;
        let d12Kec = 0;
        let d34Kec = 0;
        let d510Kec = 0;

        data.wilayah.forEach(w => {
            totalKKKec += w.total_kk;
            // D1 + D2 (Angka riil)
            d12Kec += (w.desil[0] + w.desil[1]);
            // D3 + D4
            d34Kec += (w.desil[2] + w.desil[3]);
            // D5 sampai akhir
            d510Kec += w.desil.slice(4).reduce((a, b) => a + b, 0);
        });

        // Helper untuk mengisi teks secara aman
        const safeSet = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        safeSet('totalKK', totalKKKec.toLocaleString('id-ID'));
        safeSet('desil12', d12Kec.toLocaleString('id-ID'));
        safeSet('desil34', d34Kec.toLocaleString('id-ID'));
        safeSet('desil510', d510Kec.toLocaleString('id-ID'));

        // --- 3. DROPDOWN & CHART ---
        const select = document.getElementById('wilayahSelect');
        if (select) {
            select.innerHTML = ""; // Bersihkan dropdown
            data.wilayah.forEach((w, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = w.nama;
                select.appendChild(opt);
            });

            select.addEventListener('change', e => renderChart(e.target.value, data));
            
            // Render awal wilayah pertama
            renderChart(0, data);
        }
    })
    .catch(err => console.error("Gagal memuat data JSON:", err));

function renderChart(idx, data) {
    const w = data.wilayah[idx];
    if (!w) return;

    const d = w.desil;
    const total = w.total_kk;

    // Fungsi hitung persen terhadap total KK wilayah tersebut
    const kePersen = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

    const canvas = document.getElementById('desilChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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
                backgroundColor: ['#dc3545', '#dc3545', '#ffc107', '#ffc107', '#007bff', '#28a745'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
