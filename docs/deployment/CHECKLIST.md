## Railway Dashboard Setup
- [ ] Buat project baru di Railway
- [ ] Connect GitHub repo
- [ ] Tambahkan service: aethereum-api (pakai railway.json)
- [ ] Tambahkan service: aethereum-worker (pakai railway.worker.json)
- [ ] Tambahkan service: aethereum-scheduler (pakai railway.scheduler.json)
- [ ] Set semua environment variables dari .env.production.example
- [ ] Pastikan APP_KEY sudah di-generate (php artisan key:generate --show)

## Database
- [ ] Konfirmasi Supabase pooler bisa diakses dari Railway region
- [ ] Jalankan: php artisan migrate:status (pastikan semua migration ready)

## Post First Deploy
- [ ] Cek /api/health mengembalikan status "ok"
- [ ] Cek Railway logs untuk worker service (tidak ada error)
- [ ] Test endpoint POST /api/v1/assistant/chat/message
- [ ] Cek Railway logs untuk scheduler (schedule:work berjalan)

## Rollback Plan
- Jika deploy gagal: Railway → Deployments → Rollback ke versi sebelumnya
- Migration rollback: php artisan migrate:rollback --step=1
