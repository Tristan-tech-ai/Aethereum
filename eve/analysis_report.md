# 🔍 Analisis: Kenapa Setiap Pindah Halaman Selalu Loading & Sangat Lambat

## Ringkasan Masalah

Setiap kali user berpindah halaman, **semua data di-fetch ulang dari backend API** tanpa caching. Ini menyebabkan loading spinner muncul setiap navigasi dan pengalaman yang sangat lambat. Berikut adalah 6 akar masalah yang ditemukan.

---

## 🚨 Akar Masalah #1: Tidak Ada Data Caching di Zustand Stores

**Ini adalah masalah TERBESAR.**

Semua 10 Zustand store **tidak memiliki mekanisme caching sama sekali**. Setiap kali component di-mount (halaman dibuka), data selalu di-fetch ulang dari nol.

### Bukti:

| Halaman | File | Pattern | API Calls per Visit |
|---------|------|---------|---------------------|
| Dashboard | [useDashboard.js](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/hooks/useDashboard.js) | `useEffect → fetch` setiap mount | 1 call (`/v1/dashboard`) |
| Library | [ContentLibraryPage.jsx](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/ContentLibraryPage.jsx) | `useEffect → fetchContents(1)` setiap mount | 1+ calls (`/v1/content`) |
| Profile | [KnowledgeProfilePage.jsx](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/KnowledgeProfilePage.jsx) | `useEffect → 4x Promise.allSettled` setiap mount | **4 parallel calls** |
| Tasks | [TasksPage.jsx](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/TasksPage.jsx) via `taskStore.fetchAll()` | `useEffect → fetchAll` setiap mount | **5 parallel calls** |
| Leaderboard | [LeaderboardPage.jsx](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/LeaderboardPage.jsx) | `useEffect → fetch` setiap mount | 1 call (`/v1/leaderboards/*`) |
| Report | [ReportPage.jsx](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/ReportPage.jsx) | `useEffect → fetch` setiap mount | 1 call (`/v1/reports/learning`) |

### Contoh Kode Bermasalah:

```jsx
// useDashboard.js — SELALU fetch ulang, tidak pernah cache
useEffect(() => {
    fetch();  // dipanggil setiap mount = setiap kali user buka dashboard
}, [fetch]);
```

```jsx
// KnowledgeProfilePage.jsx — 4 API calls setiap buka halaman profile!
useEffect(() => {
    const fetchData = async () => {
        const [profRes, cardsRes, achRes, heatRes] = await Promise.allSettled([
            api.get("/api/v1/profile/me"),
            api.get("/api/v1/profile/me/cards?per_page=50"),
            api.get("/api/v1/profile/me/achievements"),
            api.get("/api/v1/profile/me/heatmap"),
        ]);
        // ...
    };
    fetchData();
}, []);  // mount = fetch semua dari awal lagi
```

```jsx
// TasksPage.jsx — 5 API calls setiap mount!
useEffect(() => {
    fetchAll();  // calls fetchActiveSessions, fetchActiveDuels, fetchActiveRaids, 
                 // fetchCurrentChallenge, fetchSummary
}, [fetchAll]);
```

---

## 🚨 Akar Masalah #2: Tidak Ada `stale-while-revalidate` Pattern

Saat ini flow-nya: **Navigate → Show Spinner → Wait API → Show Data**.

Yang ideal: **Navigate → Show Cached Data Instantly → Background Refresh → Update UI subtly**.

Tidak ada satupun store yang menyimpan "kapan terakhir data di-fetch" (`lastFetchedAt`), sehingga tidak bisa memutuskan apakah data perlu di-refresh atau bisa langsung ditampilkan.

---

## 🚨 Akar Masalah #3: API Token Wait Blocking (Sampai 4 detik!)

```jsx
// api.js interceptor — pada hard refresh/first request
if (!currentAccessToken && tokenReady) {
    await Promise.race([
        tokenReady,
        new Promise((r) => setTimeout(r, 4000)),  // ⚠️ WAIT UP TO 4 SECONDS!
    ]);
}
```

Setiap request pertama setelah load bisa **blocked sampai 4 detik** menunggu Supabase auth token. Ini membuat initial load sangat lambat.

---

## 🚨 Akar Masalah #4: Tidak Ada Code Splitting / Lazy Loading

```jsx
// router.jsx — semua 20+ pages di-import statically
import DashboardPage from "./pages/DashboardPage";         // 34KB
import ContentLibraryPage from "./pages/ContentLibraryPage"; // 43KB  
import KnowledgeProfilePage from "./pages/KnowledgeProfilePage"; // 39KB
import GenerateCoursePage from "./pages/GenerateCoursePage";   // 47KB
// ... dst
```

Semua halaman di-import secara **eager/static**, artinya browser harus download & parse SELURUH bundle (~200KB+ pages saja) sebelum bisa menampilkan satu halaman pun.

---

## 🚨 Akar Masalah #5: Zustand Store State Tidak Persistent

Setiap kali user refresh browser atau navigate, Zustand state di-reset ke initial values (semua `[]`, `null`, `false`). Tidak ada `persist` middleware yang menyimpan state ke `localStorage` / `sessionStorage`.

---

## 🚨 Akar Masalah #6: Beberapa Halaman Membuat API Call Duplikat

- [TasksPage](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/pages/TasksPage.jsx#385-609) memanggil [fetchActiveDuels()](file:///c:/Users/Tristan/Herd/Aethereum/frontend/src/stores/taskStore.js#67-82) yang hit `/v1/duels/my`
- Community pages juga hit endpoint yang sama via `socialStore.fetchMyDuels()`
- Tidak ada shared cache layer antar stores

---

## 📋 Rekomendasi Perbaikan (Urut Prioritas)

### 1. ✅ Implementasi Smart Caching di Zustand Stores (IMPACT: TINGGI)

Tambahkan `lastFetchedAt` timestamp + `CACHE_TTL` ke setiap store. Skip fetch jika data masih fresh.

```jsx
// Contoh pattern yang benar
const CACHE_TTL = 60_000; // 1 menit

fetchContents: async (page = 1, force = false) => {
    const { lastFetched, contents } = get();
    if (!force && contents.length > 0 && Date.now() - lastFetched < CACHE_TTL) {
        return contents; // Return cached data, skip API call
    }
    set({ loading: true });
    // ... fetch dari API
    set({ contents: items, lastFetched: Date.now(), loading: false });
}
```

### 2. ✅ Implement `stale-while-revalidate` untuk UX Instan (IMPACT: TINGGI)

Tampilkan data lama langsung (instant) sambil refresh di background:

```jsx
fetchContents: async (page = 1) => {
    const { contents, lastFetched } = get();
    const isStale = !lastFetched || Date.now() - lastFetched > CACHE_TTL;

    // Jika data ada tapi stale → tampilkan langsung, refresh di background
    if (contents.length > 0 && isStale) {
        // Tidak set loading: true (user tetap lihat data lama)
        api.get("/v1/content", { params }).then(res => {
            set({ contents: res.data, lastFetched: Date.now() });
        });
        return;
    }
    // ... normal fetch with loading = true
}
```

### 3. ✅ Lazy Loading Routes dengan `React.lazy()` (IMPACT: MEDIUM)

```jsx
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ContentLibraryPage = lazy(() => import("./pages/ContentLibraryPage"));
// ... dst
```

Ini akan memecah bundle sehingga hanya halaman yang dibutuhkan yang di-download.

### 4. ✅ Kurangi Token Wait Timeout (IMPACT: MEDIUM)

Ubah dari 4s menjadi 1.5s dan gunakan cached token dari `localStorage` langsung:

```jsx
await Promise.race([
    tokenReady,
    new Promise((r) => setTimeout(r, 1500)), // dari 4000ms → 1500ms
]);
```

### 5. ✅ Zustand Persist untuk Data Penting (IMPACT: MEDIUM)

Gunakan `zustand/middleware` persist untuk `authStore` dan `contentStore`:

```jsx
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({ /* ... store */ }),
        { name: 'auth-storage', partialize: (state) => ({ user: state.user }) }
    )
);
```

### 6. ✅ Gabungkan API Calls yang Duplikat (IMPACT: LOW-MEDIUM)

Buat shared data layer agar endpoint yang sama tidak di-hit berkali-kali dari stores berbeda.

---

## 📊 Estimasi Impact Setelah Perbaikan

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Waktu pindah halaman | 2-5 detik (full loading) | **< 100ms** (cached) |
| API calls per navigasi | 1-5 calls | **0 calls** (jika cached) |
| Initial bundle size | ~500KB+ (semua pages) | **~100KB** (only current page) |
| First meaningful paint | 4-6 detik | **< 1.5 detik** |

> [!IMPORTANT]
> Masalah utama bukan di backend API speed, melainkan **frontend architecture yang tidak memiliki caching layer sama sekali**. Setiap navigasi = full re-fetch = loading spinner = slow UX.
