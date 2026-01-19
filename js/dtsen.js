fetch("data/dtsen.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("File dtsen.json tidak ditemukan");
    }
    return response.json();
  })
  .then(data => {

    /* =========================
       RINGKASAN DATA KECAMATAN
    ========================= */

    let totalKK = 0;
    let totalD12 = 0;
    let totalD34 = 0;
    let totalD510 = 0;

    data.wilayah.forEach(w => {
      const kk = Number(w.total_kk) || 0;
      totalKK += kk;

      const d = w.desil || [];
      totalD12 += (d[0] || 0) + (d[1] || 0);
      totalD34 += (d[2] || 0) + (d[3] || 0);
      totalD510 += (d[4] || 0) + (d[5] || 0) + (d[6] || 0) + (d[7] || 0) + (d[8] || 0) + (d[9] || 0);
    });

    // render ringkasan (AMAN dari undefined)
    document.getElementById("totalKK").innerText =
      totalKK.toLocaleString("id-ID");

    document.getElementById("desil12").innerText =
      totalD12.toLocaleString("id-ID");

    document.getElementById("desil34").innerText =
      totalD34.toLocaleString("id-ID");

    document.getElementById("desil510").innerText =
      totalD510.toLocaleString("id-ID");

    document.getElementById("updateData").innerText =
      data.updated || "-";


    /* =========================
       TABEL PRIORITAS + RISIKO
    ========================= */

    const tbody = document.getElementById("tabelPrioritas");
    tbody.innerHTML = "";

    const hasil = data.wilayah.map(w => {
      const d1 = w.desil?.[0] || 0;
      const d2 = w.desil?.[1] || 0;

      return {
        nama: w.nama,
        jenis: w.jenis,
        d1,
        d2,
        total: d1 + d2
      };
    });

    // sort descending
    hasil.sort((a, b) => b.total - a.total);

    hasil.forEach((w, i) => {

      let status = "";
      let kelas = "";

      if (w.total >= 30) {
        status = "Risiko Tinggi";
        kelas = "risiko-tinggi";
      } else if (w.total >= 20) {
        status = "Risiko Sedang";
        kelas = "risiko-sedang";
      } else {
        status = "Risiko Rendah";
        kelas = "risiko-rendah";
      }

      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${w.nama}</td>
          <td>${w.jenis}</td>
          <td>${w.d1}</td>
          <td>${w.d2}</td>
          <td><strong>${w.total}</strong></td>
          <td>
            <span class="badge-risiko ${kelas}">
              ${status}
            </span>
          </td>
        </tr>
      `;
    });

  })
  .catch(error => {
    console.error("Gagal load data DTSEN:", error);
    const tbody = document.getElementById("tabelPrioritas");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Gagal memuat data DTSEN
          </td>
        </tr>
      `;
    }
  });
