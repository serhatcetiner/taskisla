# Taşkışla · Sabit ders programı sürümü

20 Ekim 2026 tarihinde İTÜ OBS’den alınan 2026–2027 Güz ders programını kullanır. 63 MMB mekânı ve 278 oturum içerir. Otomatik veri güncellemesi yoktur. Dönem programı değişirse veya yeni dönem başlarsa veri dosyası yenilenmelidir.

## GitHub web sitesinden yayımla

1. ZIP dosyasını bilgisayarında çıkart.
2. Mevcut GitHub projenin Code sekmesinde Add file → Upload files seç.
3. Çıkarttığın klasörün içindeki bütün dosya ve klasörleri yükleme alanına sürükle. ZIP dosyasını veya dıştaki klasörü yükleme. index.html doğrudan proje kökünde görünmeli; assets ve data klasörleri de yanında olmalı.
4. Commit changes ile kaydet; onay penceresi çıkarsa tekrar Commit changes seç. Aynı adlı mevcut dosyalar güncellenir.
5. Settings → Pages bölümüne gir.
6. Source: Deploy from a branch seç.
7. Branch: main, yanındaki klasör: /(root) seç ve Save düğmesine bas. Dalının adı master ise main yerine master seç.
8. Birkaç dakika sonra aynı sayfadaki Visit site düğmesiyle siteyi aç.

Bu sürümde özel bir Actions dosyası veya veri güncelleme izni gerekmez. GitHub yayını kendi Pages işlemiyle hazırlar.

## Kapsam

Kaynak: https://obs.itu.edu.tr/public/DersProgram

Lisans: MIM, ENT, EUT, SBP, SNT, ITB.
Lisansüstü: MTS, MTZ, CKY, MBL, MIT, PYY, RST, YAB, STR, KET, GIT, CET, IPY.

CET bu taramada OBS seçim listesinde yoktu. IPY tablosu boştu. 11 MMB oturumunun dersliği belirtilmemişti. Eksik kayıtlar kapsam ekranında açıklanır.

Boş görünen derslikler yalnızca seçilen kodlardaki haftalık ders programına göre hesaplanır. Sınav, etkinlik, tatil, özel rezervasyon ve diğer kodlardaki dersler hesaba katılmaz. Tarih seçimi, bu sabit programı seçilen haftanın gününe uygular; geçmiş veya gelecek dönemin programını getirmez. Stüdyo ve atölyelerde kullanım izni gerekebilir.

Favoriler tarayıcıda saklanır. Google Fonts erişilemezse sistem yazı tipi kullanılır. Bağımsız bir araçtır; resmî İTÜ uygulaması değildir.

## Bilgisayarda önizleme

Python kuruluysa bu klasörde `python -m http.server 8000` çalıştır ve tarayıcıda http://localhost:8000 adresini aç. GitHub’da yayımlamak için bilgisayarına program kurman gerekmez.
