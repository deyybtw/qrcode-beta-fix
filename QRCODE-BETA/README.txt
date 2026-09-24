LAYANAN PUBLIK TVRI — RUNNING TEXT PIHPS BANK INDONESIA

Sumber harga:
https://www.bi.go.id/hargapangan

Dataset yang digunakan:
- PIHPS Nasional
- Pasar Tradisional
- Lingkup Nasional
- Harga terbaru dan perubahan dibanding titik data sebelumnya

Cara deploy ke Vercel:
1. Upload seluruh isi folder ini ke ROOT repository GitHub.
2. Pastikan struktur repository:
   index.html
   package.json
   vercel.json
   api/prices.js
3. Push ke branch yang terhubung ke Vercel.
4. Vercel akan deploy otomatis.
5. Uji endpoint: https://DOMAIN-ANDA.vercel.app/api/prices
6. Jika JSON menampilkan ok:true, running text akan mengambil data otomatis.

Frontend mengecek data baru setiap 1 jam.
Vercel Function memakai cache 30 menit untuk mengurangi request ke situs sumber.

Catatan:
PIHPS Bank Indonesia memperbarui data harga pangan pada hari kerja. Bila data pada hari ini belum tersedia, endpoint menggunakan titik data terbaru yang sudah dipublikasikan PIHPS.
