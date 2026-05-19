export default async function handler(req, res) {
    // Ambil API Key dari pengaturan Vercel secara aman
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "API Key Gemini belum disetting di Vercel!" });
    }

    // URL resmi untuk menembak model Gemini 1.5 Flash (Cepat dan Gratis)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Perintah (Prompt) instruksi khusus dari kita untuk si AI
    const promptText = "Berikan 4 berita komoditas ekspor Indonesia terbaru hari ini (misal kopi, sawit, nikel, rempah, atau umkm). Format harus JSON mentah berupa array objek. Tiap objek wajib punya properti: 'kategori', 'judul', 'isi'. Jangan berikan teks pembuka atau penutup markdown seperti ```json, langsung berikan bentuk array-nya saja.";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        
        // Ambil teks hasil ketikan dari otak Gemini
        const teksAi = data.candidates[0].content.parts[0].text.trim();
        
        // Ubah teks string dari AI menjadi format JSON bersih agar bisa dibaca web
        const jsonBerita = JSON.parse(teksAi);

        // Kirim hasilnya ke halaman depan web
        return res.status(200).json(jsonBerita);
    } catch (error) {
        return res.status(500).json({ error: "Gagal memproses berita dari AI: " + error.message });
    }
}