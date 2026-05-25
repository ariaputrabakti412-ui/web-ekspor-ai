export default async function handler(req, res) {
    // Pengaturan Header CORS agar browser tidak memblokir penerimaan data
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // API Key milikmu
    const GEMINI_API_KEY = "AIzaSyA6fwNUiHNxkWbjuQplL8pl76nMEkEJJIM";
    
    // PERBAIKAN: Menggunakan rute v1 dipadukan dengan model gemini-1.5-flash-latest secara presisi
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const requestData = {
        contents: [{
            parts: [{
                text: "Berikan rangkuman pendek mengenai 4 berita singkat tentang komoditas ekspor Indonesia hari ini seperti kopi, sawit, rempah, atau UMKM. Tuliskan dalam bentuk poin-poin balet yang rapi menggunakan bahasa Indonesia."
            }]
        }]
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

        // Ambil data teks murninya
        const teksHasilAI = data.candidates[0].content.parts[0].text;
        
        // Kirimkan balik hasilnya ke browser index.html
        return res.status(200).json({ berita: teksHasilAI });

    } catch (error) {
        return res.status(500).json({ error: "Kendala server internal: " + error.message });
    }
}