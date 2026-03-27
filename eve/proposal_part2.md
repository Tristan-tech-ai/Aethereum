# C. RUANG LINGKUP WEBSITE & SPESIFIKASI PLATFORM

## C.1 — Segmen Target Pengguna

Setiap komponen yang kami buat pada Nexera didesain berbasis riset terhadap variasi kemampuan belajar remaja. Kami merancang target secara spesifik, yaitu Gen-Z dan Gen-Alpha (SD, SMP, SMA, Kuliah tingkat awal).  

| Segmen Pengguna | Kebutuhan Utama | Proposisi Nilai Nexera |
|-----------------|-----------------|------------------------|
| **Pelajar Jarak Menengah/Atas (Usia 12-18)** | Platform belajar mandiri yang tidak terkesan "memaksa", membutuhkan insentif instan untuk mempertahankan fokus. | *Document Dungeon* sebagai metode membaca yang punya timer dan visual RPG; sistem kuis berhadiah XP. |
| **Siswa Pejuang Ujian (SNBT/UTBK & Seleksi)** | Simulasi materi padat secara terfokus; pelacakan sejauh apa komitmen (jam belajar per minggu). | *Focus Duels* (vs siswa lain), Analitik ketahanan (Focus Integrity), Heatmap harian. |
| **Kelompok Ekstrakurikuler/Bimbel Lokal** | Butuh tempat terstruktur untuk berdiskusi materi sekaligus saling memotivasi nilai tanpa *distraction* sosmed. | *Study Raids*, sebuah co-op learning di mana partisipan berbagi progres baca dalam satu ruangan sinkron. |
| **Pendidik/Guru Kreatif** | Ingin melihat materi mereka tersampaikan secara *engaging* namun tidak mau dipusingkan dengan merancang game dari nol. | Ekosistem *Content Library* yang otomatis mem-parsing dokumen/bahan ajar mereka dengan AI ke bentuk quest Nexera. |

## C.2 — Fungsi-Fungsi Inti

Ruang lingkup mekanik di Nexera difokuskan pada pengaplikasian konsep "Playful Mastery". Kami memiliki 7 fungsi operasional inti:

1. **Upload & Parse Content**: Modul penerimaan masukan bahan belajar (PDF, teks panjang, atau URL), lalu mengekstraksinya memakai teknologi pipeline pintar yang menyederhanakan bahasa.  
2. **Generative Assessment Engine**: Sistem kuis otomatis yang membaca inti isi dari tiap bab yang usai *dicapai* (Document Dungeon) dan menanyakan konteksnya untuk "boss battle/guardian battle" di tengah perjalanan baca.  
3. **Session & Focus Tracking**: Modul *core loop* (seperti alarm timer) di mana pengguna dapat mengunci layar untuk mendedikasikan waktu belajar; melacak deviasi atau apabila pengguna hilang fokus, mencoret *Hearts*.  
4. **Gamification Profile (Tiers)**: Penghitung komprehensif seluruh aktivitas (klik, jam belajar, jawaban benar, login streak) memvisualisasikannya di atas struktur *Dynamic Card Tiers* dari peringkat Daun (Seedling) hingga Sage.  
5. **Multiplayer Room Sync (Study Raid)**: WebSocket network system agar beberapa user yang bergabung dalam *Study Raid* saling tersinkron progress section-nya, menstimulasi sensasi *FOMO* saat ada teman yang mulai ke langkah kuis.  
6. **Contextual AI Coach**: Panel *Nexera Assistanten* untuk menjelaskan kenapa salah di kuis, merancang rencana ujian minggu depan, dan merangkum hasil belajar per profil *learning trajectory* individu tersebut.  
7. **Global Leaderboard & Economy**: Rangkuman persaingan komparatif tingkat dunia yang melacak poin *Golds* (Coin Base) sebagai representasi kemajuan, dan *Experience Points* (XP Trend).

## C.3 — Batasan Ruang Lingkup & Keputusan Desain

Sistem kami dibangun secara tangkas dengan fase-fase evolusi:

- **Fase 1 (Saat ini/Lomba FICPACT 2026):** Fitur utama (Dashboard, Public Profile, Document Dungeon interaktif, Gemini AI Assessment otomatis, Study Raids MVP, dan Timer fokus in-app) sudah dapat diakses dan responsif di berbagai perangkat. Juri dapat menjadi saksi kehalusan animasi desain dark mode dan efek partikel di eksekusi *Knowledge Card* dan XP counter.  
- **Fase 2 (Pengembangan aktif pasca kompetisi):** Kami akan menambah fitur *Voice Input* (mendikte rangkuman langsung ke AI coach) dan *Focus Duels* secara lebih kompetitif ala gim pertempuran.  
- **Fase 3 (Roadmap Panjang):** Monetisasi fitur lanjutan di mana *Knowledge Card* dapat ditukar ke "Aethereum Tokens" khusus, integrasi AI lokal untuk mode offline, serta merilis platform *native-mobile applications* via React Native.

## C.4 — Platform yang Didukung

Sebagai produk *web development*, Nexera memiliki kapabilitas instalasi mumpuni untuk berbagai lingkungan layar:

| Platform | Level Optimasi | Fitur Tersedia |
|----------|----------------|----------------|
| **Mobile Web (iOS/Android) 📱** | Primary — Mobile-first | UI sentuh, *Bottom Tab*, Layout 1-kolom, Peringatan Notifikasi. |
| **Desktop Browser 💻** | Full — Responsive & OLED-ready | Animasi kursor presisi tinggi, interaksi *drag-and-drop*, Multiview panel. |
| **Tablet/iPad 🗂** | Full — Adaptive | Penyesuaian layout kolumnar (2 kolom *Knowledge Cards*), Grid lebar dinamis. |
| **PWA (Progressive Web App) ⚡** | Native App Feel | Mampu diinstal dari ikon Browser (Add to Homescreen), caching file statis lebih agresif. |

# D. FITUR WEBSITE & KEUNIKAN

## D.1 — Set Fitur Inti

Demi menciptakan sebuah ekosistem edutainment yang matang, tim Lunar Kumar membangun 7 senjata utama di platform ini:

## Fitur 1: Immersive "Document Dungeon"
Fitur andalan tempat terjadinya aktivitas belajar. Menampilkan antarmuka yang membungkus kegiatan membaca (parsing teks AI) layaknya mengelilingi ruang petualangan. Dilengkapi *timer* minimal 30 detik untuk *forcing function*, tombol tidak aktif sebelumnya agar pengguna dipaksa membaca.

**Cara Kerja:** 
Awal mula, teks artikel dipecah otomatis per subjudul oleh LLM, disajikan secara berurutan dalam node (*Quest Map* linear). Di saat bersamaan, *AI Content Analyzer* menghasilkan *Boss/Guardian battle* dari materi terkait. Saat *timer* usai, barulah tombol "Selesai Baca" tampil dan pertempuran kuis dimulai.

**Nilai bagi Pengguna:**
Memberantas konsep membaca PDF puluhan halaman tanpa istirahat pikiran. Pengguna merasa diberikan asupan "chunk" kecil ilmu dan dipaksa mendemonstrasikan seketika tanpa melupakan isinya, membalas rasa puas (*instant gratification*).

**Keunikan Teknis:** 
Bahan presentasi panjang dirender menjadi *clean markdown* yang diselingi dengan mekanisme game; interaksi *haptic-like feedback* setiap *quest node* dilewati; pergeseran modul murni *client-side state* (*seamless* 0 latency).


## Fitur 2: Study Raids (Sinkronisasi Kolaboratif)
Belajar tidak lagi sepi, Anda dapat membagikan "Room Code" dan menyerang materi yang sama beramai-ramai layaknya sistem *raid guild* dalam game RPG.

**Cara Kerja:**
Data peserta room di-broadcast menggunakan fitur Websocket / Laravel Echo / Reverb/Pusher-like. Sidebar menampilkan kondisi persen (%) progres tiap pemain, sementara di atas terdapat gabungan metrik kesuksesan kru. Fitur ini dirancang membatasi *chatting* agar tidak sampai mendistraksi, namun optimal untuk motivasi (*nudges* emosional via emoji di atas avatar).

**Nilai bagi Pengguna:** 
Menjawab tantangan psikologis bagi mereka yang butuh ditemani secara real-time. Sensasi FOMO yang sangat ampuh manakala sahabat mereka (*team member*) telah menembus *dungeon kuis* selanjutnya. 

**Keunikan Teknis:** 
Status *Focus Integrity* tiap partisipan dalam ruangan dikontrol secara state sinkronous; memvisualisasikan data teman-teman sejawat di hadapan satu UI terpadu yang sangat ringan di *browser bandwidth*.


## Fitur 3: Social Proof & Gamified Profile
Rangkuman visualisasi performa dan "identitas" pembelajar di Nexera, yang bisa ditemui dari sub-link profil masing-masing individu secara publik. Terselip metrik keren bertema futuristik.

**Cara Kerja:**
Skor XP diakumulasi dan diproses melalui batas *threshold Rank* tertentu (Learner, Scholar, Sage). Visual avatar ditata bergaya kaca (*Glassboard/Glassmorphism*). Grafik "Heatmap Harian", layaknya sistem *commit Github* dan kartu sertifikasi pencapaian (*Knowledge Cards*) dirender otomatis memakai Recharts (library D3.js react).

**Nilai bagi Pengguna:**
Rasa bangga yang kuat akan memicu "bragging rights", pengguna dapat memamerkan betapa serius dan betapa kerasnya mereka menaklukkan ilmu. Menyajikan profil yang layak dilirik di luar platform (shareable).

**Keunikan Teknis:**
Desain *Card Tier Colors* menggunakan CSS render *Shimmer-glow particle*, bergantung dari *Mastery* (*Bronze, Silver, Gold, Diamond*). Data ditangkap dengan metrik komputasi yang dalam dengan query optimal.


## Fitur 4: AI Contextual Copilot (Nexera Assistanten)
Bukan *chatbot ChatGPT* sekadar pembicara kosong. Dia adalah direktur di belakang layar yang mengelola jadwal dan bertugas sebagai "Pengawal Kognitif" individu.

**Cara Kerja:**
GeminiService menganalisis profil kelemahan dan "progress session". UI *Assistant Panel* hanya bisa ditarik dengan satu ketukan geser, tidak mendisrupsi bacaan. User menanyakan, "Kenapa tadi jawaban kuis saya salah di nomor 3?", dan sang AI menembak "context payload" sejarah ujian beserta teori asli (RAG - *Retrieval-Augmented Generation*). 

**Nilai bagi Pengguna:** 
Siswa seolah mempekerjakan *Private Tutor* jenius yang stanby 24/7 dan benar-benar paham metrik *struggle* unik setiap bab yang dilewati. 

**Keunikan Teknis:** 
LLM tidak diperbolehkan berhalusinasi (diketatkan prompt filter khusus Edukatif) dan menghasilkan *schema JSON* otomatis saat *Assistant* meracik "Study Plan Target" per minggu yang kelak dicetak menjadi rentetan agenda kalender di Dashboard.


## Fitur 5: Focus Economy & Streak System
Sebuah mesin internal yang memaksa pengguna terus "menghadap ke monitor" dalam wujud hadiah ekonomis (*economy token* "Coins" & "Streak" Api).

**Cara Kerja:** 
Penghitung hari mendeteksi *timestamp timezone* (UTC+) yang diselaraskan dengan server PostgreSQL. Layar yang dipindahkan tabnya atau *minimize window* mencederai "Focus Integrity". Mempertahankan status akan memberkati pengguna dengan "coins" multiplicator.

**Nilai bagi Pengguna:**
Hukuman psikologis dan apresiasi hadiah bekerja paralel. Terpeliharanya aktivitas disiplin membentuk "Habit" permanen di neurologis remaja.

**Keunikan Teknis:** 
Melacak *visibilitychange object event API* di dalam standard Javascript agar pengguna yang menyontek ChatGPT di jendela tab lain dapat dijatuhi vonis putus fokusnya (turun Heart XP).


## Fitur 6: Leaderboard (Hall of Sages) & Explore
Papan arena bagi pemain ambisius yang lapar ketenaran, juga pusat mesin pencari materi luar biasa buatan pengguna terpopuler dari provinsi lain.

**Cara Kerja:**
Modul *query ranking* canggih merekap jutaan interaksi harian, melakukan indexing pencarian (*Full-Text Search*) pada judul modul konten dan kategori terfiltrasi dengan algoritma *lazy-loading (Infinite Scroll)* di *backend API paginator*.

**Nilai bagi Pengguna:**
Memberi ladang kompetisi tidak berbatas pagar institusi sekolah. Pelajar di desa terpencil dapat berkedudukan persis sebagai MVP nomor satu se-Indonesia.

**Keunikan Teknis:**
Efisiensi caching memori agar Leaderboard bisa dibuka ratusan orang serentak tanpa mengganggu operasional sistem SQL (via memcache optimasi atau struktur indeks RDBMS).


## Fitur 7: Dynamic "Calm Premium Dark" Dashboard
Bukan antarmuka putih cemerlang membosankan (seperti E-Learning K-12 umumnya). Dashboard kami adalah landasan kapal induk "Aethereum" berbasis estetika luar angkasa gelap nan santai.

**Cara Kerja:**
Disusun menggunakan Tailwind CSS dengan manajemen abstraksi "Token System" tingkat Enterprise (`--bg-primary`, `--color-primary-light`, dll). Dashboard dibersihkan dari animasi menjengkelkan emoji, namun dipenuhi mikro-animasi Lucide React Icons *Hover Lifting*.

**Nilai bagi Pengguna:**
Menghilangkan sensasi "ini adalah pelajaran berat sekolah". Lingkungan *premium dark* ini terasa profesional seperti perangkat utilitas *developer/gamer*, mereduksi mata lelah dan emosi letih.

**Keunikan Teknis:**
Rancangan *Component Library* dan *Design Ruleset* di implementasikan hingga tingkat presisi batas garis (1px solid), mematuhi *Accessibility Ratio WCAG* demi keterbacaan kontras visual.

## D.2 — Proposisi Nilai Unik (Unique Value Propositions)

### UVP 1: The Only EdTech Built Like an RPG
Berbeda jauh dengan sistem Quizizz atau Kahoot yang hanya merapikan "pilihan ganda di layar". Nexera mendesain "alur baca" yang dirajut bersama status komparatif dan sistem XP layaknya karakter RPG—di mana *ilmu pengetahuan* adalah senjatanya.

### UVP 2: Social Accountability By Design
Belajar via daring (online) membuat generasi kita rapuh dan berpotensi memisahkan kebersamaan. *Study Raids* pada Nexera mentransformasi isolasi ini menjadi pesta kerja keras secara langsung (sinkron). Jika kamu diam, teman satu "*raid party*" menyaksikannya.

### UVP 3: Personal AI Tutor Without the Cost & Confusion
Di saat yang lain mematok harga mahal berlangganan paket materi premium, Nexera menyediakan *Generative Coach* menggunakan mesin LLM yang spesifik diarahkan secara arsitektur (Prompt injection control) agar menguasai materi statis tersebut ke konteks pengguna yang tertinggal pemahamannya dengan *real feedback loop*.

## D.3 — Nilai Inovasi

Melalui penyatuan estetika platform gim sosial (seperti *Discord*), kepintaran kecerdasan sintetik (Gemini-AI), dan penguncian konsentrasi mekanika game teka-teki, Nexera mengharamkan pendekatan gaya "diktat online statis".

Inovasi teknis terberat ada pada rekayasa komputasinya: secara mandiri *pipeline engine* (GeminiService.php) dapat memotong otomatis bahan puluhan halaman (misal: PDF biologi sel), mendeteksi pola konsep penting yang tak terlihat kasat mata (summarization & contextual QA extraction), merekatkannya menjadi pos poin *dungeon* level per level, dan membangun infrastruktur penilaian berbasis persentase (*Focus Integrity, Speed Feedback*) seketika. Hal ini menyingkirkan keharusan manual peran seorang desainer kurikulum dalam "memotong" modul, yang dulu dinilai sangat lambat bagi evolusi *interactive learning*. Keunikan inilah yang dipertaruhkan dalam Nexera: memberantas kebosanan di titik puncaknya.
