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
- [x] İlk girişte arkadaş oluşturma (ad, karakter seçimi)
- [x] Ana ekran: karakter görseli, ad, durum (hungry, tired, happy, bored…), göstergeler (açlık, enerji, mutluluk)
- [x] Firestore modeli: `users/{uid}` → email, friendName, friendState (hungry | tired | happy | bored), lastInteraction, + level, happiness, energy, hunger
- [x] Zamanla azalan değerler (lastInteraction'a göre hesaplanır), duruma göre karakter görseli değişir
- [x] En az 3 etkileşim: Feed, Play, Rest — state değişir, Firestore'a yazılır, UI anında güncellenir, animasyonlu geri bildirim
- [x] History sekmesi: son etkileşimler listesi (Firestore alt koleksiyonu)

## Aşama 3 — Bildirimler
- [x] Expo Notifications izinleri; arkadaş acıkınca/yorulunca yerel bildirim planlama
- [x] Settings: bildirim aç/kapa (zorunlu), arkadaşı sıfırla, açık/koyu tema
- [x] Bildirimi test etmek için "test bildirimi gönder" butonu (geliştirme modunda)

## Aşama 4 — Teslim
- [x] Icon + splash; `tsc` ve lint temiz; Firestore güvenlik kuralları (`firestore.rules`) repoda
- [x] Güvenlik kuralı testleri (Firestore emülatöründe, CI'da)
- [x] En az 3 ekran görüntüsü + tanıtım GIF'i; README (TR + EN) — Firebase kurulum adımlarıyla
- [ ] Bildirim ekran görüntüsü/videosu — gerçek cihazda alınacak (web'de yerel bildirim yok)
- [ ] Berat'ın cihazında doğrulama (elle)
