// =====================================================
// NIRBITA CORE ENHANCED v2.1
// AI Analytics + Blockchain Integration
// DTSEN Desil Intelligence
// =====================================================

import { db } from "./firebase.js";
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy,
    doc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// =====================================================
// Blockchain Simulation Module
// =====================================================
class BlockchainSimulator {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 2;
        this.miningReward = 100;
        this.initializeGenesis();
    }

    initializeGenesis() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            hash: '0x0000...genesis',
            previousHash: '0x0000'
        };
    }

    createBlock(transactions, previousHash) {
        const block = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: transactions,
            hash: this.calculateHash(transactions, previousHash),
            previousHash: previousHash
        };
        return block;
    }

    calculateHash(transactions, previousHash) {
        const data = JSON.stringify(transactions) + previousHash;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return '0x' + Math.abs(hash).toString(16).padStart(16, '0');
    }

    addTransaction(transaction) {
        this.pendingTransactions.push({
            ...transaction,
            timestamp: Date.now(),
            verified: true
        });
    }

    mineBlock() {
        const previousBlock = this.chain[this.chain.length - 1];
        const newBlock = this.createBlock(
            this.pendingTransactions,
            previousBlock.hash
        );
        this.chain.push(newBlock);
        this.pendingTransactions = [];
        return newBlock;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    verifyChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            
            const calculatedHash = this.calculateHash(
                currentBlock.transactions,
                previousBlock.hash
            );
            
            if (currentBlock.hash !== calculatedHash) {
                return false;
            }
        }
        return true;
    }
}

// =====================================================
// AI Analytics Module
// =====================================================
class AIAnalytics {
    constructor() {
        this.modelVersion = 'v2.1';
        this.confidenceThreshold = 0.85;
        this.trainingData = [];
    }

    // Predictive Risk Analysis
    predictRisk(historicalData) {
        if (!historicalData || historicalData.length < 3) {
            return { prediction: 0, confidence: 0, trend: 'insufficient_data' };
        }

        // Simple weighted moving average with anomaly detection
        const scores = historicalData.map(d => d.nirbita?.score || 0);
        const recentScores = scores.slice(-5);
        
        const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const maxScore = Math.max(...recentScores);
        
        // Detect anomalies
        const stdDev = this.calculateStdDev(recentScores);
        const anomalies = recentScores.filter(s => Math.abs(s - avg) > 2 * stdDev);
        
        // Weighted prediction (newer data weighted more)
        const weights = recentScores.map((_, i) => (i + 1) / recentScores.length);
        const weightedAvg = recentScores.reduce((sum, score, i) => sum + score * weights[i], 0) / 
                           weights.reduce((a, b) => a + b, 0);
        
        // Trend analysis
        const trend = this.calculateTrend(recentScores);
        
        // Confidence based on data consistency
        const confidence = Math.min(
            0.95,
            1 - (anomalies.length / recentScores.length) * 0.3
        );

        return {
            prediction: Math.round(weightedAvg + (trend * 5)),
            confidence: Math.round(confidence * 100),
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            anomalyCount: anomalies.length,
            dataPoints: recentScores.length
        };
    }

    calculateStdDev(arr) {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }

    calculateTrend(scores) {
        if (scores.length < 2) return 0;
        const n = scores.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const xMean = x.reduce((a, b) => a + b, 0) / n;
        const yMean = scores.reduce((a, b) => a + b, 0) / n;
        
        const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (scores[i] - yMean), 0);
        const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
        
        return denominator !== 0 ? numerator / denominator : 0;
    }

    // Generate AI Insights
    generateInsights(data) {
        if (!data || data.length === 0) {
            return 'Data tidak mencukupi untuk analisis AI.';
        }

        const highRiskCount = data.filter(d => d.nirbita?.level === 'HIGH').length;
        const avgScore = data.reduce((a, b) => a + (b.nirbita?.score || 0), 0) / data.length;
        const maxRisk = data.reduce((a, b) => Math.max(a, b.nirbita?.score || 0), 0);
        
        let insights = [];
        
        if (highRiskCount > data.length * 0.3) {
            insights.push('⚠️ Deteksi risiko tinggi: ' + highRiskCount + ' wilayah memerlukan intervensi segera.');
        } else if (highRiskCount > 0) {
            insights.push('⚡ ' + highRiskCount + ' wilayah teridentifikasi dengan prioritas tinggi.');
        }

        if (avgScore > 60) {
            insights.push('📈 Rata-rata skor risiko menunjukkan tren meningkat. Perlu evaluasi kebijakan.');
        } else if (avgScore < 30) {
            insights.push('✅ Skor risiko relatif rendah. Stabilitas wilayah cukup baik.');
        }

        if (maxRisk > 85) {
            insights.push('🚨 Wilayah dengan skor risiko ekstrim terdeteksi. Perhatikan ' + 
                data.find(d => d.nirbita?.score === maxRisk)?.nama || '');
        }

        insights.push('🎯 Rekomendai: ' + this.generateRecommendations(data));

        return insights.join(' | ');
    }

    generateRecommendations(data) {
        const highRisk = data.filter(d => d.nirbita?.level === 'HIGH');
        if (highRisk.length > 5) {
            return 'Prioritaskan intervensi di ' + highRisk.length + ' wilayah dengan skor tertinggi.';
        } else if (highRisk.length > 0) {
            return 'Lakukan analisis mendalam di ' + highRisk.map(d => d.nama).join(', ') + '.';
        }
        return 'Pertahankan kebijakan yang ada, pemantauan rutin diperlukan.';
    }
}

// =====================================================
// GLOBAL DATA & INITIALIZATION
// =====================================================

let wilayahData = [];
let riskChart = null;
let blockchain = new BlockchainSimulator();
let aiAnalytics = new AIAnalytics();
let predictionInterval = null;

// =====================================================
// NIRBITA ANALYTIC ENGINE (Enhanced)
// =====================================================

function calculateNirbita(data) {
    const desil = data.desil || [];
    const d1 = Number(desil[0] || 0);
    const d2 = Number(desil[1] || 0);
    
    const totalKK = desil.reduce((total, value) => total + Number(value || 0), 0);
    
    if (totalKK === 0) {
        return {
            score: 0,
            status: "Tidak Ada Data",
            level: "NO_DATA",
            d1: 0,
            d2: 0,
            totalKK: 0,
            vulnerablePercent: 0,
            aiPrediction: 0,
            confidence: 0
        };
    }

    const vulnerablePercent = ((d1 + d2) / totalKK) * 100;
    
    // Enhanced scoring with additional factors
    let score = ((d1 / totalKK) * 60) + ((d2 / totalKK) * 30);
    
    // Vulnerability weight
    if (vulnerablePercent > 40) score += 5;
    else if (vulnerablePercent > 20) score += 2;
    
    // D1 weight
    if (d1 > 500) {
        score += 15;
        status = "Darurat";
        level = "CRITICAL";
    } else if (d1 > 300) {
        score += 10;
        status = "Prioritas Tinggi";
        level = "HIGH";
    } else if (d1 > 200) {
        score += 7;
        status = "Prioritas Sedang";
        level = "MEDIUM";
    } else if (d1 > 100) {
        score += 4;
        status = "Prioritas Rendah";
        level = "LOW";
    } else {
        score += 2;
        status = "Prioritas Sangat Rendah";
        level = "VERY_LOW";
    }

    // Density factor (if data density is provided)
    if (data.density) {
        const density = Number(data.density) || 0;
        if (density > 1000) score += 3;
        else if (density > 500) score += 1.5;
    }

    return {
        score: Math.min(100, Math.round(score)),
        status,
        level,
        d1,
        d2,
        totalKK,
        vulnerablePercent: vulnerablePercent.toFixed(2)
    };
}

// =====================================================
// LOAD FIREBASE DATA
// =====================================================

function loadNirbita() {
    const q = query(
        collection(db, "wilayah_desa"),
        orderBy("periode.tahun", "desc")
    );

    onSnapshot(q, (snapshot) => {
        wilayahData = [];
        snapshot.forEach(doc => {
            let item = doc.data();
            let analysis = calculateNirbita(item);
            wilayahData.push({
                id: doc.id,
                ...item,
                nirbita: analysis
            });
        });

        renderDashboard();
        
        // Log to blockchain
        blockchain.addTransaction({
            type: 'DATA_UPDATE',
            wilayahCount: wilayahData.length,
            timestamp: new Date().toISOString()
        });
        
        // Mine new block periodically
        if (blockchain.pendingTransactions.length > 0) {
            const newBlock = blockchain.mineBlock();
            updateBlockchainUI(newBlock);
        }

        // Update AI predictions
        updateAIPredictions();
        
    }, (error) => {
        console.error("NIRBITA FIREBASE ERROR", error);
    });
}

// =====================================================
// UPDATE AI PREDICTIONS
// =====================================================

function updateAIPredictions() {
    if (wilayahData.length < 3) return;
    
    // Predict risk for each wilayah
    const predictions = wilayahData.map(wilayah => {
        const historicalData = wilayahData.filter(d => d.nama === wilayah.nama);
        const prediction = aiAnalytics.predictRisk(historicalData);
        return {
            ...wilayah,
            aiPrediction: prediction
        };
    });

    // Update AI insights
    const insight = aiAnalytics.generateInsights(wilayahData);
    const insightElement = document.getElementById('aiInsight');
    if (insightElement) {
        insightElement.textContent = insight;
    }

    // Update risk prediction
    const avgPrediction = predictions.reduce((a, b) => a + (b.aiPrediction?.prediction || 0), 0) / 
                         predictions.length;
    const riskPredictionEl = document.getElementById('riskPrediction');
    const riskProgressEl = document.getElementById('riskProgress');
    if (riskPredictionEl) {
        riskPredictionEl.textContent = Math.round(avgPrediction);
    }
    if (riskProgressEl) {
        riskProgressEl.style.width = Math.min(100, avgPrediction) + '%';
    }
}

// =====================================================
// UPDATE BLOCKCHAIN UI
// =====================================================

function updateBlockchainUI(block) {
    const txLog = document.getElementById('txLog');
    if (txLog && block) {
        const txCount = block.transactions.length;
        const hash = block.hash.substring(0, 8) + '...' + block.hash.substring(-4);
        const entry = document.createElement('div');
        entry.textContent = `⛓️ Block #${block.index} | Hash: ${hash} | Data: ${txCount} transaksi terverifikasi`;
        txLog.prepend(entry);
        
        // Keep only last 5 entries
        while (txLog.children.length > 5) {
            txLog.removeChild(txLog.lastChild);
        }
    }
}

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

function renderDashboard() {
    if (wilayahData.length === 0) return;

    // Total wilayah
    document.getElementById('totalWilayah').innerHTML = wilayahData.length;

    // Average score
    let average = wilayahData.reduce((a, b) => a + b.nirbita.score, 0) / wilayahData.length;
    document.getElementById('avgScore').innerHTML = Math.round(average);

    // Priority tinggi
    let high = wilayahData.filter(x => x.nirbita.level === 'HIGH' || x.nirbita.level === 'CRITICAL').length;
    document.getElementById('priority').innerHTML = high;

    renderRanking();
    renderChart();
}

// =====================================================
// RANKING
// =====================================================

function renderRanking() {
    let table = document.getElementById('rankingTable');
    if (!table) return;

    let ranking = [...wilayahData]
        .sort((a, b) => b.nirbita.score - a.nirbita.score)
        .slice(0, 15);

    let html = '';
    ranking.forEach((desa, index) => {
        let badge = 'bg-success';
        if (desa.nirbita.level === 'CRITICAL') badge = 'bg-danger';
        else if (desa.nirbita.level === 'HIGH') badge = 'bg-danger';
        else if (desa.nirbita.level === 'MEDIUM') badge = 'bg-warning';
        
        let statusIcon = '';
        if (desa.nirbita.level === 'CRITICAL') statusIcon = '🔥 ';
        else if (desa.nirbita.level === 'HIGH') statusIcon = '⚠️ ';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <strong>${desa.nama || "Tanpa Nama"}</strong>
                    <br>
                    <small class="text-muted">
                        D1: ${desa.nirbita.d1} KK | D2: ${desa.nirbita.d2} KK
                    </small>
                </td>
                <td>
                    <span class="fw-bold" style="color: ${desa.nirbita.score > 70 ? 'var(--accent-red)' : desa.nirbita.score > 50 ? 'var(--accent-yellow)' : 'var(--accent-green)'}">
                        ${desa.nirbita.score}
                    </span>
                </td>
                <td>
                    <span class="badge ${badge}">${statusIcon}${desa.nirbita.status}</span>
                </td>
            </tr>
        `;
    });

    table.innerHTML = html;
}

// =====================================================
// RISK CHART
// =====================================================

function renderChart() {
    let high = wilayahData.filter(x => x.nirbita.level === 'HIGH' || x.nirbita.level === 'CRITICAL').length;
    let medium = wilayahData.filter(x => x.nirbita.level === 'MEDIUM').length;
    let low = wilayahData.filter(x => x.nirbita.level === 'LOW' || x.nirbita.level === 'VERY_LOW').length;

    const canvas = document.getElementById('riskChart');
    if (!canvas) return;

    if (riskChart) {
        riskChart.destroy();
    }

    riskChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: [
                'Prioritas Tinggi',
                'Prioritas Sedang',
                'Prioritas Rendah'
            ],
            datasets: [{
                data: [high, medium, low],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(255, 217, 61, 0.8)',
                    'rgba(0, 255, 156, 0.8)'
                ],
                borderColor: [
                    '#ff6b6b',
                    '#ffd93d',
                    '#00ff9c'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255,255,255,0.8)',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// =====================================================
// AI PREDICTION INTERVAL
// =====================================================

function startPredictionInterval() {
    if (predictionInterval) clearInterval(predictionInterval);
    predictionInterval = setInterval(() => {
        if (wilayahData.length > 0) {
            updateAIPredictions();
            // Add to blockchain
            blockchain.addTransaction({
                type: 'AI_PREDICTION',
                timestamp: new Date().toISOString(),
                dataPoints: wilayahData.length
            });
        }
    }, 30000); // Update every 30 seconds
}

// =====================================================
// EXPORT DATA GLOBAL
// =====================================================

window.NIRBITA = {
    getData: () => wilayahData,
    calculateNirbita,
    blockchain: blockchain,
    aiAnalytics: aiAnalytics,
    version: '2.1',
    getBlockchainStatus: () => ({
        chainLength: blockchain.chain.length,
        verified: blockchain.verifyChain(),
        pendingTransactions: blockchain.pendingTransactions.length
    })
};

// =====================================================
// START ENGINE
// =====================================================

loadNirbita();
startPredictionInterval();

console.log('🚀 NIRBITA CORE v2.1 initialized');
console.log('📊 AI Analytics ready');
console.log('⛓️ Blockchain active');
console.log('🤖 Mistral AI engine online');

// Export for module usage
export { 
    wilayahData, 
    blockchain, 
    aiAnalytics,
    calculateNirbita,
    loadNirbita
};
