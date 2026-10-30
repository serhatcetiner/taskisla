# Taşkışla · Üç katlı sabit program

Zemin kat, 1. kat ve çatı katı, sade oda kutuları halinde gösterilir.

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

## Kapsam ve erişim

Tarih seçimi sabit haftalık programı haftanın gününe uygular; tatil, sınav haftası veya dönem sınırlarını kontrol etmez. Listelenmeyen dersler, özel rezervasyonlar, etkinlikler ve kullanım izinleri kapsam dışıdır. Bu bağımsız bir araçtır; resmî İTÜ uygulaması değildir.

Henüz e-posta doğrulaması/giriş sistemi yoktur.
