export default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            error: "Kunci Terputus", 
            detail: "Vercel belum bisa membaca GEMINI_API_KEY kamu. Pastikan nama variabel di settings sudah persis sama." 
        });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const promptText = "Berikan 4 berita seputar komoditas ekspor Indonesia terbaru hari ini (seperti kopi, sawit, rempah, atau UMKM). Format output WAJIB dalam bentuk JSON array objek mentah, contoh: [{\"kategori\":\"...\",\"judul\":\"...\",\"isi\":\"...\"}]. Jangan berikan kata pembuka, jangan berikan kata penutup, dan JANGAN gunakan bungkus markdown ```json.";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ 
                error: "Ditolak Google Gemini", 
                detail: data.error.message 
            });
        }
        
        let teksAi = data.candidates[0].content.parts[0].text.trim();
        if (teksAi.startsWith("```")) {
            teksAi = teksAi.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
        }

        const jsonBerita = JSON.parse(teksAi);
        return res.status(200).json(jsonBerita);

    } catch (error) {
        return res.status(500).json({ 
            error: "Eror Pemrosesan Backend", 
            detail: error.message 
        });
    }
}