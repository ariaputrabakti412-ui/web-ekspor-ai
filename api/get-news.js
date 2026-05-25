export default async function handler(req, res) {
    // 1. PAKSA BROWSER UNTUK TIDAK MENYIMPAN CACHE (Wajib agar data selalu baru)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 2. TRIK SEED RANDOM: Membuat AI memberikan sudut pandang berbeda setiap detik
    const waktuSekarang = new Date().toISOString();
    
    const requestData = {
        contents: [{
            parts: [{
                text: `Tuliskan rangkuman 4 poin berita singkat yang berbeda mengenai perkembangan komoditas ekspor Indonesia. 
                Fokuskan pada aspek yang berbeda secara acak (bisa tentang inovasi teknologi, negara tujuan baru, tantangan cuaca, atau kisah sukses UMKM daerah). 
                Gunakan bahasa Indonesia. Angka unik pembeda: ${waktuSekarang}`
            }]
        }],
        // 3. MENAIKKAN TEMPERATURE (Membuat AI lebih kreatif dan tidak monoton)
        generationConfig: {
            temperature: 0.9 
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || "Google Gemini menolak permintaan backend." 
            });
        }

        const teksHasilAI = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ berita: teksHasilAI });

    } catch (error) {
        return res.status(500).json({ error: "Kendala server internal: " + error.message });
    }
}