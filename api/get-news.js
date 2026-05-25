export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Prompt cerdas yang memaksa AI merancang topik acak dan output berformat JSON murni
    const promptStrukturKoran = `
    Bertindaklah sebagai Pemimpin Redaksi koran internasional modern. Tugasmu adalah membuat data berita ekspor/perdagangan global secara acak, bervariasi, dan dinamis agar pembaca tidak bosan. Pilih sektor komoditas yang luas secara bebas (selain kopi/sawit, bisa nikel, tekstil, manufaktur, aviasi, otomotif, bursa komoditas, dll).

    Wajib kembalikan respons dalam format JSON mentah murni sesuai struktur di bawah ini, tanpa teks pengantar, tanpa pembuka, dan tanpa blok tag markdown (\`\`\`json ... \`\`\`).

    Struktur JSON yang harus kamu isi:
    {
        "hero": {
            "kategori": "Tulis kategori kapital (misal: BUSINESS atau MANUFAKTUR)",
            "judul": "Judul berita utama yang sangat menarik dan bombastis",
            "penulis": "Nama wartawan buatanmu",
            "tanggal": "Mei 25, 2026",
            "isi": "Tulis paragraph berita utama yang lengkap dan detail tentang sektor ekspor acak pilihanmu."
        },
        "latest": [
            { "judul": "Judul berita kilat acak 1", "tanggal": "Mei 25, 2026", "penulis": "Nama Editor" },
            { "judul": "Judul berita kilat acak 2", "tanggal": "Mei 25, 2026", "penulis": "Nama Editor" },
            { "judul": "Judul berita kilat acak 3", "tanggal": "Mei 25, 2026", "penulis": "Nama Editor" }
        ],
        "kategori_business": [
            { "judul": "Judul berita bisnis acak", "isi": "Penjelasan singkat 2 kalimat perkembangan bisnis manufaktur/ekspor terbaru.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_travel": [
            { "judul": "Judul berita logistik/travel global acak", "isi": "Penjelasan singkat 2 kalimat rute pengapalan atau perjalanan ekspor global terbaru.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_politics": [
            { "judul": "Judul berita regulasi ekspor acak", "isi": "Penjelasan singkat 2 kalimat kebijakan dagang pemerintah atau dunia internasional terbaru.", "tanggal": "Mei 25, 2026" }
        ]
    }
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptStrukturKoran }] }],
                generationConfig: { 
                    temperature: 1.0, // Kreativitas maksimal agar topiknya terus berubah drastis
                    responseMimeType: "application/json" // Mengunci respon agar dipastikan JSON murni
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Google Gemini Error");

        const teksJsonHasilAI = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ berita: teksJsonHasilAI });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}