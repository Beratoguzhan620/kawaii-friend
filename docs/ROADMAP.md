# Kawaii Friend — Yol Haritası

Firebase ile giriş yapılan, durumu Firestore'da tutulan ve bildirim gönderen sanal arkadaş (Tamagotchi benzeri) uygulaması.

- **Önerilen repo adı:** `kawaii-friend`
- **Teknoloji:** Expo (managed), React Native, TypeScript, NativeWind, expo-router
- **Kurallar:** `CONTRIBUTING.md` · **Tasarım:** `docs/DESIGN.md`

Her aşama ayrı bir branch ve PR olarak yapılır (`stage/<no>-<kisa-ad>`). Bir aşama ancak tüm maddeleri bitince, build/testler geçince ve ekran görüntüleri eklenince tamamlanmış sayılır. Biten maddeler `[x]` yapılır.

> Orijinal ödev metni yalnızca yerelde `docs/brief/` klasöründe durur (git'e girmez); bütün gereksinimler bu dosyaya işlenmiştir. Gereksinim: Expo managed, TypeScript, NativeWind, Firebase Auth (e-posta/şifre) + Firestore, Expo Notifications.

## Aşama 1 — Kurulum ve kimlik
- [x] Expo + TypeScript + NativeWind; `docs/DESIGN.md` token'ları — **istisna:** bu projede pastel/kawaii tema, yuvarlak köşeler, sevimli karakter görselleri ve bildirimlerde emoji serbest (ödev şartı); sert renk yok
- [x] Bottom Tab Navigation: Home (My Friend), History (etkileşim geçmişi), Settings
- [x] Firebase config `.env` (EXPO_PUBLIC_*) üzerinden; `.env.example` eklenir, gerçek değer repoya girmez
- [x] Login / Register / çıkış; giriş yapmadan uygulama kullanılamaz
- [x] Firebase ayarı yoksa demo modu (veriler cihazda); CI uçtan uca akışı hem demo modunda hem Firebase emülatörlerinde çalıştırır

## Aşama 2 — Arkadaş ve durumlar
- [ ] İlk girişte arkadaş oluşturma (ad, karakter seçimi)
- [ ] Ana ekran: karakter görseli, ad, durum (hungry, tired, happy, bored…), göstergeler (açlık, enerji, mutluluk)
- [ ] Firestore modeli: `users/{uid}` → email, friendName, friendState (hungry | tired | happy | bored), lastInteraction, + level, happiness, energy, hunger
- [ ] Zamanla azalan değerler (lastInteraction'a göre hesaplanır), duruma göre karakter görseli değişir
- [ ] En az 3 etkileşim: Feed, Play, Rest — state değişir, Firestore'a yazılır, UI anında güncellenir, animasyonlu geri bildirim
- [ ] History sekmesi: son etkileşimler listesi (Firestore alt koleksiyonu)

## Aşama 3 — Bildirimler
- [ ] Expo Notifications izinleri; arkadaş acıkınca/yorulunca yerel bildirim planlama
- [ ] Settings: bildirim aç/kapa (zorunlu), arkadaşı sıfırla, açık/koyu tema
- [ ] Bildirimi test etmek için "test bildirimi gönder" butonu (geliştirme modunda)

## Aşama 4 — Teslim
- [ ] Icon + splash; `tsc` ve lint temiz; Firestore güvenlik kuralları (`firestore.rules`) repoda
- [ ] En az 3 ekran görüntüsü + 1 bildirim görüntüsü/videosu; README (TR + EN) — Firebase kurulum adımlarıyla
- [ ] Berat'ın cihazında doğrulama (elle)
