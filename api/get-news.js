async function generateAllNews() {
    const errorContainer = document.getElementById("error-container"); // Sesuaikan dengan ID elemen eror merahmu
    const errorText = document.getElementById("error-text"); 
    
    try {
        // Panggil endpoint backend Vercel Serverless
        const response = await fetch("/api/get-news");
        
        // Ambil teks mentah terlebih dahulu untuk diperiksa jika terjadi kegagalan parsing
        const rawText = await response.text();
        
        // CETAK DI KONSOL: Ini sangat penting untuk melihat isi respons asli jika eror berlanjut
        console.log("Respons Mentah Server:", rawText);

        // Validasi jika server mengembalikan halaman HTML eror bukannya string JSON
        if (rawText.trim().startsWith("<")) {
            throw new Error("Server backend mengembalikan HTML, bukan data JSON berita.");
        }

        // Jalankan parsing secara aman
        const dataBerita = JSON.parse(rawText);

        if (dataBerita.error) {
            throw new Error(dataBerita.error);
        }

        // Teruskan objek berita yang valid ke fungsi pembuat elemen HTML kamu
        // Contoh: renderBeritaKeUI(dataBerita);
        
        // Sembunyikan kotak eror jika berhasil
        if (errorContainer) errorContainer.style.display = "none";

    } catch (error) {
        console.error("Detail Eror Frontend:", error);
        
        // Tampilkan pesan kegagalan secara rapi di antarmuka web
        if (errorContainer && errorText) {
            errorContainer.style.display = "block";
            errorText.innerText = error.message || "Gagal memuat struktur berita digital.";
        }
    }
}