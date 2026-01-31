// Data alur DTSEN (Anda bisa menyesuaikan konten teksnya di sini)
const dataAlur = [
    {
        langkah: 1,
        judul: "Pendaftaran & Usulan",
        deskripsi: "Masyarakat melakukan usulan melalui Musyawarah Desa (Musdes) atau melalui aplikasi pendataan mandiri.",
        ikon: "📝"
    },
    {
        langkah: 2,
        judul: "Verifikasi Lapangan",
        deskripsi: "Petugas TKSK atau Puskesos melakukan kunjungan rumah untuk memastikan kesesuaian data dengan kondisi riil.",
        ikon: "🏠"
    },
    {
        langkah: 3,
        judul: "Input Sistem DTSEN",
        deskripsi: "Data yang telah valid diinput ke dalam sistem Satu Data Terpadu untuk diproses secara digital.",
        ikon: "💻"
    },
    {
        langkah: 4,
        judul: "Pengesahan & Penetapan",
        deskripsi: "Data disahkan oleh pejabat berwenang dan ditetapkan sebagai penerima manfaat yang sah.",
        ikon: "✅"
    }
];

// Fungsi untuk merender data ke dalam HTML
function renderAlur() {
    const container = document.getElementById('newsContainer');
    
    // Header kecil untuk section alur
    let htmlContent = `<div class="row">`;

    dataAlur.forEach(item => {
        htmlContent += `
            <div class="col-md-6 mb-4">
                <div class="card h-100 border-0 shadow-sm" style="border-radius: 15px; transition: transform 0.3s ease;">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                 style="width: 40px; height: 40px; font-weight: bold; font-size: 1.2rem;">
                                ${item.langkah}
                            </div>
                            <div class="ml-3" style="font-size: 2rem;">${item.ikon}</div>
                        </div>
                        <h5 class="card-title font-weight-bold" style="font-family: 'Lora', serif;">${item.judul}</h5>
                        <p class="card-text text-muted">${item.deskripsi}</p>
                    </div>
                </div>
            </div>
        `;
    });

    htmlContent += `</div>`;
    
    // Masukkan ke dalam container
    container.innerHTML = htmlContent;

    // Tambahkan sedikit efek hover via JS (opsional)
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
    });
}

// Jalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderAlur);
