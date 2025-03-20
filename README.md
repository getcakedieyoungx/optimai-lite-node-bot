# Optimai Lite Node Bot

Optimai Lite Node için otomatik ping ve ödül toplama botu. Bu bot, node'unuzu otomatik olarak yönetir ve ödüllerinizi toplar.

## Özellikler

- 🔄 Otomatik ping gönderme
- 📅 Günlük check-in
- 🎁 Haftalık ödül toplama
- 💰 Bakiye takibi
- 🔑 Otomatik token yenileme
- 👥 Çoklu hesap desteği
- 🌐 Proxy desteği
- 📊 Detaylı log sistemi

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/optimai-lite-node-bot.git
cd optimai-lite-node-bot
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:
```bash
cp .env.example .env
```

4. Çoklu hesap için `accounts.json` dosyası oluşturun (opsiyonel):
```json
[
  {
    "refreshToken": "your_refresh_token_1"
  },
  {
    "refreshToken": "your_refresh_token_2"
  }
]
```

5. Proxy kullanmak için `proxy.txt` dosyası oluşturun (opsiyonel):
```
http://username:password@host:port
```

6. Botu başlatın:
```bash
npm start
```

## Özelleştirme

Bot davranışını `.env` dosyasındaki değişkenlerle özelleştirebilirsiniz:

- `PING_CRON`: Ping gönderme aralığı (varsayılan: her 5 dakikada bir)
- `DAILY_CLAIM_CRON`: Günlük ödül alma zamanı (varsayılan: her gün saat 12:00)
- `WEEKLY_CLAIM_CRON`: Haftalık ödül alma zamanı (varsayılan: her Pazartesi saat 12:00)

## İletişim ve Destek

Telegram: [t.me/getcakedieyoungx](https://t.me/getcakedieyoungx)

## Bağış Adresleri

- EVM: 0x0000000000000000000000000000000000000000
- Solana: 0x0000000000000000000000000000000000000000