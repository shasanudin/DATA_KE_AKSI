fetch("data/dtsen.json")
  .then(response => {
    if (!response.ok) throw new Error("File dtsen.json tidak ditemukan");
    return response.json();
  })
  .then(data => {
    /* 1. UPDATE TANGGAL & RINGKASAN (Jika elemen ada) */
    const updateDataEl = document.getElementById("updateData");
    if (updateDataEl) updateDataEl.innerText = data.updated || "-";

    let totalKK = 0, totalD12 = 0, totalD34 = 0, totalD510 = 0;
    let totalDesil = Array(10).fill(0);

    data.wilayah.forEach(w => {
      totalKK += Number(w.total_kk) || 0;
      const d = w.desil || [];
      totalD12 += (d[0] || 0) + (d[1] || 0);
      totalD34 += (d[2] || 0) + (d[3] || 0);
      totalD510 += d.slice(4).reduce((a, b) => a + b, 0);

      d.forEach((nilai, i) => {
        totalDesil[i] += Number(nilai) || 0;
      });
    });

    // Pasang nilai ringkasan ke HTML jika ID ditemukan
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val.toLocaleString("id-ID");
    };

    setVal("totalKK", totalKK);
    setVal("desil12", totalD12);
    setVal("desil34", totalD34);
    setVal("desil510", totalD510);

    /* 2. TABEL DESIL KECAMATAN */
    const tabelDesil = document.getElementById("tabelDesilKecamatan");
    if (tabelDesil) {
      tabelDesil.innerHTML = totalDesil.map((nilai, i) => `
        <tr>
          <td>D${i + 1}</td>
          <td>${nilai.toLocaleString("id-ID")}</td>
        </tr>
      `).join("");
    }

    /* 3. TABEL PRIORITAS + RISIKO */
    const tbodyPrioritas = document.getElementById("tabelPrioritas");
    if (tbodyPrioritas) {
      const hasil = data.wilayah.map(w => ({
        nama: w.nama,
        jenis: w.jenis,
        d1: w.desil?.[0] || 0,
        d2: w.desil?.[1] || 0,
        total: (w.desil?.[0] || 0) + (w.desil?.[1] || 0)
      })).sort((a, b) => b.total - a.total);

      tbodyPrioritas.innerHTML = hasil.map((w, i) => {
        let status = "Prioritas Rendah", kelas = "Prioritas-rendah";
        if (w.total >= 400) { status = "Prioritas Tinggi"; kelas = "Prioritas-tinggi"; }
        else if (w.total >= 200) { status = "Prioritas Sedang"; kelas = "Prioritas-sedang"; }

        return `
          <tr>
            <td>${i + 1}</td>
            <td>${w.nama}</td>
            <td>${w.jenis}</td>
            <td>${w.d1}</td>
            <td>${w.d2}</td>
            <td><strong>${w.total}</strong></td>
            <td><span class="badge-risiko ${kelas}">${status}</span></td>
          </tr>
        `;
      }).join("");
    }
  })
  .catch(error => console.error("Gagal load data DTSEN:", error));

