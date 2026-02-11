// unduh.js
// Sistem Cetak Dokumen DTSEN - TKSK & Puskesos Kecamatan Sumber
// Version: 2.0.0

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

// DOM Elements
const modeSelect = document.getElementById('mode');
const desaWrap = document.getElementById('desaWrap');
const desaSelect = document.getElementById('desaSelect');
const btnGenerate = document.getElementById('btnGenerate');
const kontenHal1 = document.getElementById('kontenHal1');
const kontenHal2 = document.getElementById('kontenHal2');
const kontenHal3 = document.getElementById('kontenHal3');
const kontenHal4 = document.getElementById('kontenHal4');
const dataCountInfo = document.getElementById('dataCountInfo');
const lastUpdateInfo = document.getElementById('lastUpdateInfo');
const tglSekarang = document.getElementById('tglSekarang');

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
 * Generate nomor surat unik
 */
function generateNomorSurat(prefix = '001') {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 900 + 100);
    
    return `${random}/DTSEN.${prefix}/${month}/TKSK-SBR/${year}`;
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
    btnGenerate.disabled = loading;
    btnGenerate.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...' 
        : '<i class="fas fa-sync-alt mr-2"></i> Generate Dokumen';
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
            
            // Pastikan desilArray adalah array
            if (!Array.isArray(desilArray)) {
                if (desilArray && typeof desilArray === 'object') {
                    desilArray = Object.values(desilArray);
                } else {
                    desilArray = Array(10).fill(0);
                }
            }
            
            // Pastikan array memiliki 10 elemen
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
        
        // Filter data valid
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
        'Sumberjaya', 'Sumbermulya', 'Sumberbendo', 'Sumbertengah', 'Sumberkarang'
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

// ============ RENDER FUNCTIONS ============

/**
 * Render halaman 1 - Agregasi Kecamatan
 */
function renderHalaman1(data) {
    const totalKK = data.reduce((sum, item) => sum + item.total_kk, 0);
    const totalD1 = data.reduce((sum, item) => sum + item.d1, 0);
    const totalD2 = data.reduce((sum, item) => sum + item.d2, 0);
    const totalD12 = totalD1 + totalD2;
    const totalD34 = data.reduce((sum, item) => sum + (item.d3 || 0) + (item.d4 || 0), 0);
    const totalD510 = data.reduce((sum, item) => sum + (item.d5_10 || 0), 0);
    
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
                    ${data.map((item, index) => `
                        <tr>
                            <td style="text-align: center;">${index + 1}</td>
                            <td>${item.nama}</td>
                            <td style="text-align: right;">${formatNumber(item.d1)}</td>
                            <td style="text-align: right;">${formatNumber(item.d2)}</td>
                            <td style="text-align: right;">${formatNumber((item.d3 || 0) + (item.d4 || 0))}</td>
                            <td style="text-align: right;">${formatNumber(item.d5_10 || 0)}</td>
                        </tr>
                    `).join('')}
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
 * Render halaman 2 - Prioritas Intervensi
 */
function renderHalaman2(data) {
    const totalD12Kecamatan = data.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const prioritasTinggi = data.filter(item => (item.d1 + item.d2) > 400);
    const prioritasSedang = data.filter(item => {
        const d12 = item.d1 + item.d2;
        return d12 >= 200 && d12 <= 400;
    });
    
    const html = `
        <div>
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">Rank</th>
                        <th width="40%">Desa/Kelurahan</th>
                        <th width="15%">Desil 1</th>
                        <th width="15%">Desil 2</th>
                        <th width="15%">Total D1+D2</th>
                        <th width="10%">Prioritas</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.slice(0, 10).map((item, index) => {
                        const d12 = item.d1 + item.d2;
                        const persentase = ((d12 / totalD12Kecamatan) * 100).toFixed(1);
                        let status = '';
                        if (d12 > 400) status = '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;">TINGGI</span>';
                        else if (d12 >= 200) status = '<span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 3px;">SEDANG</span>';
                        else status = '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px;">RENDAH</span>';
                        
                        return `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.nama}</td>
                                <td style="text-align: right;">${formatNumber(item.d1)}</td>
                                <td style="text-align: right;">${formatNumber(item.d2)}</td>
                                <td style="text-align: right; font-weight: 700;">${formatNumber(d12)}</td>
                                <td style="text-align: center;">${status}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; font-size: 11px;">
                <p><strong>Rekomendasi Intervensi:</strong></p>
                <ul>
                    <li>Prioritas Tinggi (>400 KK) : <strong>${prioritasTinggi.length} desa</strong> - Perlu intervensi segera</li>
                    <li>Prioritas Sedang (200-400 KK) : <strong>${prioritasSedang.length} desa</strong> - Perlu monitoring</li>
                </ul>
            </div>
        </div>
    `;
    
    kontenHal2.innerHTML = html;
}

/**
 * Render halaman 3 - Bantuan Sosial
 */
function renderHalaman3(data) {
    const html = `
        <div>
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="35%">Desa/Kelurahan</th>
                        <th width="15%">PKH</th>
                        <th width="15%">BPNT</th>
                        <th width="15%">BLT</th>
                        <th width="15%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.slice(0, 10).map((item, index) => {
                        const pkh = Math.floor(item.d1 * 0.8 + item.d2 * 0.3);
                        const bpnt = Math.floor(item.d1 * 0.7 + item.d2 * 0.4);
                        const blt = Math.floor(item.d1 * 0.5 + item.d2 * 0.2);
                        const total = pkh + bpnt + blt;
                        
                        return `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.nama}</td>
                                <td style="text-align: right;">${formatNumber(pkh)}</td>
                                <td style="text-align: right;">${formatNumber(bpnt)}</td>
                                <td style="text-align: right;">${formatNumber(blt)}</td>
                                <td style="text-align: right; font-weight: 700;">${formatNumber(total)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <p style="font-size: 11px; margin-top: 15px;">
                <em>* Estimasi penerima berdasarkan data DTSEN Desil 1-2</em><br>
                <em>** Data dapat berubah sesuai verifikasi lapangan</em>
            </p>
        </div>
    `;
    
    kontenHal3.innerHTML = html;
}

/**
 * Render halaman 4 - Layanan Sosial & QR
 */
function renderHalaman4(data) {
    const totalD12 = data.reduce((sum, item) => sum + item.d1 + item.d2, 0);
    const totalLayanan = Math.floor(totalD12 * 0.75);
    const layananKesehatan = Math.floor(totalLayanan * 0.4);
    const layananPendidikan = Math.floor(totalLayanan * 0.3);
    const layananSosial = Math.floor(totalLayanan * 0.3);
    
    const html = `
        <div>
            <table style="width: 100%; margin-bottom: 20px; font-size: 12px;">
                <tr>
                    <td width="50%"><strong>Total Penerima Manfaat</strong></td>
                    <td width="50%">${formatNumber(totalLayanan)} Keluarga</td>
                </tr>
                <tr>
                    <td>Layanan Kesehatan</td>
                    <td>${formatNumber(layananKesehatan)} Keluarga</td>
                </tr>
                <tr>
                    <td>Layanan Pendidikan</td>
                    <td>${formatNumber(layananPendidikan)} Keluarga</td>
                </tr>
                <tr>
                    <td>Layanan Sosial</td>
                    <td>${formatNumber(layananSosial)} Keluarga</td>
                </tr>
            </table>
            
            <table class="tabel-data">
                <thead>
                    <tr>
                        <th>Jenis Layanan</th>
                        <th>Jumlah</th>
                        <th>Persentase</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jaminan Kesehatan</td>
                        <td style="text-align: right;">${formatNumber(layananKesehatan)}</td>
                        <td style="text-align: right;">40%</td>
                    </tr>
                    <tr>
                        <td>Bantuan Pendidikan</td>
                        <td style="text-align: right;">${formatNumber(layananPendidikan)}</td>
                        <td style="text-align: right;">30%</td>
                    </tr>
                    <tr>
                        <td>Bantuan Sosial</td>
                        <td style="text-align: right;">${formatNumber(layananSosial)}</td>
                        <td style="text-align: right;">30%</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 20px; font-size: 11px;">
                <p><strong>Indikator Keberhasilan Program:</strong></p>
                <ol>
                    <li>Cakupan layanan kesehatan mencapai 40% dari total prioritas</li>
                    <li>Akses pendidikan untuk anak usia sekolah dari keluarga prioritas</li>
                    <li>Pemenuhan kebutuhan dasar melalui program bantuan sosial</li>
                </ol>
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
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Generate new QR code
    const qrData = {
        id: verificationId,
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
 * Update nomor surat dan verifikasi ID
 */
function updateDocumentNumbers() {
    const nomor1 = generateNomorSurat('001');
    const nomor2 = generateNomorSurat('002');
    const nomor3 = generateNomorSurat('003');
    const nomor4 = generateNomorSurat('004');
    
    const hashNomor1 = document.getElementById('hashNomor1');
    const hashNomor2 = document.getElementById('hashNomor2');
    const hashNomor3 = document.getElementById('hashNomor3');
    const hashNomor4 = document.getElementById('hashNomor4');
    
    if (hashNomor1) hashNomor1.textContent = nomor1;
    if (hashNomor2) hashNomor2.textContent = nomor2;
    if (hashNomor3) hashNomor3.textContent = nomor3;
    if (hashNomor4) hashNomor4.textContent = nomor4;
    
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
        
        // Render semua halaman
        renderHalaman1(wilayahData);
        renderHalaman2(wilayahData);
        renderHalaman3(wilayahData);
        renderHalaman4(wilayahData);
        
        // Generate nomor surat dan QR
        updateDocumentNumbers();
        generateQRCode();
        
        // Update info panel
        updateInfoPanel(wilayahData);
        populateDesaSelect(wilayahData);
        
        showNotification('Dokumen berhasil digenerate!', 'success');
        
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
    const btnPrint = document.getElementById('btnPrint');
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
        
        // Generate initial dokumen
        await generateDokumen();
        
        // Setup event listeners
        initEventListeners();
        
        console.log('✅ Application initialized successfully');
        
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
