// FUNGSI SINKRONISASI DENGAN SIGNER & VERIFIKATOR
function prepareQR(id, msg) {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; // Bersihkan area QR

    // 1. Tampilkan ID Laporan di UI
    const hashDisplay = btoa(id).substring(0, 10).toUpperCase();
    document.getElementById('hashID').innerText = `ID: ${hashDisplay}`;

    // 2. Beri pilihan kepada user untuk memasukkan Signature
    const userSignature = prompt("Masukkan Kode SIGNATURE (HEX) dari Signer Tool untuk memvalidasi dokumen ini:", "");

    if (userSignature && userSignature.length > 50) {
        // Jika ada Signature, buat JSON lengkap untuk Verifikasi.html
        const finalPayload = {
            id: id,
            msg: msg,
            sig: userSignature.trim()
        };

        new QRCode(qrDiv, {
            text: JSON.stringify(finalPayload),
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        alert("QR Code Berhasil Dibuat dengan Tanda Tangan Digital!");
    } else {
        // Jika tidak ada Signature, buat QR Draft (Akan dianggap PALSU oleh scanner)
        alert("Peringatan: Dokumen dicetak tanpa tanda tangan digital. Verifikasi akan gagal.");
        new QRCode(qrDiv, {
            text: JSON.stringify({id: id, msg: msg, sig: "UNSIGNED"}),
            width: 100,
            height: 100
        });
    }
}
