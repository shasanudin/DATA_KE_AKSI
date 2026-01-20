const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// SIMPAN PRIVATE KEY DI SINI (Atau di Environment Variable)
const PRIVATE_KEY = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBC+4Y5HBFG0+EapHl5ykpB6D/8QKFijSLTdzDPWmnpDoAoGCCqGSM49
AwEHoUQDQgAEzzmj3tgm7GPSL4uNBnIBJAickAkkKJPSoGQk0G8vqCjwMz6N3GZW
Jn3rBbbLJps4tUtKzq7+8cfLZfdzxoxASA==
-----END EC PRIVATE KEY-----`;

app.post('/api/sign-report', (req, res) => {
    try {
        const { id, msg } = req.body;

        // Proses Signing ECDSA SHA256
        const sign = crypto.createSign('SHA256');
        sign.update(msg);
        sign.end();
        
        const signature = sign.sign(PRIVATE_KEY, 'hex');

        res.json({
            id: id,
            msg: msg,
            sig: signature
        });
    } catch (err) {
        res.status(500).json({ error: "Gagal menandatangani dokumen" });
    }
});

app.listen(3000, () => console.log('Security Server running on port 3000'));
