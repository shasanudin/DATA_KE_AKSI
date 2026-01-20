let myChart;

fetch('data/dtsen.json')
    .then(res => res.json())
    .then(data => {
        // 1. Update Tanggal
        const dateEl = document.getElementById('updateDataHeader') || document.getElementById('updateData');
        if (dateEl) dateEl.innerText = data.updated;

        // 2. Hitung Agregat Kecamatan
        let totalKKKec = 0;
        let d12Kec = 0;
        let d34Kec = 0;
        let d510Kec = 0;

        data.wilayah.forEach(w => {
            totalKKKec += w.total_kk;
            d12Kec += (w.desil[0] + w.desil[1]);
            d34Kec += (w.desil[2] + w.desil[3]);
            d510Kec += w.desil.slice(4).reduce((a, b) => a + b, 0);
        });

        // 3. Jalankan Animasi Angka Berjalan (Counter)
        animateValue("totalKK", 0, totalKKKec, 1500);
        animateValue("desil12", 0, d12Kec, 1500);
        animateValue("desil34", 0, d34Kec, 1500);
        animateValue("desil510", 0, d510Kec, 1500);

        // 4. Inisialisasi Dropdown
        const select = document.getElementById('wilayahSelect');
        if (select) {
            data.wilayah.forEach((w, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = w.nama;
                select.appendChild(opt);
            });
            select.addEventListener('change', e => renderSimplifiedChart(e.target.value, data));
            renderSimplifiedChart(0, data);
        }
    })
    .catch(err => console.error("Data gagal dimuat:", err));

// --- FUNGSI ANIMASI ANGKA ---
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerText = value.toLocaleString('id-ID');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- FUNGSI GRAFIK SEDERHANA (3 KATEGORI) ---
function renderSimplifiedChart(idx, data) {
    const w = data.wilayah[idx];
    if (!w) return;

    const total = w.total_kk;
    const kePersen = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

    // Kelompokkan Data agar tabel/grafik tidak panjang
    const kelompokData = [
        kePersen(w.desil[0] + w.desil[1]), // Sangat Miskin
        kePersen(w.desil[2] + w.desil[3]), // Rentan
        kePersen(w.desil.slice(4).reduce((a,b)=>a+b,0)) // Mampu
    ];

    const ctx = document.getElementById('desilChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['D1-D2 (Sangat Miskin)', 'D3-D4 (Rentan)', 'D5-D10 (Mampu)'],
            datasets: [{
                data: kelompokData,
                backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                borderRadius: 8,
                barThickness: 50 // Membuat batang lebih proporsional
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    ticks: { callback: v => v + '%' } 
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Proporsi: ${context.raw}%`
                    }
                }
            }
        }
    });
}
