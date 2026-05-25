export default async function handler(req, res) {
    // Matikan cache agar data selalu ditarik baru dari server
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

    // Membuat angka unik berbasis milidetik agar input ke AI selalu dianggap baru oleh server Google
    const uniqueId = Date.now();

    const requestData = {
        contents: [{
            parts: [{
                // PROMPT BARU: Membebaskan AI memilih topik, tapi dipaksa acak dan berbeda tiap request
                text: `Pilihlah secara acak 4 komoditas atau sektor ekspor Indonesia yang berbeda (misalnya selain kopi/sawit, bisa sektor otomotif, energi, manufaktur, tekstil, digital, perikanan, dll). 
                Berikan rangkuman pendek mengenai perkembangan terbaru dari 4 sektor pilihan acakmu tersebut.
                Tulis dalam bentuk poin-poin balet menggunakan bahasa Indonesia yang santun. 
                Pastikan pilihan sektormu bervariasi dan tidak monoton. ID unik pencarian: ${uniqueId}`
            }]
        }],
        // Set kreativitas maksimal (1.0) agar AI selalu mencari kombinasi topik baru
        generationConfig: {
            temperature: 1.0
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