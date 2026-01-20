let chart; // Variabel global untuk grafik

// 1. Ambil data dari dtsen.json
fetch('data/dtsen.json')
  .then(res => res.json())
  .then(data => {
    const select = document.getElementById('wilayahSelect');
    
    // 2. Isi Dropdown dengan daftar Desa/Kelurahan
    data.wilayah.forEach((w, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = w.nama;
      select.appendChild(opt);
    });

    // 3. Fungsi untuk menggambar grafik berdasarkan pilihan
    function updateChart(idx) {
      const w = data.wilayah[idx];
      const d = w.desil; // Ambil array desil dari JSON
      
      // Gabungkan Desil 6 sampai 10 (index 5 s/d 9)
      const total610 = d.slice(5).reduce((a, b) => a + b, 0);

      const ctx = document.getElementById('desilChart').getContext('2d');
      
      // Hancurkan chart sebelumnya jika ada (agar tidak tumpang tindih)
      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6-10'],
          datasets: [{
            label: 'Persentase (%)',
            // Data D1-D5 individu, D6-10 digabung
            data: [d[0], d[1], d[2], d[3], d[4], total610],
            backgroundColor: [
              '#dc3545', // D1 (Merah)
              '#ffc107', // D2 (Kuning)
              '#0d6efd', // D3 (Biru)
              '#6610f2', // D4 (Ungu)
              '#fd7e14', // D5 (Oranye)
              '#28a745'  // D6-10 (Hijau)
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              max: 100, // Skala maksimal 100%
              ticks: { callback: v => v + '%' } 
            }
          }
        }
      });
    }

    // 4. Listener saat dropdown diubah
    select.addEventListener('change', e => updateChart(e.target.value));

    // 5. Render pertama kali (wilayah pertama/index 0)
    updateChart(0);
  })
  .catch(err => console.error("Gagal memuat file JSON:", err));
