# twp-for-userscript
Translate web pages using Google, Yandex, Bing, or local AI (Ollama/LM Studio) 

 @author  baguzzz     Inspired by FilipePS

# atur konvigurasi secara manual 


    
//atur bahasa sumber halaman (untuk auto cuma berkerja untuk google)  

    let sourceLang = 'auto';
 

# 🌐 TWP - Translate Web Pages (Local AI)

**Terjemahkan halaman web secara instan** menggunakan Google Translate, Yandex, Bing, atau **AI lokal** (Ollama / LM Studio) — semua dalam satu ekstensi pengguna (UserScript).

Cocok untuk penerjemahan yang **cepat, privat, dan dapat disesuaikan**, tanpa bergantung sepenuhnya pada API eksternal.

![TWP Demo]( ) <!-- Ganti dengan screenshot/GIF jika ada -->

---

## ✨ Fitur Utama

- 🔄 **Multi-Mesin Penerjemah**  
  Pilih antara Google Translate, Yandex, Bing (MyMemory), atau **AI Lokal** Anda sendiri.

- 🤖 **AI Lokal (Ollama / LM Studio)**  
  Gunakan model seperti Llama 3.2, Mistral, Gemma, dll.  
  ✅ **100% privat** – tidak ada data yang dikirim ke server eksternal.  
  ✅ Bisa dijalankan offline.  
  ✅ Bebas menentukan *prompt* sendiri.

- 🎯 **Terjemahan Dinamis**  
  Secara otomatis menerjemahkan konten baru yang dimuat secara dinamis (AJAX, infinite scroll, SPA).

- 🧠 **Cerdas & Ringan**  
  - Prioritas terjemahan pada area yang terlihat (*viewport*)  
  - Antrean MutationObserver yang didebounce  
  - Tidak membekukan halaman meskipun banyak teks

- 🔘 **Tombol Mengambang**  
  Panel kontrol mudah diakses di pojok kanan atas.

- 📝 **Pulihkan Teks Asli**  
  Klik “Disable” untuk mengembalikan halaman ke bahasa semula.

- 🧩 **Tidak Merusak Tata Letak**  
  Hanya mengganti teks, tidak mengganggu struktur HTML atau skrip.

---

## 📦 Instalasi

### 1. Pasang Pengelola UserScript
Anda perlu salah satu ekstensi berikut:
- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)
- [Greasemonkey](https://www.greasespot.net/) (Firefox)

### 2. Tambahkan Script Ini
- Klik ikon ekstensi → **Buat Skrip Baru**  
- Salin seluruh kode dari file `twp-translate.user.js`  
- Simpan (`Ctrl+S`)

Atau jika Anda menyediakan *raw URL*: [Https://raw.githubusercontent.com/baguzzz/twp-for-userscript/blob/main/TWP-TranslateWebPages(LocalAI)-3.0.0.user.js](https://github.com/baguzzz/twp-for-userscript/raw/refs/heads/main/TWP%20-%20Translate%20Web%20Pages%20(Local%20AI)-3.0.0.user.js)
Klik **Install** pada halaman yang muncul.

### 3. Aktifkan
Setelah terinstal, buka halaman web apa pun. Tombol **🌐 TWP** akan muncul di pojok kanan.

---

## ⚙️ Cara Penggunaan

### Panel Kontrol
Klik tombol **🌐 TWP** → muncul panel pengaturan.

| Pengaturan | Fungsi |
|------------|--------|
| **Engine** | Pilih mesin terjemahan: Google, Yandex, Bing, Local AI |
| **Target Language** | Bahasa tujuan (Indonesia, Inggris, Jepang, dll.) |
| **Local AI Settings** | URL endpoint, nama model, dan prompt (jika pakai AI lokal) |
| **Disable / Enable** | Menyalakan/mematikan terjemahan |
| **Translate Now** | Memulai terjemahan ulang dari awal |

### Menggunakan AI Lokal (Ollama / LM Studio)

#### 🐳 Contoh dengan Ollama
1. Install Ollama: [https://ollama.com](https://ollama.com)
2. Jalankan model (misal `llama3.2`):
   ```bash
   ollama run llama3.2

Pastikan service berjalan di http://localhost:11434


3. Di panel TWP:

.Engine = Local AI

.Endpoint URL = http://localhost:11434/api/generate

.Model name = llama3.2

.Prompt (contoh):```Translate the following text to {{targetLang}}. Return ONLY the translation, no extra text:
{{text}}```

## 💻 Contoh dengan LM Studio

1.Buka LM Studio → Load model → Start server lokal (biasanya di port 1234)

2.Endpoint URL di TWP: http://localhost:1234/v1/completions (jika menggunakan API OpenAI-like)

3.Model name = nama model yang dimuat

⚠️ Catatan: Pastikan model Anda cukup ringan (3B–7B) agar respons cepat. Gunakan temperature=0.1 untuk hasil terjemahan yang konsisten.

Tips Prompt yang Baik

.Gunakan {{text}} dan {{targetLang}} sebagai variabel.

.Perintahkan model untuk hanya mengembalikan terjemahan tanpa komentar tambahan.

.Contoh prompt yang sudah terbukti:```Translate the following text to {{targetLang}}. Do not explain, do not add quotes. Only the translation:
"{{text}}"```

## 🛠️ Konfigurasi Lanjutan (Opsional)

Anda dapat mengubah nilai default dengan membuka Kode Sumber skrip (via Tampermonkey → Edit) dan mengubah variabel di bagian KONFIGURASI:

```js
let targetLang = "id"; // bahasa default

let engine = "google"; // 'google', 'yandex', 'bing', 'localai'


let localAIEndpoint = "http://localhost:11434/api/generate";

let localAIModel = 'llama3.2';

Atau dengan membuka GM_setValue secara manual melalui console browser: GM_setValue('targetLang', 'en');

GM_setValue('engine', 'localai');
```




## ❓ Tanya Jawab (FAQ)
1. Apakah data saya dikirim ke server luar saat menggunakan AI Lokal?
Tidak. Seluruh proses terjemahan terjadi di komputer Anda sendiri. Hanya saat memilih Google/Yandex/Bing data akan dikirim ke layanan tersebut.

2. Mengapa terjemahan AI lokal lambat?
Tergantung ukuran model dan spesifikasi GPU/CPU. Untuk hasil lebih cepat, gunakan model yang lebih kecil (1B–3B parameter) atau beralih ke Google Translate jika kecepatan prioritas.

3. Halaman dengan teks panjang tidak selesai diterjemahkan. Bagaimana?
Tunggu beberapa saat – TWP memproses teks secara bertahap. Anda juga bisa menekan tombol Translate Now setelah halaman selesai dimuat.

4. Apakah mendukung bahasa seperti Arab atau Cina?
Ya, daftar bahasa yang tersedia: Indonesia, Inggris, Spanyol, Prancis, Jerman, China Sederhana, Jepang, Korea, Arab, Portugis. Untuk AI lokal, pastikan model Anda mendukung bahasa target.

5. Saya ingin berkontribusi. Bagaimana caranya?
Laporkan issue, kirim pull request, atau kembangkan sendiri. Script ini terbuka untuk dimodifikasi.

## 📄 Lisensi
MIT License – Bebas digunakan, dimodifikasi, dan didistribusikan.
Kode asli terinspirasi dari [FilipePS/Traduzir-paginas-web](https://github.com/FilipePS/Traduzir-paginas-web).

## 🙏 Ucapan Terima Kasih
Google Translate, Yandex, MyMemory (Bing) untuk API publik mereka.

Ollama & LM Studio – membuat AI lokal dapat diakses semua orang.

Komunitas UserScript yang terus menginspirasi.

## 📬 Kontak & Dukungan
⭐ Beri bintang jika proyek ini bermanfaat

🐛 Laporkan bug melalui [Issues GitHub](https://github.com/baguzzz/twp-for-userscript/issues)


file ini di tulis oleh ai  untuk  penjelasan script tersebut
