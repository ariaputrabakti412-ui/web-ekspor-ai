export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const promptStrukturKoran = `
    Bertindaklah sebagai Pemimpin Redaksi koran internasional modern. Buat data berita ekspor/perdagangan global secara acak dan dinamis.
    Wajib kembalikan respon dalam bentuk JSON murni tanpa markdown \`\`\`json.
    Struktur JSON:
    {
        "hero": { "kategori": "BUSINESS", "judul": "Berita Utama Ekspor", "penulis": "Aria Putra", "tanggal": "Mei 25, 2026", "isi": "Detail paragraf.", "keyword_gambar": "cargo" },
        "latest": [
            { "judul": "Berita Singkat 1", "tanggal": "Mei 25, 2026", "penulis": "AI" },
            { "judul": "Berita Singkat 2", "tanggal": "Mei 25, 2026", "penulis": "AI" },
            { "judul": "Berita Singkat 3", "tanggal": "Mei 25, 2026", "penulis": "AI" }
        ],
        "kategori_business": [{ "judul": "Bisnis", "isi": "Detail.", "tanggal": "Mei 25, 2026" }],
        "kategori_travel": [{ "judul": "Logistik", "isi": "Detail.", "tanggal": "Mei 25, 2026" }],
        "kategori_politics": [{ "judul": "Regulasi", "isi": "Detail.", "tanggal": "Mei 25, 2026" }]
    }`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: promptStrukturKoran }],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Groq Error");

        const hasilTeks = JSON.parse(data.choices[0].message.content.trim());
        return res.status(200).json(hasilTeks);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}