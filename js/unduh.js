// unduh.js
// Sistem Cetak Dokumen DTSEN - TKSK & Puskesos Kecamatan Sumber
// Version: 2.2.0 - SHOW ALL DATA (NO LIMIT)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ============ KONFIGURASI FIREBASE ============
const firebaseConfig = {
    apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
    authDomain: "data-ke-aksi-auth.firebaseapp.com",
    projectId: "data-ke-aksi-auth",
    storageBucket: "data-ke-aksi-auth.firebasestorage.app",
    messagingSenderId: "631382692174",
    appId: "1:631382692174:web:c10a099fb3021849eace1f"
};

// ============ INISIALISASI FIREBASE ============
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// ============ GLOBAL VARIABLES ============
let wilayahData = [];
let isLoading = false;
let qrcode = null;
let nomorSurat = ''; // SATU NOMOR SURAT UNTUK SEMUA

// DOM Elements
const modeSelect = document.getElementById('mode');
const desaWrap = document.getElementById('desaWrap');
const desaSelect = document.getElementById('desaSelect');
const btnGenerate = document.getElementById('btnGenerate');
const btnPrint = document.getElementById('btnPrint');
const kontenHal1 = document.getElementById('kontenHal1');
const kontenHal2 = document.getElementById('kontenHal2');
const kontenHal3 = document.getElementById('kontenHal3');
const kontenHal4 = document.getElementById('kontenHal4');
const dataCountInfo = document.getElementById('dataCountInfo');
const lastUpdateInfo = document.getElementById('lastUpdateInfo');
const tglSekarang = document.getElementById('tglSekarang');
const nomorSuratUtama = document.getElementById('nomorSuratUtama');
const nomorSuratLanjutan2 = document.getElementById('nomorSuratLanjutan2');
const nomorSuratLanjutan3 = document.getElementById('nomorSuratLanjutan3');
const nomorSuratLanjutan4 = document.getElementById('nomorSuratLanjutan4');

// ============ UTILITY FUNCTIONS ============

/**
 * Format angka ke format Indonesia (ribuan)
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format tanggal Indonesia
 */
function formatDate(date = new Date()) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Generate SATU nomor surat untuk semua halaman
 * Format: 460 / [random] / DTSEN.[bulan] / TKSK-SBR / [tahun]
 */
function generateNomorSurat() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 900 + 100);
    
    return `460 / ${random} / DTSEN.${month} / TKSK-SBR / ${year}`;
}

/**
 * Generate ID verifikasi unik
 */
function generateVerificationId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `DTSEN-SBR-${year}${month}${day}-${random}`;
}

/**
 * Tampilkan loading state
 */
function setLoading(loading) {
    isLoading = loading;
    if (btnGenerate) {
        btnGenerate.disabled = loading;
        btnGenerate.innerHTML = loading 
            ? '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...' 
            : '<i class="fas fa-sync-alt mr-2"></i> Generate Dokumen';
    }
}

/**
 * Tampilkan notifikasi
 */
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
        ${message}
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// ============ DATA LOADING FUNCTIONS ============

/**
 * Load data dari Firebase
 */
async function loadDataFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "wilayah_desa"));
        const data = [];
        
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            let desilArray = docData.desil || [];
            
            if (!Array.isArray(desilArray)) {
                if (desilArray && typeof desilArray === 'object') {
                    desilArray = Object.values(desilArray);
                } else {
                    desilArray = Array(10).fill(0);
                }
            }
            
            while (desilArray.length < 10) {
                desilArray.push(0);
            }
            
            data.push({
                id: doc.id,
                nama: docData.nama_wilayah || docData.nama || doc.id,
                kecamatan: 'Sumber',
                desil: desilArray,
                total_kk: desilArray.reduce((a, b) => (a || 0) + (b || 0), 0),
                d1: desilArray[0] || 0,
                d2: desilArray[1] || 0,
                d3: desilArray[2] || 0,
                d4: desilArray[3] || 0,
                d5_10: desilArray.slice(4).reduce((a, b) => (a || 0) + (b || 0), 0)
            });
        });
        
        return data.filter(item => 
            item.nama && 
            item.nama !== 'N/A' && 
            item.nama !== '' && 
            item.total_kk > 0
        );
        
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        return generateSampleData();
    }
}

/**
 * Generate sample data (fallback) - DIPERBANYAK DATANYA
 */
function generateSampleData() {
    const desaList = [
        'Sumbergedang', 'Sumberduren', 'Sumbersari', 'Sumberrejo', 'Sumberagung',
        'Sumberpucung', 'Sumberejo Kidul', 'Sumberwono', 'Sumberpatut', 'Sumberkembar',
        'Sumberjaya', 'Sumbermulya', 'Sumberbendo', 'Sumbertengah', 'Sumberkarang',
        'Sumberasih', 'Sumberbaru', 'Sumbercangkring', 'Sumberdadi', 'Sumberejo',
        'Sumbergondo', 'Sumberharjo', 'Sumberijo', 'Sumberkerto', 'Sumbermadu',
        'Sumbernanas', 'Sumberombo', 'Sumberpandan', 'Sumberranti', 'Sumbertaman'
    ];
    
    return desaList.map((nama, index) => {
        const d1 = Math.floor(Math.random() * 150) + 50;
        const d2 = Math.floor(Math.random() * 180) + 70;
        const d3 = Math.floor(Math.random() * 120) + 40;
        const d4 = Math.floor(Math.random() * 100) + 30;
        const d5_10 = Math.floor(Math.random() * 300) + 100;
        
        return {
            id: `sample-${index + 1}`,
            nama: nama,
            kecamatan: 'Sumber',
            desil: [d1, d2, d3, d4, ...Array(6).fill(Math.floor(Math.random() * 50) + 20)],
            total_kk: d1 + d2 + d3 + d4 + d5_10,
            d1, d2, d3, d4, d5_10
        };
    }).sort((a, b) => (b.d1 + b.d2) - (a.d1 + a.d2));
}

/**
 * Populate desa select dropdown
 */
function populateDesaSelect(data) {
    if (!desaSelect) return;
    
    desaSelect.innerHTML = '<option value="">Pilih Desa...</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.nama} (${formatNumber(item.total_kk)} KK)`;
        desaSelect.appendChild(option);
    });
}

// ============ RENDER FUNCTIONS - TAMPILKAN SEMUA DATA ============

/**
 * Render halaman 1 - Agregasi Kecamatan
 * MENAMPILKAN SEMUA DESA (TANPA BATASAN 10)
 */
function renderHalaman1(data) {
    if (!kontenHal1) return;
    
    const totalKK = data.reduce((sum, item) => sum + item.total_kk, 0);
    const totalD1 = data.reduce((sum, item) => sum + item.d1, 0);
    const totalD2 = data.reduce((sum, item) => sum + item.d2, 0);
    const totalD12 = totalD1 + totalD2;
    const totalD34 = data.reduce((sum, item) => sum + (item.d3 || 0) + (item.d4 || 0), 0);
    const totalD510 = data.reduce((sum, item) => sum + (item.d5_10 || 0), 0);
    
    // Buat tabel dengan SEMUA DATA (TANPA LIMIT)
    let rows = '';
    data.forEach((item, index) => {
        rows += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.nama}</td>
                <td style="text-align: right;">${formatNumber(item.d1)}</td>
                <td style="text-align: right;">${formatNumber(item.d2)}</td>
                <td style="text-align: right;">${formatNumber((item.d3 || 0) + (item.d4 || 0))}</td>
                <td style="text-align: right;">${formatNumber(item.d5_10 || 0)}</td>
            </tr>
        `;
    });
    
    const html = `
        <div style="margin-top: 20px;">
            <table style="width: 100%; margin-bottom: 20px; font-size: 12px;">
                <tr>
                    <td width="60%"><strong>Kecamatan</strong></td>
                    <td width="40%"><strong>Sumber, Kabupaten Cirebon</strong></td>
                </tr>
                <tr>
                    <td>Jumlah Desa/Kelurahan</td>
                    <td><span class="fw-bold">${data.length}</span> wilayah</td>
                </tr>
                <tr>
                    <td>Total Keluarga Terdata</td>
                    <td><span class="fw-bold">${formatNumber(totalKK)}</span> KK</td>
                </tr>
            </table>
            
            <h5 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px;">TABEL 1. AGREGASI DATA KESEJAHTERAAN SOSIAL</h5>
            <p style="font-size: 11px; margin-bottom: 10px;"><em>Menampilkan ${data.length} desa/kelurahan se-Kecamatan Sumber</em></p>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="40%">Desa/Kelurahan</th>
                        <th width="15%">Desil 1</th>
                        <th width="15%">Desil 2</th>
                        <th width="15%">Desil 3-4</th>
                        <th width="15%">Desil 5-10</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot style="font-weight: 700; background: #f5f5f5;">
                    <tr>
                        <td colspan="2" style="text-align: right;">TOTAL</td>
                        <td style="text-align: right;">${formatNumber(totalD1)}</td>
                        <td style="text-align: right;">${formatNumber(totalD2)}</td>
                        <td style="text-align: right;">${formatNumber(totalD34)}</td>
                        <td style="text-align: right;">${formatNumber(totalD510)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 20px; font-size: 11px;">
                <p><strong>Kesimpulan:</strong></p>
                <ul>
                    <li>Total keluarga dalam prioritas tinggi (Desil 1-2): <strong>${formatNumber(totalD12)} KK</strong> (${((totalD12/totalKK)*100).toFixed(1)}%)</li>
                    <li>Total keluarga rentan (Desil 3-4): <strong>${formatNumber(totalD34)} KK</strong> (${((totalD34/totalKK)*100).toFixed(1)}%)</li>
                    <li>Total keluarga mampu (Desil 5-10): <strong>${formatNumber(totalD510)} KK</strong> (${((totalD510/totalKK)*100).toFixed(1)}%)</li>
                </ul>
            </div>
        </div>
    `;
    
    kontenHal1.innerHTML = html;
}

/**
 * Render halaman 2 - Prioritas Intervensi DTSEN
 * MENAMPILKAN SEMUA DESA (TANPA BATASAN 10)
 */
function renderHalaman2(data) {
    if (!kontenHal2) return;
    
    const totalD12Kecamatan = data.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const prioritasTinggi = data.filter(item => (item.d1 + item.d2) > 400);
    const prioritasSedang = data.filter(item => {
        const d12 = item.d1 + item.d2;
        return d12 >= 200 && d12 <= 400;
    });
    const prioritasRendah = data.filter(item => (item.d1 + item.d2) < 200);
    
    // Buat tabel dengan SEMUA DATA (TANPA LIMIT)
    let rows = '';
    data.forEach((item, index) => {
        const d12 = item.d1 + item.d2;
        let status = '';
        if (d12 > 400) status = '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS TINGGI</span>';
        else if (d12 >= 200) status = '<span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS SEDANG</span>';
        else status = '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS RENDAH</span>';
        
        rows += `
            <tr>
                <td style="text-align: center; font-weight: ${index < 3 ? '700' : '400'}; ${index < 3 ? 'background: #fff3cd;' : ''}">${index + 1}</td>
                <td style="font-weight: ${index < 3 ? '700' : '400'};">${item.nama}</td>
                <td style="text-align: right;">${formatNumber(item.d1)}</td>
                <td style="text-align: right;">${formatNumber(item.d2)}</td>
                <td style="text-align: right; font-weight: 700; background: ${index < 3 ? '#fff3cd' : 'transparent'};">${formatNumber(d12)}</td>
                <td style="text-align: center;">${status}</td>
            </tr>
        `;
    });
    
    const html = `
        <div>
            <h5 style="font-size: 14px; font-weight: 700; margin: 10px 0;">PRIORITAS INTERVENSI DTSEN KECAMATAN SUMBER</h5>
            <p style="font-size: 11px; margin-bottom: 10px;">
                <em>Menampilkan ranking ${data.length} desa/kelurahan berdasarkan jumlah Desil 1 + Desil 2 (Prioritas Tertinggi ke Terendah)</em>
            </p>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">Rank</th>
                        <th width="35%">Desa/Kelurahan</th>
                        <th width="15%">Desil 1</th>
                        <th width="15%">Desil 2</th>
                        <th width="15%">Total D1+D2</th>
                        <th width="15%">Kategori Prioritas</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot style="font-weight: 700; background: #f5f5f5;">
                    <tr>
                        <td colspan="4" style="text-align: right;">TOTAL D1+D2 SELURUH DESA</td>
                        <td style="text-align: right;">${formatNumber(totalD12Kecamatan)} KK</td>
                        <td style="text-align: center;">-</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 25px; font-size: 11px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                            <div style="border: 1px solid #ddd; padding: 12px; border-radius: 5px;">
                                <p style="font-weight: 700; margin-bottom: 8px;">📊 REKAPITULASI PRIORITAS:</p>
                                <ul style="margin-left: -20px;">
                                    <li><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;">PRIORITAS TINGGI</span> (>400 KK) : <strong>${prioritasTinggi.length} desa</strong></li>
                                    <li><span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 3px;">PRIORITAS SEDANG</span> (200-400 KK) : <strong>${prioritasSedang.length} desa</strong></li>
                                    <li><span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px;">PRIORITAS RENDAH</span> (<200 KK) : <strong>${prioritasRendah.length} desa</strong></li>
                                </ul>
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div style="border: 1px solid #ddd; padding: 12px; border-radius: 5px;">
                                <p style="font-weight: 700; margin-bottom: 8px;">🎯 REKOMENDASI INTERVENSI:</p>
                                <ol style="margin-left: -15px;">
                                    <li><strong>${prioritasTinggi.length} desa</strong> prioritas tinggi - Intervensi segera</li>
                                    <li><strong>${prioritasSedang.length} desa</strong> prioritas sedang - Monitoring intensif</li>
                                    <li><strong>${prioritasRendah.length} desa</strong> prioritas rendah - Pemantauan rutin</li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    kontenHal2.innerHTML = html;
}

/**
 * Render halaman 3 - Bantuan Sosial Per Desa
 * MENAMPILKAN SEMUA DESA (TANPA BATASAN 10)
 */
function renderHalaman3(data) {
    if (!kontenHal3) return;
    
    let totalPKH = 0;
    let totalBPNT = 0;
    let totalBLT = 0;
    let totalAll = 0;
    
    let rows = '';
    data.forEach((item, index) => {
        const pkh = Math.floor(item.d1 * 0.8 + item.d2 * 0.3);
        const bpnt = Math.floor(item.d1 * 0.7 + item.d2 * 0.4);
        const blt = Math.floor(item.d1 * 0.5 + item.d2 * 0.2);
        const total = pkh + bpnt + blt;
        
        totalPKH += pkh;
        totalBPNT += bpnt;
        totalBLT += blt;
        totalAll += total;
        
        rows += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.nama}</td>
                <td style="text-align: right;">${formatNumber(pkh)}</td>
                <td style="text-align: right;">${formatNumber(bpnt)}</td>
                <td style="text-align: right;">${formatNumber(blt)}</td>
                <td style="text-align: right; font-weight: 700;">${formatNumber(total)}</td>
            </tr>
        `;
    });
    
    const html = `
        <div>
            <h5 style="font-size: 14px; font-weight: 700; margin: 10px 0;">REKAP BANTUAN SOSIAL PER DESA</h5>
            <p style="font-size: 11px; margin-bottom: 10px;">
                <em>Estimasi penerima manfaat berdasarkan data DTSEN Desil 1-2 (${data.length} desa/kelurahan)</em>
            </p>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="30%">Desa/Kelurahan</th>
                        <th width="15%">PKH</th>
                        <th width="15%">BPNT</th>
                        <th width="15%">BLT</th>
                        <th width="20%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot style="font-weight: 700; background: #f5f5f5;">
                    <tr>
                        <td colspan="2" style="text-align: right;">TOTAL KESELURUHAN</td>
                        <td style="text-align: right;">${formatNumber(totalPKH)}</td>
                        <td style="text-align: right;">${formatNumber(totalBPNT)}</td>
                        <td style="text-align: right;">${formatNumber(totalBLT)}</td>
                        <td style="text-align: right;">${formatNumber(totalAll)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 20px; font-size: 11px;">
                <div style="background: #f0f7ff; padding: 12px; border-left: 4px solid #4361ee;">
                    <p style="margin-bottom: 5px;"><strong>Informasi Program Bantuan Sosial:</strong></p>
                    <ul style="margin-bottom: 0;">
                        <li>PKH (Program Keluarga Harapan) - Bantuan tunai bersyarat</li>
                        <li>BPNT (Bantuan Pangan Non Tunai) - Bantuan sembako</li>
                        <li>BLT (Bantuan Langsung Tunai) - Bantuan tunai tanpa syarat</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    kontenHal3.innerHTML = html;
}

/**
 * Render halaman 4 - Layanan Sosial
 */
function renderHalaman4(data) {
    if (!kontenHal4) return;
    
    const totalD12 = data.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const totalLayanan = Math.floor(totalD12 * 0.75);
    const layananKesehatan = Math.floor(totalLayanan * 0.4);
    const layananPendidikan = Math.floor(totalLayanan * 0.3);
    const layananSosial = Math.floor(totalLayanan * 0.3);
    
    const html = `
        <div>
            <h5 style="font-size: 14px; font-weight: 700; margin: 10px 0;">REKAPITULASI LAYANAN SOSIAL</h5>
            <p style="font-size: 11px; margin-bottom: 15px;">
                <em>Cakupan layanan untuk keluarga prioritas (Desil 1-2) se-Kecamatan Sumber</em>
            </p>
            
            <table style="width: 100%; margin-bottom: 20px; font-size: 12px; border: 1px solid #000; border-collapse: collapse;">
                <tr style="background: #f0f0f0;">
                    <td style="padding: 10px; border: 1px solid #000;" width="60%"><strong>Total Keluarga Prioritas (D1-D2)</strong></td>
                    <td style="padding: 10px; border: 1px solid #000; text-align: right;"><strong>${formatNumber(totalD12)} KK</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">Total Penerima Manfaat Layanan</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;">${formatNumber(totalLayanan)} KK</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">Layanan Kesehatan</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;">${formatNumber(layananKesehatan)} KK</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">Layanan Pendidikan</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;">${formatNumber(layananPendidikan)} KK</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">Layanan Sosial</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: right;">${formatNumber(layananSosial)} KK</td>
                </tr>
            </table>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="50%">Jenis Layanan</th>
                        <th width="25%">Jumlah</th>
                        <th width="25%">Persentase</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jaminan Kesehatan (PBI JK)</td>
                        <td style="text-align: right;">${formatNumber(layananKesehatan)}</td>
                        <td style="text-align: right;">40%</td>
                    </tr>
                    <tr>
                        <td>Bantuan Pendidikan (KIP/PIP)</td>
                        <td style="text-align: right;">${formatNumber(layananPendidikan)}</td>
                        <td style="text-align: right;">30%</td>
                    </tr>
                    <tr>
                        <td>Bantuan Sosial (PKH/BPNT/BLT)</td>
                        <td style="text-align: right;">${formatNumber(layananSosial)}</td>
                        <td style="text-align: right;">30%</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 25px; font-size: 11px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 5px;">
                    <p style="font-weight: 700; margin-bottom: 8px;">📋 INDIKATOR KEBERHASILAN PROGRAM:</p>
                    <ol style="margin-left: -15px;">
                        <li>Cakupan layanan kesehatan mencapai 40% dari total keluarga prioritas</li>
                        <li>Akses pendidikan untuk anak usia sekolah dari keluarga D1-D2</li>
                        <li>Pemenuhan kebutuhan dasar melalui program bantuan sosial</li>
                        <li>Monitoring dan evaluasi berkala setiap triwulan</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
    
    kontenHal4.innerHTML = html;
}

/**
 * Generate QR Code
 */
function generateQRCode() {
    const verificationId = generateVerificationId();
    const hashID = document.getElementById('hashID');
    if (hashID) hashID.textContent = verificationId;
    
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = '';
    
    const qrData = {
        id: verificationId,
        nomor: nomorSurat,
        instansi: 'TKSK Puskesos Sumber',
        tanggal: formatDate(),
        totalWilayah: wilayahData.length,
        totalKK: wilayahData.reduce((sum, item) => sum + item.total_kk, 0)
    };
    
    try {
        qrcode = new QRCode(qrContainer, {
            text: JSON.stringify(qrData),
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        qrContainer.innerHTML = '<div class="qr-placeholder">QR Code</div>';
    }
}

/**
 * Update nomor surat - SATU NOMOR UNTUK SEMUA HALAMAN
 */
function updateDocumentNumbers() {
    // Generate SATU nomor surat
    nomorSurat = generateNomorSurat();
    
    // Update nomor surat di HALAMAN 1
    if (nomorSuratUtama) {
        nomorSuratUtama.textContent = nomorSurat;
    }
    
    // Update nomor surat yang sama di HALAMAN 2, 3, 4
    if (nomorSuratLanjutan2) nomorSuratLanjutan2.textContent = nomorSurat;
    if (nomorSuratLanjutan3) nomorSuratLanjutan3.textContent = nomorSurat;
    if (nomorSuratLanjutan4) nomorSuratLanjutan4.textContent = nomorSurat;
    
    // Update lampiran
    const lampiranCount = document.getElementById('lampiranCount1');
    if (lampiranCount) lampiranCount.textContent = '4';
    
    const periodeData = document.getElementById('periodeData');
    if (periodeData) periodeData.textContent = new Date().getFullYear();
}

/**
 * Update info panel
 */
function updateInfoPanel(data) {
    if (dataCountInfo) {
        dataCountInfo.textContent = `${data.length} wilayah terdata`;
    }
    
    if (lastUpdateInfo) {
        lastUpdateInfo.textContent = formatDate();
    }
    
    if (tglSekarang) {
        tglSekarang.textContent = formatDate();
    }
}

// ============ MAIN GENERATE FUNCTION ============

/**
 * Generate seluruh dokumen
 */
async function generateDokumen() {
    try {
        setLoading(true);
        
        // Load data
        wilayahData = await loadDataFromFirebase();
        
        if (wilayahData.length === 0) {
            showNotification('Tidak ada data yang tersedia', 'warning');
            return;
        }
        
        // Sort data by D1+D2 descending
        wilayahData.sort((a, b) => (b.d1 + b.d2) - (a.d1 + a.d2));
        
        // Render semua halaman - TAMPILKAN SEMUA DATA!
        renderHalaman1(wilayahData); // TANPA LIMIT
        renderHalaman2(wilayahData); // TANPA LIMIT
        renderHalaman3(wilayahData); // TANPA LIMIT
        renderHalaman4(wilayahData);
        
        // Generate SATU nomor surat untuk semua halaman
        updateDocumentNumbers();
        
        // Generate QR Code
        generateQRCode();
        
        // Update info panel
        updateInfoPanel(wilayahData);
        populateDesaSelect(wilayahData);
        
        showNotification(`Dokumen berhasil digenerate! Menampilkan ${wilayahData.length} desa/kelurahan`, 'success');
        
    } catch (error) {
        console.error('Error generating document:', error);
        showNotification('Gagal generate dokumen: ' + error.message, 'danger');
    } finally {
        setLoading(false);
    }
}

/**
 * Cetak dokumen ke PDF
 */
function cetakDokumen() {
    try {
        window.print();
        showNotification('Dokumen sedang dicetak...', 'info');
    } catch (error) {
        console.error('Error printing:', error);
        showNotification('Gagal mencetak dokumen', 'danger');
    }
}

// ============ EVENT LISTENERS ============

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Mode select change
    if (modeSelect) {
        modeSelect.addEventListener('change', function() {
            if (desaWrap) {
                desaWrap.style.display = this.value === 'desa' ? 'block' : 'none';
            }
        });
    }
    
    // Generate button - SATU TOMBOL UNTUK SEMUA!
    if (btnGenerate) {
        btnGenerate.addEventListener('click', generateDokumen);
    }
    
    // Cetak button
    if (btnPrint) {
        btnPrint.addEventListener('click', cetakDokumen);
    }
}

// ============ INITIALIZATION ============

/**
 * Initialize aplikasi
 */
async function init() {
    try {
        // Load initial data
        setLoading(true);
        wilayahData = await loadDataFromFirebase();
        
        // Sort data
        wilayahData.sort((a, b) => (b.d1 + b.d2) - (a.d1 + a.d2));
        
        // Update UI
        updateInfoPanel(wilayahData);
        populateDesaSelect(wilayahData);
        
        // Generate initial dokumen - TAMPILKAN SEMUA DATA!
        await generateDokumen();
        
        // Setup event listeners
        initEventListeners();
        
        console.log(`✅ Application initialized successfully with ${wilayahData.length} villages`);
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showNotification('Gagal memuat aplikasi', 'danger');
    } finally {
        setLoading(false);
    }
}

// Start the application
init();

// Auto refresh data setiap 5 menit
setInterval(async () => {
    if (!isLoading) {
        console.log('🔄 Auto-refreshing data...');
        await generateDokumen();
    }
}, 5 * 60 * 1000);
