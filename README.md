# Taşkışla · Üç katlı sabit program

Zemin kat, 1. kat ve çatı katı, sade oda kutuları halinde gösterilir. ORTABAHÇE ve ana koridor ilişkileri korunur; kapı/pencere gibi teknik detaylar yayımlanmaz. Orijinal DXF/DWG/PDF dosyaları bu pakete dahil değildir.

## Bu sürüm

- 30 Ekim 2026 tarihinde bir defalık OBS alımı ve fakültenin derslik PDF'si birleştirildi. PEM lisans kodu eklendi. Diğer PDF kodları için de ilgili LS/LU/LUI tabloları bir kez karşılaştırıldı.
- 71 mekânda 724 oturum: 422 doğrudan OBS, 257 OBS'nin eksik bilgisi PDF'den tamamlanmış, 45 yalnızca PDF'de bulunan oturum.
- 17 farklılıkta OBS korundu. 3 kaydın dersliği tamamlanamadı ve bunlar doluluğa katılmadı.
- Tam OBS kaydı PDF ile değiştirilmedi. Eşleştirme CRN, bilinen gün ve saat üzerinden yapılır. Örneğin OBS'de oda 303 olan bir kaydı PDF 309 gösterse de 303 korunur.
- PDF'de olup OBS'de bulunamayan kayıtlar ikincil kaynak olarak ayrıca etiketlenir. Güncel OBS karşılıkları doğrulanmış gibi gösterilmez.
- SBP proje derslikleri için PDF'nin bölüm koordinatörü onayı bekleyen kayıt notu korunur.
- Akşam 18.00–21.30 dersleri ve hafta sonu dersleri hesaba katılır. Örneğin cumartesi 216'da CTT 505 ve cumartesi/pazar 131'de IMT 509E kaydı vardır.
- SER-ATELYE her zaman taralıdır ve boş çalışma alanı önerilerinden çıkarılmıştır. Kayıtlar kaynak karşılaştırması için veri dosyasında korunur.
- X ile belirtilen idari ve diğer mahaller yazısız gri gösterilir. Program eşleşmesi olmayan numaralı odalar çizgilidir; boş olduğu varsayılmaz.
- Zemin katta üstteki oda 126, alttaki 127; çatıdaki 304 etiketi 303 olarak düzeltildi. 1. kat sağ üst sıra, eski plan ve mevcut OBS'ye göre 215–216 olarak eşleştirildi.
- 203A/B/C aynı uzun alanın eşit üç bölümüdür; şemadaki bölme fiziksel duvar anlamına gelmez. Çatı planındaki 380 etiketi OBS'nin D380 koduna bağlıdır.

## Renkler

| Renk | Anlam |
| --- | --- |
| Açık yeşil | Şu an boş, sonra ders var. |
| Koyu yeşil | Şu an boş, günün kalanında başka kayıtlı ders yok. |
| Kırmızı | Şu an ders var; değerlendirme sınırına kadar boşluk açılmıyor. |
| Pembe | Şu an ders var; değerlendirme sınırından önce boşluk açılıyor. |
| Nötr tarama | Program verisi yok veya özel olarak ders çalışmaya kapalı alan. |
| Yazısız gri | Doluluk takibi yapılmayan mahal. |

Değerlendirme sınırı pazartesi–perşembe 17.30, cuma 18.00'dır. Gerçek bir geç ders varsa o günün son ders bitişine uzar. Hafta sonunda kayıtlı dersler kendi saatleriyle değerlendirilir. Akşam 22.00'ye kadar binanın açık olması, tek başına pembe renk üretmez. 22.00 ve sonrası bilinen odalar kapalı görünür. Geç dersler olağan saat sınırları yüzünden yok sayılmaz.

Plan renkleri seçilen başlangıç anını gösterir. Kart listesi başlangıç–bitiş aralığının tamamını kontrol eder. OBS'de 12.29 biten ders, son dakikası dahil olduğundan uygulamada 12.30'a kadar doludur.

## Sabit veri: otomatik güncelleme yok

Site yalnızca paketteki `data/schedule.json` dosyasını okur. OBS'ye canlı istek göndermez. Zamanlanmış iş, GitHub Actions veri toplayıcısı veya otomatik yenileme eklenmedi. Sayfayı yenilemek OBS verisini güncellemez. Dönem veya program değişirse veri dosyası ayrıca yenilenmelidir.

Birinci kaynak: https://obs.itu.edu.tr/public/DersProgram

İkincil kaynak: `2026-27_guzyy_mf_derslik_listesi_v3.pdf`. Orijinal PDF bu pakette yoktur. Kaynak tamamlamaları ve farklılıklar `data/source-audit.json` içinde izlenebilir. Öğretim üyesi adları ve orijinal CAD metadata'sı site verilerine alınmadı.

## Bilgisayarda önizleme

Bu klasörde terminal aç:

```sh
python -m http.server 8000
```

Tarayıcıda http://localhost:8000/#kat-plani adresini aç. İş bitince Ctrl+C ile sunucuyu durdur. Dosyaya çift tıklamak yerine yerel sunucu kullan; tarayıcı program JSON dosyasını file:// üzerinden okuyamayabilir.

## GitHub'daki mevcut siteyi güncelleme

Yanındaki `GITHUB-GUNCELLEME.md` rehberini izle. Repository'yi silmek gerekmez. Yeni paketin içeriğini aynı repository köküne yüklemek yeterlidir. Önceden OBS'den otomatik veri toplayan bir workflow kurulduysa önce onu durdur; GitHub'ın normal Pages yayın işlemini kapatma.

## Kontroller

```sh
node --test tests/availability.test.mjs
```

13 test; iki yeşilin anlamı, akşam ve hafta sonu dersleri, oda çakışmaları, SER-ATELYE kısıtlaması ve veri kaynağı önceliğini denetler. Veriyi hazırlarken ayrıca 9 ayrı birleştirme testi çalıştırıldı. Tarayıcıda üç kat, derslik seçimi, PDF kaynak etiketi, akşam ve cumartesi doluluğu kontrol edildi.

## Kapsam ve erişim

Tarih seçimi sabit haftalık programı haftanın gününe uygular; tatil, sınav haftası veya dönem sınırlarını kontrol etmez. Listelenmeyen dersler, özel rezervasyonlar, etkinlikler ve kullanım izinleri kapsam dışıdır. Bu bağımsız bir araçtır; resmî İTÜ uygulaması değildir.

Henüz e-posta doğrulaması/giriş sistemi yoktur. Bu statik sürüm herkese açık hostingde yayımlanırsa veriler de erişilebilir olur. Kısıtlı erişim için konuştuğumuz sunucu taraflı giriş sistemi ayrıca eklenmelidir.
