# GitHub'a Yükleme Rehberi (GitHub Desktop)

Bu projeyi GitHub hesabınıza yüklemek için aşağıdaki adımları izleyin.

---

## 1. GitHub'da yeni depo oluşturma

1. [github.com](https://github.com) adresine gidin ve giriş yapın.
2. Sağ üstten **+** → **New repository** seçin.
3. **Repository name:** `guvenli-kasa` veya `yuzveses` (tercihinize göre; Türkçe karakter kullanmayın).
4. **Description:** `PIN veya yüz tanıma ile korunan güvenli kasa masaüstü uygulaması`
5. **Public** seçin.
6. **"Add a README file"** işaretini **kaldırın** (zaten projede README var).
7. **Create repository** ile oluşturun.

---

## 2. GitHub Desktop ile projeyi bağlama

1. **GitHub Desktop** uygulamasını açın.
2. **File** → **Add local repository** seçin.
3. Şu klasörü seçin: `C:\Users\Muhammed\Desktop\Github\yuzveses`
4. Eğer "This directory does not appear to be a Git repository" uyarısı çıkarsa:
   - **"create a repository"** linkine tıklayın **veya**
   - **Repository** → **Initialize repository** ile bu klasörde Git’i başlatın.
5. Sol altta tüm dosyalar listelenecek. **Summary** kısmına örn: `İlk commit: Güvenli Kasa uygulaması` yazın.
6. **Commit to main** butonuna tıklayın.
7. Üst menüden **Publish repository** seçin.
8. **Name:** GitHub’da oluşturduğunuz repo adı (örn. `güvenli-kasa`).
9. **Description** kısmına kısa açıklama yazın (isteğe bağlı).
10. **Keep this code private** kutusunu **işaretlemeyin** (herkese açık olsun).
11. **Publish Repository** ile yükleyin.

---

## 3. Sonraki güncellemeler

Kodda değişiklik yaptıktan sonra:

1. GitHub Desktop’ta değişen dosyalar sol tarafta görünür.
2. **Summary** alanına ne yaptığınızı kısaca yazın (örn. `README güncellendi`).
3. **Commit to main** tıklayın.
4. Üstten **Push origin** ile değişiklikleri GitHub’a gönderin.

---

## 4. README’deki clone linkini güncelleme

`README.md` dosyasında şu satır var:

```text
git clone https://github.com/KULLANICI_ADINIZ/yuzveses.git
```

**KULLANICI_ADINIZ** yerine kendi GitHub kullanıcı adınızı yazın (örn. `ahmetdev`).  
Repo adını `guvenli-kasa` yaptıysanız:

```text
git clone https://github.com/KULLANICI_ADINIZ/guvenli-kasa.git
```

şeklinde de güncelleyebilirsiniz.

---

İşlem bu kadar. Repo artık GitHub profilinde görünecektir.
