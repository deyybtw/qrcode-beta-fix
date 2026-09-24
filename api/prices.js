const BASE_URL = 'https://www.bi.go.id/hargapangan';

const COMMODITIES = [
  { biId: 'com_3',  label: 'Beras Kualitas Medium I', unit: 'kg' },
  { biId: 'com_21', label: 'Gula Pasir Lokal', unit: 'kg' },
  { biId: 'com_17', label: 'Minyak Goreng Curah', unit: 'liter' },
  { biId: 'com_8',  label: 'Daging Sapi Kualitas 1', unit: 'kg' },
  { biId: 'com_7',  label: 'Daging Ayam Ras Segar', unit: 'kg' },
  { biId: 'com_10', label: 'Telur Ayam Ras Segar', unit: 'kg' },
  { biId: 'com_11', label: 'Bawang Merah Ukuran Sedang', unit: 'kg' },
  { biId: 'com_12', label: 'Bawang Putih Ukuran Sedang', unit: 'kg' }
];

function json(data, status = 200, cache = 'no-store') {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': cache,
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function jakartaDate(daysOffset = 0) {
  const shifted = new Date(Date.now() + daysOffset * 86400000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(shifted);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

function parsePrice(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  const s = String(value).trim();
  if (!s || s === '-' || s === '0') return null;
  const digits = s.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function keyToIso(key) {
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(key);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return iso ? key : null;
}

function findNationalRow(rows) {
  return rows.find(row => {
    const name = String(row?.name || row?.nama || row?.region || '').trim().toLowerCase();
    return Number(row?.level) === 0 || name === 'semua provinsi' || name.includes('nasional');
  }) || null;
}

function extractSeries(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const national = findNationalRow(rows);
  const dateKeys = [...new Set(rows.flatMap(row => Object.keys(row || {}).filter(k => keyToIso(k))))]
    .sort((a, b) => keyToIso(b).localeCompare(keyToIso(a)));

  const points = [];
  for (const key of dateKeys) {
    let price = national ? parsePrice(national[key]) : null;
    let method = 'national';

    if (price === null) {
      const vals = rows
        .filter(row => Number(row?.level) === 1)
        .map(row => parsePrice(row[key]))
        .filter(v => v !== null);
      if (vals.length) {
        price = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        method = 'province-average';
      }
    }

    if (price !== null) {
      points.push({ date: keyToIso(key), price, method });
      if (points.length >= 2) break;
    }
  }
  return points;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) throw new Error(`PIHPS HTTP ${response.status}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Respons PIHPS bukan JSON yang valid');
  }
}

async function getCommodity(item, cookie, startDate, endDate) {
  const u = new URL(`${BASE_URL}/WebSite/TabelHarga/GetGridDataKomoditas`);
  u.searchParams.set('price_type_id', '1');
  u.searchParams.set('comcat_id', item.biId);
  u.searchParams.set('province_id', '');
  u.searchParams.set('regency_id', '');
  u.searchParams.set('showKota', 'false');
  u.searchParams.set('showPasar', 'false');
  u.searchParams.set('tipe_laporan', '1');
  u.searchParams.set('start_date', startDate);
  u.searchParams.set('end_date', endDate);
  u.searchParams.set('_', String(Date.now()));

  const data = await fetchJson(u.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `${BASE_URL}/TabelHarga/PasarTradisionalKomoditas`,
      ...(cookie ? { Cookie: cookie } : {})
    }
  });

  const rows = data?.data || data?.Data || data?.rows || [];
  const points = extractSeries(rows);
  if (!points.length) throw new Error(`Tidak ada data untuk ${item.label}`);

  const current = points[0];
  const previous = points[1] || null;
  const change = previous?.price
    ? Number((((current.price - previous.price) / previous.price) * 100).toFixed(2))
    : null;

  return {
    ...item,
    price: current.price,
    previous: previous?.price ?? null,
    change,
    date: current.date,
    method: current.method
  };
}

export async function GET() {
  try {
    const home = await fetch(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36'
      },
      signal: AbortSignal.timeout(18000)
    });
    if (!home.ok) throw new Error(`Beranda PIHPS HTTP ${home.status}`);

    const cookie = home.headers.get('set-cookie') || '';
    const endDate = jakartaDate(0);
    const startDate = jakartaDate(-12);

    const settled = await Promise.allSettled(
      COMMODITIES.map(item => getCommodity(item, cookie, startDate, endDate))
    );

    const prices = settled.filter(x => x.status === 'fulfilled').map(x => x.value);
    const warnings = settled.filter(x => x.status === 'rejected').map(x => x.reason?.message || String(x.reason));

    if (!prices.length) throw new Error('Data harga PIHPS tidak berhasil dibaca');

    const asOf = prices.map(x => x.date).filter(Boolean).sort().at(-1) || null;

    return json({
      ok: true,
      source: 'PIHPS Nasional - Bank Indonesia',
      sourceUrl: BASE_URL,
      market: 'Pasar Tradisional',
      scope: 'Nasional',
      asOf,
      prices,
      warnings,
      generatedAt: new Date().toISOString()
    }, 200, 's-maxage=1800, stale-while-revalidate=3600');
  } catch (error) {
    return json({
      ok: false,
      source: 'PIHPS Nasional - Bank Indonesia',
      sourceUrl: BASE_URL,
      error: error?.message || 'Gagal mengambil data harga dari PIHPS Bank Indonesia'
    }, 503);
  }
}
