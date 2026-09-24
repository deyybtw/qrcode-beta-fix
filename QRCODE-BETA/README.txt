FIX VERCEL DEPLOY

Struktur repository GitHub HARUS:

index.html
package.json
vercel.json
api/
  prices.js

Penting:
1. Jangan taruh semua file di subfolder tambahan jika Vercel Root Directory masih root repository.
2. File api/prices.js sekarang memakai format Vercel Function modern (ES module + default fetch handler).
3. vercel.json tidak lagi memakai pola functions, jadi error unmatched-function-pattern tidak muncul.
4. package.json memakai Node.js 22.
5. Setelah push ke GitHub, Vercel akan redeploy otomatis.
6. Cek https://DOMAIN-ANDA.vercel.app/api/prices setelah deploy.

Jika Root Directory Vercel pernah diubah, buka Project > Settings > Build and Deployment > Root Directory dan set ke ./ (repository root), kecuali file-file di atas memang berada di subfolder tertentu.
