# Optimai Lite Node Bot

Bu bot, Optimai Lite Node'unuzu otomatik olarak yönetmenizi sağlar. Node'unuzun sürekli çalışır durumda kalmasını ve günlük/haftalık ödüllerinizi otomatik olarak toplamasını sağlar.

## Özellikler

- 🔄 Otomatik ping (varsayılan: her 5 dakikada bir)
- 📅 Otomatik günlük check-in
- 🎁 Otomatik haftalık ödül toplama
- 💰 Bakiye takibi
- 📊 Detaylı işlem logları
- 🔀 Çoklu hesap desteği
- 🌐 Proxy desteği
- 🎲 Doğal davranış için rastgele zamanlama
- 🔐 Güvenli token yönetimi

## Kurulum

1. Repoyu klonlayın:
```
git clone https://github.com/getcakedieyoungx/optimai-lite-node-bot.git
cd optimai-lite-node-bot
```

2. Gerekli paketleri yükleyin:
```
npm install
```

3. Konfigürasyon:
   - `.env.example` dosyasını `.env` olarak kopyalayın
   - `.env` dosyasını düzenleyerek gerekli bilgileri girin
   - (Opsiyonel) Çoklu hesap için `accounts.json` oluşturun
   - (Opsiyonel) Proxy kullanımı için `proxy.txt` oluşturun

## Kullanım

Botu başlatmak için:
```
npm start
```

## Özelleştirme

### Çoklu Hesap

Birden fazla hesabı yönetmek için `accounts.json` dosyası oluşturun:

```json
[
  {
    "refreshToken": "hesap1_refresh_token",
    "nodeToken": []
  },
  {
    "refreshToken": "hesap2_refresh_token",
    "nodeToken": []
  }
]
```

### Proxy Kullanımı

Proxy kullanmak için `proxy.txt` dosyası oluşturun:

```
http://kullanici:sifre@ip:port
http://kullanici:sifre@ip:port
```

### Zamanlama

Bot, her hesap için farklı rastgele zamanlarda işlem yapar:
- Ping: Her 5 dakikada bir
- Daily Claim: Her hesap için günde bir kez, rastgele bir saatte
- Weekly Claim: Her hesap için haftada bir kez, rastgele bir gün ve saatte

İsterseniz `.env` dosyasından CRON ayarlarını özelleştirebilirsiniz.

## İletişim ve Destek

Telegram: [t.me/getcakedieyoungx](https://t.me/getcakedieyoungx)

## Bağış Adresleri

EVM: 0x0000000000000000000000000000000000000000
Solana: 0x0000000000000000000000000000000000000000