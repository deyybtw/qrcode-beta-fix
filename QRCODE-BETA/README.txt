LAYANAN PUBLIK TVRI - HARGA PANGAN OTOMATIS

Isi project:
- index.html        : website utama
- api/prices.js     : Vercel Serverless Function untuk mengambil harga terbaru BI PIHPS
- vercel.json       : konfigurasi function

CARA DEPLOY KE VERCEL:
1. Upload SELURUH FOLDER project ini ke Vercel, bukan index.html saja.
2. Deploy seperti biasa.
3. Setelah live, buka /api/prices untuk mengecek feed JSON.
4. Halaman utama akan mengambil /api/prices otomatis dan refresh setiap 1 jam.

Sumber harga otomatis:
Bank Indonesia PIHPS (Pasar Tradisional, nasional).

Komoditas live yang ditampilkan:
- Beras Medium I
- Gula Pasir Lokal
- Minyak Goreng Curah
- Daging Sapi Kualitas 1
- Daging Ayam Ras Segar
- Telur Ayam Ras Segar
- Bawang Merah
- Bawang Putih

Catatan:
Mentega, susu, LPG, minyak tanah, dan garam beryodium tidak seluruhnya tersedia pada feed harian nasional PIHPS, sehingga ticker menampilkan catatan ketersediaan/variasi wilayah untuk komoditas tersebut dan tidak mengarang angka harga.
