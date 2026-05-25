export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Membaca API Key Groq yang kamu pasang di environment variable Vercel
    const GROQ_API_KEY = process.env.GEMINI_API_KEY; 
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const promptStrukturKoran = `
    Bertindaklah sebagai Pemimpin Redaksi koran internasional modern. Buat data berita ekspor/perdagangan global secara acak, bervariasi, dan dinamis mengenai komoditas (seperti nikel, tekstil, otomotif, aviasi, dll).
    
    Wajib kembalikan respon dalam bentuk JSON murni tanpa gaya markdown (TANPA tanda backtick \`\`\`json).

    Struktur JSON wajib persis seperti ini:
    {
        "hero": {
            "kategori": "BUSINESS",
            "judul": "Judul berita utama ekspor yang bombastis dan menarik",
            "penulis": "Aria Putra",
            "tanggal": "Mei 25, 2026",
            "isi": "Tulis 1 paragraf berita utama yang lengkap, panjang, dan detail di sini.",
            "keyword_gambar": "mining,factory"
        },
        "latest": [
            { "judul": "Judul berita singkat acak 1", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 2", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 3", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" }
        ],
        "kategori_business": [
            { "judul": "Judul berita bisnis komoditas", "isi": "Penjelasan detail mengenai inovasi bisnis ekspor.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_travel": [
            { "judul": "Judul rute logistik atau pengapalan global", "isi": "Penjelasan detail mengenai transportasi perdagangan global.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_politics": [
            { "judul": "Judul kebijakan tarif dagang", "isi": "Penjelasan detail regulasi tarif atau aturan pemerintah baru.", "tanggal": "Mei 25, 2026" }
        ]
    }
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // PERBAIKAN: Menggunakan model Llama terbaru yang aktif dan didukung penuh oleh Groq saat ini
                model: "llama-3.3-70b-versatile", 
                messages: [{ role: "user", content: promptStrukturKoran }],
                response_format: { type: "json_object" }, 
                temperature: 1.0
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Groq API Error");

        const teksJsonHasilAI = data.choices[0].message.content.trim();
        return res.status(200).json({ berita: teksJsonHasilAI });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}