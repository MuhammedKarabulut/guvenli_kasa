# 🔐 Güvenli Kasa

**PIN veya yüz tanıma** ile korunan, masaüstü güvenli kasa uygulaması. Gizli dosyalarınızı şifreli saklayın; sadece sizin seçtiğiniz yöntemle (PIN veya yüz) kasaya erişilebilir.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Özellikler

| Özellik | Açıklama |
|--------|----------|
| **İki giriş seçeneği** | Girişte **PIN ile** veya **yüz ile** giriş yapmayı seçebilirsiniz. |
| **Güçlü PIN kuralları** | En az 6 rakam, 3 farklı rakam; `123456`, `111111` gibi yaygın PIN’ler engellenir. |
| **Yüz tanıma** | İlk kurulumda yüzünüz kaydedilir; girişte yüzünüzle doğrulama yapılır. |
| **Şifreli depolama** | Dosyalar **AES-256-GCM** ile şifrelenir; anahtar PIN’den güvenli şekilde türetilir. |
| **Masaüstü uygulama** | Electron ile Windows, macOS ve Linux’ta çalışır. |

---

## 🛠️ Teknolojiler

- **Electron** – Masaüstü uygulama çatısı  
- **React + TypeScript + Vite** – Arayüz ve geliştirme ortamı  
- **@vladmandic/face-api** – Yüz algılama ve tanıma (TensorFlow.js)  
- **Node.js crypto** – PIN hash (PBKDF2), dosya şifreleme (AES-256-GCM)  

---

## 📦 Kurulum

Projeyi bilgisayarınıza alın ve bağımlılıkları yükleyin:

```bash
git clone https://github.com/KULLANICI_ADINIZ/guvenli-kasa.git
cd guvenli-kasa
npm install
```
---

## 🚀 Çalıştırma

### Geliştirme modu

```bash
npm run electron:dev
```

Uygulama penceresi açılır. İlk açılışta yüz tanıma modelleri internet üzerinden (CDN) yüklenir.

### Dağıtım (yüklenebilir uygulama)

```bash
npm run electron:build
```

Oluşan kurulum dosyaları `release/` klasöründe bulunur.

---

## 📖 Kullanım

### İlk kurulum

1. Uygulama açıldığında **Güvenli Kasa Kurulumu** ekranı gelir.
2. **PIN belirleyin**: En az 6 rakam, 3 farklı rakam (örn. `829451`).
3. **Yüzünüzü kaydedin**: Kameraya bakın, **Doğrula** ile kaydedin.
4. Kurulum tamamlanır; bir sonraki açılışta giriş ekranı gelir.

### Giriş

- **PIN ile giriş**: PIN’inizi girin → doğrudan kasaya girersiniz.
- **Yüz ile giriş**: Yüzünüzü doğrulayın → ardından kasaya erişmek için PIN girin.

### Kasa içi işlemler

- **Dosya Ekle**: Bilgisayarınızdan dosya seçip kasaya ekleyin (şifreli saklanır).
- **İndir**: Dosyayı kasadan çıkarıp kaydedin.
- **Sil**: Dosyayı kasadan kalıcı olarak silin.
- **Kilitle**: Kasayı kilitler; tekrar giriş yapmanız gerekir.

---

## 🔒 Güvenlik

- PIN, **tuzlanmış** ve **hash’lenmiş** olarak yalnızca cihazınızda saklanır.
- Yüz tanıma verisi (descriptor) yalnızca cihazda tutulur; sunucuya gönderilmez.
- Kasa dosyaları kullanıcı veri dizininde şifreli saklanır (`userData/secure-vault`).
---
## 📄 Lisans
Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
---
## 👤 Katkıda bulunma
Hata bildirimi ve öneriler için **Issue** açabilir, değişiklikleriniz için **Pull Request** gönderebilirsiniz.
