import streamlit as st
import requests
import google.generativeai as genai

# ==========================================
# 1. KONFIGURASI HALAMAN (Wajib Paling Atas)
# ==========================================
st.set_page_config(page_title="Export Academy ID", layout="wide")

# ==========================================
# 2. KONFIGURASI API (Tempel Kuncimu di Sini)
# ==========================================
GEMINI_KEY = "AIzaSyC_QqbTE1svaqxSPiGZWrPztRIsnn0bn38"
NEWS_KEY = "68bc4da4a9574e8bb87be815fef10177"

genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-pro')

# ==========================================
# 3. CSS CUSTOM (Membuat Tombol Kotak Tumpul)
# ==========================================
st.markdown("""
    <style>
    /* Mengubah radio button menjadi kotak menu yang keren */
    div.row-widget.stRadio > div {
        flex-direction: column;
        gap: 10px;
    }
    div.row-widget.stRadio div[role="radiogroup"] > label {
        background-color: #262730; 
        border-radius: 12px;      /* Sudut Tumpul */
        padding: 18px 25px;       
        border: 1px solid #4a4a4a;
        width: 100%;
        transition: all 0.3s ease;
    }
    /* Warna saat mouse lewat (Hover) */
    div.row-widget.stRadio div[role="radiogroup"] > label:hover {
        border-color: #ff4b4b;
        background-color: #31333f;
        transform: translateY(-2px); /* Efek sedikit naik */
    }
    /* Tampilan saat menu dipilih */
    div.row-widget.stRadio div[role="radiogroup"] [data-checked="true"] {
        background-color: #ff4b4b !important;
        border-color: #ff4b4b !important;
    }
    /* Sembunyikan lingkaran radio asli */
    div.row-widget.stRadio [data-testid="stWidgetCaption"], 
    div.row-widget.stRadio div[role="radiogroup"] > label > div:first-child {
        display: none;
    }
    /* Gaya Teks di dalam tombol */
    div.row-widget.stRadio [data-testid="stMarkdownContainer"] p {
        font-size: 16px;
        font-weight: 600;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# 4. SIDEBAR NAVIGASI
# ==========================================
with st.sidebar:
    st.title("🚢 Export Academy")
    st.write("### Menu Belajar:")
    menu = st.radio(
        "Navigation", 
        ["Berita AI", "Modul Edukasi", "Video Belajar"],
        label_visibility="collapsed"
    )
    st.divider()
    st.info("Bantu UMKM Indonesia Go Global!")

# ==========================================
# 5. LOGIKA HALAMAN
# ==========================================

# --- HALAMAN: BERITA AI ---
if menu == "Berita AI":
    st.title("🇮🇩 Indonesia Export Intelligence")
    st.write("Analisis tren ekspor terbaru menggunakan AI Gemini.")
    
    if st.button('🚀 Cari Berita & Analisis'):
        with st.spinner('Lagi mikir...'):
            url = f"https://newsapi.org/v2/everything?q=ekspor+indonesia&apiKey={NEWS_KEY}"
            try:
                res = requests.get(url).json()
                articles = res.get('articles', [])[:2]
                for art in articles:
                    st.subheader(art['title'])
                    response = model.generate_content(f"Rangkum singkat: {art['description']}")
                    st.success(f"🤖 AI: {response.text}")
                    st.divider()
            except:
                st.error("Koneksi gagal.")

# --- HALAMAN: MODUL EDUKASI ---
elif menu == "Modul Edukasi":
    st.title("📚 Modul Belajar Ekspor")
    col1, col2 = st.columns(2)
    with col1:
        with st.expander("📝 Persiapan NIB"):
            st.write("Panduan membuat Nomor Induk Berusaha secara online.")
    with col2:
        with st.expander("🌍 Mencari Buyer"):
            st.write("Tips menggunakan LinkedIn untuk ekspor.")

# --- HALAMAN: VIDEO BELAJAR ---
elif menu == "Video Belajar":
    st.title("🎥 Video Tutorial")
    st.video("https://www.youtube.com/watch?v=dQw4w9WgXcQ")