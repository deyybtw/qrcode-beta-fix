FIX API 404 - VERCEL

PENTING: semua file/folder berikut harus berada langsung di ROOT repository GitHub:

index.html
package.json
vercel.json
api/
  ping.js
  prices.js

JANGAN taruh di dalam subfolder qrcode-beta-fix-bi-404-fixed/ pada repository.

Vercel Settings:
- Framework Preset: Other
- Root Directory: kosong / repository root (./)
- Build Command: kosong
- Output Directory: kosong

Setelah push/redeploy, tes berurutan:
1. https://DOMAIN-ANDA.vercel.app/api/ping
   Harus menghasilkan JSON ok:true.
2. https://DOMAIN-ANDA.vercel.app/api/prices
   Jika ping berhasil tetapi prices error 503, routing sudah benar dan masalah berikutnya ada di upstream PIHPS.

Jika /api/ping masih 404, berarti folder api tidak berada di Root Directory yang dideploy atau Vercel Root Directory masih menunjuk ke subfolder lain.


LOGO SUBMENU:
Logo instansi dicari otomatis dari domain resmi (/favicon.ico, favicon.png, apple-touch-icon), lalu fallback ke Google dan DuckDuckGo favicon. Beberapa subdomain memakai logo domain induk kementerian/lembaga.


LOGO SUBMENU
- /api/logo mencari logo dari situs resmi instansi secara server-side.
- Tidak perlu upload logo kementerian satu per satu.
- Jika situs tidak menyediakan aset logo yang dapat diambil, fallback berupa inisial instansi tetap ditampilkan.
