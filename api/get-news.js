export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const GROQ_API_KEY = process.env.GROQ_API_KEY; 
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const promptStrukturKoran = `
    Bertindaklah sebagai Pemimpin Redaksi koran internasional modern. Buat data berita ekspor/perdagangan global secara acak, bervariasi, dan dinamis mengenai komoditas yang berbeda setiap kali diminta.
    
    Wajib kembalikan respon dalam bentuk JSON murni. Jangan bungkus dengan tanda petik tiga atau kata \`\`\`json. Jangan berikan teks pembuka atau penutup apa pun.

    Struktur objek JSON harus persis seperti ini:
    {
        "hero": {
            "kategori": "BUSINESS",
            "judul": "Judul berita utama ekspor komoditas segar",
            "penulis": "Aria Putra",
            "tanggal": "Mei 25, 2026",
            "isi": "Tulis 1 paragraf berita utama yang lengkap dan detail di sini.",
            "keyword_gambar": "cargo,ship"
        },
        "latest": [
            { "judul": "Judul berita singkat acak 1", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 2", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" },
            { "judul": "Judul berita singkat acak 3", "tanggal": "Mei 25, 2026", "penulis": "Wartawan AI" }
        ],
        "kategori_business": [
            { "judul": "Judul bisnis ekspor", "isi": "Detail inovasi perdagangan global.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_travel": [
            { "judul": "Judul logistik internasional", "isi": "Detail rute pengiriman komoditas.", "tanggal": "Mei 25, 2026" }
        ],
        "kategori_politics": [
            { "judul": "Judul regulasi perdagangan ekspor", "isi": "Detail aturan atau kebijakan tarif baru.", "tanggal": "Mei 25, 2026" }
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
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "You must only return a valid JSON object. No prose, no markdown wrappers." },
                    { role: "user", content: promptStrukturKoran }
                ],
                response_format: { type: "json_object" }, 
                temperature: 0.7 // Menurunkan temperatur agar output format JSON jauh lebih stabil
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Groq API Error");

        let teksJsonHasilAI = data.choices[0].message.content.trim();

        // PENGAMAN: Jika LLM mengembalikan string mentah yang dibungkus ```json ... ```
        if (teksJsonHasilAI.startsWith("```")) {
            teksJsonHasilAI = teksJsonHasilAI.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        // Parse ke objek asli terlebih dahulu untuk memastikan validitasnya sebelum dikirim ke frontend
        const objekBeritaValid = JSON.parse(teksJsonHasilAI);
        
        return res.status(200).json(objekBeritaValid);

    } catch (error) {
        console.error("Backend Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}