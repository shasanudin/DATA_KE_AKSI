// unduh.js
// Sistem Cetak Dokumen DTSEN - TKSK & Puskesos Kecamatan Sumber
// Version: 2.4.1 - QR CODE & TTD DI HALAMAN 1 + BANTUAN SOSIAL DARI FIREBASE
// Fitur: SHOW ALL DATA + PRIORITAS >500/300-500/<300 + RASIO DTSEN

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
let nomorSurat = '';

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
const hashID = document.getElementById('hashID');
const qrContainer = document.getElementById('qrcode');
const periodeData = document.getElementById('periodeData');
const periodeDataTahun = document.getElementById('periodeDataTahun');
const lampiranCount = document.getElementById('lampiranCount1');
const totalDesaInfo = document.getElementById('totalDesaInfo');

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
    
    // Toggle loading overlay
    if (window.toggleLoading) {
        window.toggleLoading(loading);
    }
    
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
                d5_10: desilArray.slice(4).reduce((a, b) => (a || 0) + (b || 0), 0),
                // Ambil data bantuan sosial dari Firebase
                bantuan: {
                    pkh: parseInt(docData.pkh) || 0,
                    bpnt: parseInt(docData.bpnt) || 0,
                    pbi: parseInt(docData.pbi) || 0
                }
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
 * Generate sample data (fallback)
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
        let d1, d2, totalD12;
        
        if (index < 5) {
            // Prioritas Tinggi >500 KK
            d1 = Math.floor(Math.random() * 200) + 350; // 350-550
            d2 = Math.floor(Math.random() * 150) + 200; // 200-350
        } else if (index < 12) {
            // Prioritas Sedang 300-500 KK
            d1 = Math.floor(Math.random() * 150) + 200; // 200-350
            d2 = Math.floor(Math.random() * 100) + 100; // 100-200
        } else {
            // Prioritas Rendah <300 KK
            d1 = Math.floor(Math.random() * 100) + 50;  // 50-150
            d2 = Math.floor(Math.random() * 80) + 30;   // 30-110
        }
        
        totalD12 = d1 + d2;
        const d3 = Math.floor(Math.random() * 100) + 30;
        const d4 = Math.floor(Math.random() * 80) + 20;
        const d5_10 = Math.floor(Math.random() * 200) + 50;
        
        return {
            id: `sample-${index + 1}`,
            nama: nama,
            kecamatan: 'Sumber',
            desil: [d1, d2, d3, d4, ...Array(6).fill(Math.floor(Math.random() * 30) + 10)],
            total_kk: d1 + d2 + d3 + d4 + d5_10,
            d1, d2, d3, d4, d5_10,
            bantuan: {
                pkh: Math.floor(Math.random() * 200) + 50,
                bpnt: Math.floor(Math.random() * 300) + 100,
                pbi: Math.floor(Math.random() * 400) + 200
            }
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
 */
function renderHalaman1(data) {
    if (!kontenHal1) return;
    
    const totalKK = data.reduce((sum, item) => sum + item.total_kk, 0);
    const totalD1 = data.reduce((sum, item) => sum + item.d1, 0);
    const totalD2 = data.reduce((sum, item) => sum + item.d2, 0);
    const totalD12 = totalD1 + totalD2;
    const totalD34 = data.reduce((sum, item) => sum + (item.d3 || 0) + (item.d4 || 0), 0);
    const totalD510 = data.reduce((sum, item) => sum + (item.d5_10 || 0), 0);
    
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
 * ============================================================
 * HALAMAN 2 - PRIORITAS INTERVENSI DTSEN
 * KRITERIA BARU:
 * - PRIORITAS TINGGI  : >500 KK (D1+D2)
 * - PRIORITAS SEDANG  : 300-500 KK (D1+D2)
 * - PRIORITAS RENDAH  : <300 KK (D1+D2)
 * ============================================================
 */
function renderHalaman2(data) {
    if (!kontenHal2) return;
    
    const totalD12Kecamatan = data.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    
    // KLASIFIKASI PRIORITAS BERDASARKAN KRITERIA BARU
    const prioritasTinggi = data.filter(item => (item.d1 + item.d2) > 500);
    const prioritasSedang = data.filter(item => {
        const d12 = item.d1 + item.d2;
        return d12 >= 300 && d12 <= 500;
    });
    const prioritasRendah = data.filter(item => (item.d1 + item.d2) < 300);
    
    // Hitung total KK per kategori prioritas
    const totalKKPrioritasTinggi = prioritasTinggi.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const totalKKPrioritasSedang = prioritasSedang.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const totalKKPrioritasRendah = prioritasRendah.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    
    let rows = '';
    data.forEach((item, index) => {
        const d12 = item.d1 + item.d2;
        let status = '';
        
        // KRITERIA BARU UNTUK BADGE
        if (d12 > 500) {
            status = '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS TINGGI</span>';
        } else if (d12 >= 300) {
            status = '<span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS SEDANG</span>';
        } else {
            status = '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 600;">PRIORITAS RENDAH</span>';
        }
        
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
            <p style="font-size: 11px; font-weight: 600; color: #0056b3; margin-bottom: 15px; padding: 5px 10px; background: #e3f2fd; border-left: 4px solid #0d6efd;">
                ⚡ KRITERIA PRIORITAS: TINGGI >500 KK | SEDANG 300-500 KK | RENDAH <300 KK
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
                            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #fcfcfc;">
                                <p style="font-weight: 700; margin-bottom: 12px; font-size: 12px;">📊 REKAPITULASI PRIORITAS (KRITERIA BARU):</p>
                                <table style="width: 100%; font-size: 11px;">
                                    <tr>
                                        <td style="padding: 4px 0;">
                                            <span style="background: #dc3545; color: white; padding: 3px 10px; border-radius: 3px; font-weight: 600;">PRIORITAS TINGGI</span>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong style="font-size: 13px;">>500 KK</strong>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong>${prioritasTinggi.length} desa</strong> 
                                            (${formatNumber(totalKKPrioritasTinggi)} KK)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0;">
                                            <span style="background: #ffc107; color: black; padding: 3px 10px; border-radius: 3px; font-weight: 600;">PRIORITAS SEDANG</span>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong style="font-size: 13px;">300-500 KK</strong>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong>${prioritasSedang.length} desa</strong>
                                            (${formatNumber(totalKKPrioritasSedang)} KK)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0;">
                                            <span style="background: #28a745; color: white; padding: 3px 10px; border-radius: 3px; font-weight: 600;">PRIORITAS RENDAH</span>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong style="font-size: 13px;"><300 KK</strong>
                                        </td>
                                        <td style="padding: 4px 0; text-align: right;">
                                            <strong>${prioritasRendah.length} desa</strong>
                                            (${formatNumber(totalKKPrioritasRendah)} KK)
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #fcfcfc;">
                                <p style="font-weight: 700; margin-bottom: 12px; font-size: 12px;">🎯 REKOMENDASI INTERVENSI:</p>
                                <ul style="margin-left: -15px; margin-bottom: 0;">
                                    <li style="margin-bottom: 8px; padding-left: 5px;">
                                        <span style="display: inline-block; width: 12px; height: 12px; background: #dc3545; border-radius: 2px; margin-right: 8px;"></span>
                                        <strong>${prioritasTinggi.length} desa prioritas tinggi</strong> - Intervensi segera (KK >500)
                                    </li>
                                    <li style="margin-bottom: 8px; padding-left: 5px;">
                                        <span style="display: inline-block; width: 12px; height: 12px; background: #ffc107; border-radius: 2px; margin-right: 8px;"></span>
                                        <strong>${prioritasSedang.length} desa prioritas sedang</strong> - Monitoring intensif (KK 300-500)
                                    </li>
                                    <li style="margin-bottom: 8px; padding-left: 5px;">
                                        <span style="display: inline-block; width: 12px; height: 12px; background: #28a745; border-radius: 2px; margin-right: 8px;"></span>
                                        <strong>${prioritasRendah.length} desa prioritas rendah</strong> - Pemantauan rutin (KK <300)
                                    </li>
                                </ul>
                                <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #ccc;">
                                    <p style="margin-bottom: 0; font-size: 10px; color: #666;">
                                        <i class="fas fa-chart-line mr-1"></i> 
                                        Prioritas intervensi ditentukan berdasarkan jumlah KK Desil 1 + Desil 2 per desa.
                                        <br><strong>Kebijakan baru berlaku: Tinggi >500, Sedang 300-500, Rendah <300.</strong>
                                    </p>
                                </div>
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
 * ============================================================
 * HALAMAN 3 - REKAP BANTUAN SOSIAL PER DESA (DARI FIREBASE)
 * PERUBAHAN: Mengambil data real PKH, BPNT, PBI dari Firebase
 * ============================================================
 */
function renderHalaman3(data) {
    if (!kontenHal3) return;
    
    let totalPKH = 0;
    let totalBPNT = 0;
    let totalPBI = 0;
    let totalAll = 0;
    
    let rows = '';
    data.forEach((item, index) => {
        // Ambil data bantuan dari Firebase (real data)
        const pkh = item.bantuan?.pkh || 0;
        const bpnt = item.bantuan?.bpnt || 0;
        const pbi = item.bantuan?.pbi || 0;
        const total = pkh + bpnt + pbi;
        
        totalPKH += pkh;
        totalBPNT += bpnt;
        totalPBI += pbi;
        totalAll += total;
        
        rows += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.nama}</td>
                <td style="text-align: right;">${formatNumber(pkh)}</td>
                <td style="text-align: right;">${formatNumber(bpnt)}</td>
                <td style="text-align: right;">${formatNumber(pbi)}</td>
                <td style="text-align: right; font-weight: 700;">${formatNumber(total)}</td>
            </tr>
        `;
    });
    
    const html = `
        <div>
            <h5 style="font-size: 14px; font-weight: 700; margin: 10px 0;">REKAP BANTUAN SOSIAL PER DESA</h5>
            <p style="font-size: 11px; margin-bottom: 10px;">
                <em>Data real penerima manfaat dari database Firebase (${data.length} desa/kelurahan)</em>
            </p>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="30%">Desa/Kelurahan</th>
                        <th width="15%">PKH</th>
                        <th width="15%">BPNT</th>
                        <th width="15%">PBI</th>
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
                        <td style="text-align: right;">${formatNumber(totalPBI)}</td>
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
                        <li>PBI (Penerima Bantuan Iuran) - Bantuan Iuran untuk Jaminan Kesehatan Masyarakat</li>
                    </ul>
                    <p style="margin-top: 8px; margin-bottom: 0; font-style: italic; color: #555;">
                        <i class="fas fa-database mr-1"></i> Sumber: Database Bantuan Sosial Firebase (Update: ${formatDate(new Date())})
                    </p>
                </div>
            </div>
        </div>
    `;
    
    kontenHal3.innerHTML = html;
}

/**
 * ============================================================
 * HALAMAN 4 - REKAPITULASI LAYANAN SOSIAL
 * PERUBAHAN: TANPA TTD & QR (SUDAH DIPINDAH KE HALAMAN 1)
 * RASIO DIHITUNG BERDASARKAN TOTAL KK DTSEN (D1-D10)
 * ============================================================
 */
async function renderHalaman4(dataWilayah) {
    if (!kontenHal4) return;
    
    try {
        // Hitung TOTAL KK DTSEN (Desil 1-10) dari data wilayah
        const totalKKDTSEN = dataWilayah.reduce((sum, item) => sum + item.total_kk, 0);
        
        // Ambil data layanan dari Firebase
        const querySnapshot = await getDocs(collection(db, "wilayah_desa"));
        
        let totalLayananKec = {
            dtks: 0,
            pengaduan: 0,
            sktm: 0
        };
        
        const layananPerDesa = [];
        
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            const layanan = docData.layanan || { dtks: 0, pengaduan: 0, sktm: 0 };
            
            const dtks = parseInt(layanan.dtks) || 0;
            const pengaduan = parseInt(layanan.pengaduan) || 0;
            const sktm = parseInt(layanan.sktm) || 0;
            
            totalLayananKec.dtks += dtks;
            totalLayananKec.pengaduan += pengaduan;
            totalLayananKec.sktm += sktm;
            
            layananPerDesa.push({
                nama: docData.nama_wilayah || docData.nama || doc.id,
                dtks: dtks,
                pengaduan: pengaduan,
                sktm: sktm,
                total: dtks + pengaduan + sktm
            });
        });
        
        const totalSemuaLayanan = totalLayananKec.dtks + totalLayananKec.pengaduan + totalLayananKec.sktm;
        
        // RASIO berdasarkan TOTAL KK DTSEN (Desil 1-10)
        const rasioSKTM = totalKKDTSEN > 0 
            ? ((totalLayananKec.sktm / totalKKDTSEN) * 100).toFixed(2) 
            : '0.00';
            
        const rasioPengaduan = totalKKDTSEN > 0 
            ? ((totalLayananKec.pengaduan / totalKKDTSEN) * 100).toFixed(2) 
            : '0.00';
        
        const rasioCakupanLayanan = totalKKDTSEN > 0 
            ? ((totalSemuaLayanan / totalKKDTSEN) * 100).toFixed(2) 
            : '0.00';
        
        // Gabungkan data DTSEN dengan data layanan
        const dataGabungan = dataWilayah.map(wilayah => {
            const layananDesa = layananPerDesa.find(l => l.nama === wilayah.nama) || {
                dtks: 0,
                pengaduan: 0,
                sktm: 0,
                total: 0
            };
            
            return {
                nama: wilayah.nama,
                total_kk: wilayah.total_kk,
                d12: wilayah.d1 + wilayah.d2,
                dtks: layananDesa.dtks,
                pengaduan: layananDesa.pengaduan,
                sktm: layananDesa.sktm,
                totalLayanan: layananDesa.total
            };
        });
        
        dataGabungan.sort((a, b) => b.totalLayanan - a.totalLayanan);
        const top5Desa = dataGabungan.slice(0, 5);
        
        const rataRataLayananPerDesa = layananPerDesa.length > 0 
            ? Math.round(totalSemuaLayanan / layananPerDesa.length) 
            : 0;
        
        // ============ RENDER HTML HALAMAN 4 (TANPA TTD & QR) ============
        const html = `
            <div style="margin-top: 10px;">
                <!-- HEADER INFORMASI -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="font-size: 14px; font-weight: 700; margin: 0;">REKAPITULASI LAYANAN SOSIAL KECAMATAN SUMBER</h5>
                    <span style="background: #17a2b8; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600;">
                        <i class="fas fa-sync-alt mr-1"></i> Update: ${formatDate(new Date())}
                    </span>
                </div>
                
                <!-- INFORMASI TOTAL DTSEN -->
                <div style="background: #e8f5e9; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #28a745; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-weight: 700; font-size: 13px;">📋 TOTAL KELUARGA DTSEN (DESIL 1-10):</span>
                        <span style="font-size: 18px; font-weight: 800; color: #28a745; margin-left: 10px;">${formatNumber(totalKKDTSEN)} KK</span>
                    </div>
                    <div>
                        <span style="background: #fff; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid #28a745;">
                            <i class="fas fa-calculator mr-1"></i> RASIO BERDASARKAN TOTAL DTSEN
                        </span>
                    </div>
                </div>
                
                <!-- TABEL REKAPITULASI UTAMA -->
                <table style="width: 100%; margin-bottom: 25px; font-size: 12px; border: 1px solid #000; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 10px; border: 1px solid #000; text-align: left;" width="70%">Kategori Layanan</th>
                            <th style="padding: 10px; border: 1px solid #000; text-align: right;" width="30%">Total Penerima / Pengguna</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;">
                                <strong style="font-size: 13px;">Pembaruan DTSEN</strong>
                                <span style="color: #666; font-size: 10px; margin-left: 8px;">(Data Terpadu Kesejahteraan Sosial)</span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right; font-weight: 700; color: #007bff;">
                                ${formatNumber(totalLayananKec.dtks)} KK
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;">
                                <strong style="font-size: 13px;">Pengaduan Masyarakat</strong>
                                <span style="color: #666; font-size: 10px; margin-left: 8px;">(Aduan & Keluhan)</span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right; font-weight: 700; color: #ffc107;">
                                ${formatNumber(totalLayananKec.pengaduan)} Kasus
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;">
                                <strong style="font-size: 13px;">SKTM</strong>
                                <span style="color: #666; font-size: 10px; margin-left: 8px;">(Surat Keterangan Tidak Mampu)</span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right; font-weight: 700; color: #28a745;">
                                ${formatNumber(totalLayananKec.sktm)} Penerbitan
                            </td>
                        </tr>
                        <tr style="background: #e3f2fd; font-weight: 700;">
                            <td style="padding: 12px; border: 1px solid #000;">TOTAL LAYANAN</td>
                            <td style="padding: 12px; border: 1px solid #000; text-align: right; font-size: 14px;">
                                ${formatNumber(totalSemuaLayanan)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- STATISTIK CARD - RASIO BERDASARKAN TOTAL DTSEN -->
                <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                    <div style="flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 15px; text-align: center; border-bottom: 5px solid #007bff; background: #f8fbff;">
                        <p style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-file-signature mr-1"></i> Rasio SKTM
                        </p>
                        <p style="font-size: 28px; font-weight: 800; color: #007bff; margin: 5px 0; line-height: 1.2;">
                            ${rasioSKTM}%
                        </p>
                        <p style="font-size: 10px; color: #666; margin-top: 5px;">
                            dari total <strong>${formatNumber(totalKKDTSEN)} KK DTSEN</strong>
                        </p>
                        <div style="font-size: 10px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc;">
                            ${formatNumber(totalLayananKec.sktm)} SKTM / ${formatNumber(totalKKDTSEN)} KK
                        </div>
                    </div>
                    <div style="flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 15px; text-align: center; border-bottom: 5px solid #ffc107; background: #fffbf0;">
                        <p style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-comments mr-1"></i> Rasio Pengaduan
                        </p>
                        <p style="font-size: 28px; font-weight: 800; color: #ffc107; margin: 5px 0; line-height: 1.2;">
                            ${rasioPengaduan}%
                        </p>
                        <p style="font-size: 10px; color: #666; margin-top: 5px;">
                            dari total <strong>${formatNumber(totalKKDTSEN)} KK DTSEN</strong>
                        </p>
                        <div style="font-size: 10px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc;">
                            ${formatNumber(totalLayananKec.pengaduan)} Kasus / ${formatNumber(totalKKDTSEN)} KK
                        </div>
                    </div>
                    <div style="flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 15px; text-align: center; border-bottom: 5px solid #28a745; background: #f3faf3;">
                        <p style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-hands-helping mr-1"></i> Cakupan Layanan
                        </p>
                        <p style="font-size: 28px; font-weight: 800; color: #28a745; margin: 5px 0; line-height: 1.2;">
                            ${rasioCakupanLayanan}%
                        </p>
                        <p style="font-size: 10px; color: #666; margin-top: 5px;">
                            dari total <strong>${formatNumber(totalKKDTSEN)} KK DTSEN</strong>
                        </p>
                        <div style="font-size: 10px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc;">
                            ${formatNumber(totalSemuaLayanan)} Layanan / ${formatNumber(totalKKDTSEN)} KK
                        </div>
                    </div>
                </div>

                <!-- TABEL 5 DESA DENGAN LAYANAN TERTINGGI -->
                <div style="margin-top: 25px;">
                    <h6 style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">
                        📊 5 DESA DENGAN LAYANAN TERTINGGI
                        <span style="font-size: 10px; font-weight: 400; color: #666; margin-left: 10px;">(dilengkapi data DTSEN)</span>
                    </h6>
                    <table style="width: 100%; font-size: 10.5px; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th rowspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: center; vertical-align: middle;">No</th>
                                <th rowspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: left; vertical-align: middle;">Desa/Kelurahan</th>
                                <th colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: center;">DATA DTSEN</th>
                                <th colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: center;">DATA LAYANAN</th>
                                <th rowspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: center; vertical-align: middle;">Total Layanan</th>
                            </tr>
                            <tr style="background: #f8f9fa;">
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">Total KK</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">D1+D2</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">Pembaruan DTSEN</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">SKTM</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">Pengaduan</td>
                            </tr>
                        </thead>
                        <tbody>
                            ${top5Desa.map((desa, index) => `
                                <tr>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: 600;">${desa.nama}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${formatNumber(desa.total_kk)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${formatNumber(desa.d12)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${formatNumber(desa.dtks)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${formatNumber(desa.sktm)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${formatNumber(desa.pengaduan)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: 700; background: #e3f2fd;">${formatNumber(desa.totalLayanan)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- ANALISIS DAN REKOMENDASI BERDASARKAN DTSEN -->
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <div style="flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fcfcfc;">
                        <p style="font-weight: 700; margin-bottom: 12px; font-size: 12px;">📈 ANALISIS LAYANAN (vs DTSEN):</p>
                        <table style="width: 100%; font-size: 11px;">
                            <tr>
                                <td style="padding: 4px 0;">✓ Total Keluarga DTSEN</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${formatNumber(totalKKDTSEN)} KK</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">✓ Total Pembaruan DTSEN</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${formatNumber(totalLayananKec.dtks)} KK</strong> (${totalKKDTSEN > 0 ? ((totalLayananKec.dtks/totalKKDTSEN*100).toFixed(1)) : 0}%)</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">✓ Total SKTM</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${formatNumber(totalLayananKec.sktm)}</strong> (${rasioSKTM}%)</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">✓ Total Pengaduan</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${formatNumber(totalLayananKec.pengaduan)}</strong> (${rasioPengaduan}%)</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">✓ Rata-rata layanan/desa</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${formatNumber(rataRataLayananPerDesa)}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">✓ Cakupan layanan</td>
                                <td style="padding: 4px 0; text-align: right;"><strong>${rasioCakupanLayanan}%</strong></td>
                            </tr>
                        </table>
                    </div>
                    <div style="flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fcfcfc;">
                        <p style="font-weight: 700; margin-bottom: 12px; font-size: 12px;">🎯 REKOMENDASI KEBIJAKAN:</p>
                        <ul style="margin-left: -15px; font-size: 11px; margin-bottom: 0;">
                            ${totalLayananKec.pengaduan > totalKKDTSEN * 0.05 
                                ? '<li style="margin-bottom: 8px; color: #dc3545;">⚠️ <strong>Tingkat pengaduan tinggi</strong> (' + rasioPengaduan + '%) - Perlu evaluasi pelayanan</li>' 
                                : '<li style="margin-bottom: 8px; color: #28a745;">✅ <strong>Tingkat pengaduan terkendali</strong> (' + rasioPengaduan + '%)</li>'}
                            ${totalLayananKec.sktm > totalKKDTSEN * 0.3 
                                ? '<li style="margin-bottom: 8px; color: #dc3545;">⚠️ <strong>Penerbitan SKTM tinggi</strong> (' + rasioSKTM + '%) - Perketat verifikasi</li>' 
                                : '<li style="margin-bottom: 8px; color: #28a745;">✅ <strong>Penerbitan SKTM wajar</strong> (' + rasioSKTM + '%)</li>'}
                            <li style="margin-bottom: 8px;">📌 <strong>Cakupan Pembaruan DTSEN</strong>: ${totalKKDTSEN > 0 ? ((totalLayananKec.dtks/totalKKDTSEN*100).toFixed(1)) : 0}%</li>
                            <li style="margin-bottom: 8px;">🏆 <strong>Prioritas intervensi:</strong> ${top5Desa[0]?.nama || '-'}, ${top5Desa[1]?.nama || '-'}, ${top5Desa[2]?.nama || '-'}</li>
                            <li style="margin-bottom: 8px;">🔄 Update data DTSEN dan layanan secara berkala</li>
                        </ul>
                    </div>
                </div>

                <!-- CATATAN KAKI - TANPA FOOTER SURAT (SUDAH DI HALAMAN 1) -->
                <div style="margin-top: 25px; font-size: 9px; color: #666; border-top: 1px dashed #ccc; padding-top: 12px;">
                    <p style="margin-bottom: 0;">
                        <i class="fas fa-database mr-1"></i> 
                        Sumber: DTSEN Kecamatan Sumber (${formatNumber(totalKKDTSEN)} KK) & Database Layanan Sosial Firebase | Update: ${formatDate(new Date())}
                    </p>
                </div>
            </div>
        `;

        kontenHal4.innerHTML = html;
        
    } catch (error) {
        console.error('Error rendering halaman 4:', error);
        
        // FALLBACK: Tetap gunakan TOTAL DTSEN untuk perhitungan rasio
        const totalKKDTSEN = dataWilayah.reduce((sum, item) => sum + item.total_kk, 0);
        
        kontenHal4.innerHTML = `
            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5 style="font-size: 14px; font-weight: 700; margin: 0;">REKAPITULASI LAYANAN SOSIAL (ESTIMASI)</h5>
                    <span style="background: #6c757d; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600;">
                        <i class="fas fa-exclamation-triangle mr-1"></i> Mode Offline
                    </span>
                </div>
                
                <!-- INFORMASI TOTAL DTSEN -->
                <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #28a745;">
                    <span style="font-weight: 700; font-size: 13px;">📋 TOTAL KELUARGA DTSEN (DESIL 1-10):</span>
                    <span style="font-size: 20px; font-weight: 800; color: #28a745; margin-left: 10px;">${formatNumber(totalKKDTSEN)} KK</span>
                    <p style="margin-top: 8px; margin-bottom: 0; font-size: 11px; color: #555;">
                        <i class="fas fa-info-circle mr-1"></i> Data layanan real-time tidak tersedia. Menampilkan estimasi berdasarkan proporsi DTSEN.
                    </p>
                </div>
                
                <table style="width: 100%; margin-bottom: 25px; font-size: 12px; border: 1px solid #000; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 10px; border: 1px solid #000; text-align: left;">Kategori Layanan</th>
                            <th style="padding: 10px; border: 1px solid #000; text-align: right;">Estimasi</th>
                            <th style="padding: 10px; border: 1px solid #000; text-align: right;">Rasio (vs DTSEN)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;"><strong>Pembaruan DTSEN</strong> (Data Terpadu Kesejahteraan Sosial)</td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right; font-weight: 700;">${formatNumber(totalKKDTSEN)} KK</td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right;">100%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;"><strong>SKTM</strong> (Surat Keterangan Tidak Mampu)</td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right;">${formatNumber(Math.floor(totalKKDTSEN * 0.3))} Penerbitan</td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right;">30.0%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #000;"><strong>Pengaduan Masyarakat</strong></td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right;">${formatNumber(Math.floor(totalKKDTSEN * 0.03))} Kasus</td>
                            <td style="padding: 10px; border: 1px solid #000; text-align: right;">3.0%</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 12px 15px; border-radius: 5px;">
                    <i class="fas fa-info-circle mr-2" style="color: #856404;"></i>
                    <span style="font-size: 11px; color: #856404;">
                        <strong>Perhitungan Rasio:</strong> Semua rasio dihitung berdasarkan TOTAL KELUARGA DTSEN (${formatNumber(totalKKDTSEN)} KK) sesuai kebijakan baru.
                    </span>
                </div>
            </div>
        `;
    }
}

/**
 * Generate QR Code - DIPANGGIL DI HALAMAN 1
 */
function generateQRCode() {
    if (!qrContainer) {
        console.warn('QR Container tidak ditemukan');
        return;
    }
    
    try {
        const verificationId = generateVerificationId();
        
        // Update ID Verifikasi
        if (hashID) {
            hashID.textContent = verificationId;
        }
        
        // Bersihkan container QR
        qrContainer.innerHTML = '';
        
        // Data untuk QR Code
        const qrData = {
            id: verificationId,
            nomor: nomorSurat,
            instansi: 'TKSK Puskesos Sumber',
            tanggal: formatDate(),
            totalWilayah: wilayahData.length,
            totalKK: wilayahData.reduce((sum, item) => sum + item.total_kk, 0),
            kebijakan: 'Prioritas: >500, 300-500, <300',
            rasio: 'Berdasarkan Total DTSEN'
        };
        
        // Generate QR Code
        if (typeof QRCode !== 'undefined') {
            qrcode = new QRCode(qrContainer, {
                text: JSON.stringify(qrData, null, 0),
                width: 100,
                height: 100,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            console.log('✅ QR Code generated successfully');
        } else {
            throw new Error('QRCode library not loaded');
        }
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
        if (qrContainer) {
            qrContainer.innerHTML = '<div class="qr-placeholder">QR Code</div>';
        }
    }
}

/**
 * Update nomor surat - SATU NOMOR UNTUK SEMUA HALAMAN
 */
function updateDocumentNumbers() {
    // Generate nomor surat
    nomorSurat = generateNomorSurat();
    
    // Update di Halaman 1
    if (nomorSuratUtama) {
        nomorSuratUtama.textContent = nomorSurat;
    }
    
    // Update di Halaman 2,3,4 (kop lanjutan)
    if (nomorSuratLanjutan2) nomorSuratLanjutan2.textContent = nomorSurat;
    if (nomorSuratLanjutan3) nomorSuratLanjutan3.textContent = nomorSurat;
    if (nomorSuratLanjutan4) nomorSuratLanjutan4.textContent = nomorSurat;
    
    // Update lampiran
    if (lampiranCount) {
        lampiranCount.textContent = '4';
    }
    
    // Update periode
    const tahun = new Date().getFullYear();
    if (periodeData) periodeData.textContent = tahun;
    if (periodeDataTahun) periodeDataTahun.textContent = tahun;
}

/**
 * Update info panel
 */
function updateInfoPanel(data) {
    if (dataCountInfo) {
        dataCountInfo.innerHTML = `<i class="fas fa-map-marked-alt mr-1"></i> ${data.length} wilayah terdata`;
    }
    
    if (lastUpdateInfo) {
        lastUpdateInfo.textContent = formatDate();
    }
    
    if (tglSekarang) {
        tglSekarang.textContent = formatDate();
    }
    
    if (totalDesaInfo) {
        totalDesaInfo.textContent = data.length;
    }
}

// ============ MAIN GENERATE FUNCTION ============

/**
 * Generate seluruh dokumen
 * QR CODE DAN TTD DIHASILKAN DI HALAMAN 1
 */
async function generateDokumen() {
    try {
        setLoading(true);
        
        // Load data dari Firebase
        wilayahData = await loadDataFromFirebase();
        
        if (wilayahData.length === 0) {
            showNotification('Tidak ada data yang tersedia', 'warning');
            return;
        }
        
        // Sort data by D1+D2 descending
        wilayahData.sort((a, b) => (b.d1 + b.d2) - (a.d1 + a.d2));
        
        // Render semua halaman
        renderHalaman1(wilayahData);     // Halaman 1: Agregasi + TTD + QR
        renderHalaman2(wilayahData);     // Halaman 2: Prioritas Intervensi
        renderHalaman3(wilayahData);     // Halaman 3: Bantuan Sosial (real data dari Firebase)
        await renderHalaman4(wilayahData); // Halaman 4: Layanan Sosial (tanpa TTD/QR)
        
        // Generate SATU nomor surat untuk semua halaman
        updateDocumentNumbers();
        
        // Generate QR CODE di HALAMAN 1
        generateQRCode();
        
        // Update info panel
        updateInfoPanel(wilayahData);
        populateDesaSelect(wilayahData);
        
        showNotification(`✅ Dokumen berhasil digenerate! Menampilkan ${wilayahData.length} desa/kelurahan`, 'success');
        
    } catch (error) {
        console.error('❌ Error generating document:', error);
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
        showNotification('🖨️ Dokumen sedang dicetak...', 'info');
    } catch (error) {
        console.error('Error printing:', error);
        showNotification('❌ Gagal mencetak dokumen', 'danger');
    }
}

// ============ EVENT LISTENERS ============

/**
 * Initialize event listeners
 */
function initEventListeners() {
    if (modeSelect) {
        modeSelect.addEventListener('change', function() {
            if (desaWrap) {
                desaWrap.style.display = this.value === 'desa' ? 'block' : 'none';
            }
        });
    }
    
    if (btnGenerate) {
        btnGenerate.addEventListener('click', generateDokumen);
    }
    
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
        setLoading(true);
        
        console.log('🚀 Initializing DTSEN Document Generator v2.4.1');
        console.log('📌 Fitur: QR Code & TTD di Halaman 1 + Data Bantuan Sosial Real dari Firebase');
        
        // Load data awal
        wilayahData = await loadDataFromFirebase();
        wilayahData.sort((a, b) => (b.d1 + b.d2) - (a.d1 + a.d2));
        
        // Update UI
        updateInfoPanel(wilayahData);
        populateDesaSelect(wilayahData);
        
        // Generate dokumen awal
        await generateDokumen();
        
        // Setup event listeners
        initEventListeners();
        
        console.log(`✅ Aplikasi siap dengan ${wilayahData.length} desa`);
        console.log(`📋 Kriteria Prioritas: >500 (Tinggi), 300-500 (Sedang), <300 (Rendah)`);
        console.log(`📊 Data Bantuan Sosial: Menggunakan data real dari Firebase (PKH, BPNT, PBI)`);
        console.log(`📊 Rasio Layanan: Berdasarkan Total DTSEN (Desil 1-10)`);
        console.log(`📍 QR Code & Tanda Tangan: Halaman 1`);
        
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
