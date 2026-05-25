export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Kita perketat perintah teksnya agar outputnya dijamin berupa JSON murni tanpa mark tag ```json
    const promptStrukturKoran = `
    Bertindaklah sebagai Pemimpin Redaksi koran internasional modern. Tugasmu adalah membuat data berita ekspor/perdagangan global secara acak, bervariasi, dan dinamis agar pembaca tidak bosan. Pilih 5-6 sektor komoditas yang luas secara bebas (seperti tekstil, aviasi, otomotif, nikel, perikanan, atau bursa komoditas) dan buat ceritanya seolah-olah terjadi hari ini.

    WAJIB KEMBALIKAN RESPONS DALAM BENTUK JSON STRUCTURAL SAJA. DILARANG KERAS menyertakan backtick markdown (\`\`\`json atau \`\`\`), dilarang memberikan teks pembuka, dan dilarang memberikan teks penutup.

    Ikuti struktur JSON di bawah ini persis:
    {
        "hero": {
            "kategori": "BUSINESS",
            "judul": "Judul berita utama ekspor yang menarik",
            "penulis": "Nama Editor",
            "tanggal": "Mei 25, 2026",
            "isi": "Tulis 1 paragraf berita utama yang lengkap, panjang, dan detail di sini."
        },
        "latest": [
            { "judul": "Judul berita singkat acak 1", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 2", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 3", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" }
        ],
        "kategori_business": [
            { "judul": "Judul berita industri komoditas acak", "isi": "Penjelasan detail mengenai inovasi bisnis ekspor.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_travel": [
            { "judul": "Judul rute logistik global acak", "isi": "Penjelasan detail mengenai pengapalan dan transportasi perdagangan global.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_politics": [
            { "judul": "Judul kebijakan dagang internasional", "isi": "Penjelasan detail regulasi tarif atau aturan pemerintah baru.", "tanggal": "Mei 25, 2026" }
        ]
    }
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptStrukturKoran }] }],
                // PERBAIKAN: Parameter generationConfig yang memicu eror di v1 URL telah kita buang total!
                generationConfig: { 
                    temperature: 1.0 
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Google Gemini Error");

        let teksJsonHasilAI = data.candidates[0].content.parts[0].text.trim();
        
        // Proteksi tambahan: jika AI bandel menyelipkan tag ```json, kita bersihkan secara manual di backend
        if (teksJsonHasilAI.startsWith("```json")) {
            teksJsonHasilAI = teksJsonHasilAI.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (teksJsonHasilAI.startsWith("```")) {
            teksJsonHasilAI = teksJsonHasilAI.replace(/^```/, "").replace(/```$/, "").trim();
        }

        return res.status(200).json({ berita: teksJsonHasilAI });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}