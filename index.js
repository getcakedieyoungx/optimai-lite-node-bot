/**
 * Optimai Lite Node Bot
 * Bu bot Optimai Lite Node'un online durumunu kontrol eder
 * ve daily/weekly claim işlemlerini otomatik yapar.
 */

const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

// Proxy konfigürasyonu
let proxyList = [];
try {
    if (fs.existsSync('./proxy.txt')) {
        proxyList = fs.readFileSync('./proxy.txt', 'utf8').split('\n').filter(Boolean);
    }
} catch (error) {
    console.log('Proxy dosyası bulunamadı, proxy olmadan devam ediliyor...');
}

// Hesap konfigürasyonu
let accounts = [];
try {
    if (fs.existsSync('./accounts.json')) {
        accounts = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'));
    } else {
        accounts = [{
            refreshToken: process.env.REFRESH_TOKEN || '',
            nodeToken: []
        }];
    }
} catch (error) {
    console.log('Hesap dosyası bulunamadı, .env dosyasından devam ediliyor...');
    accounts = [{
        refreshToken: process.env.REFRESH_TOKEN || '',
        nodeToken: []
    }];
}

// API ve Kimlik Bilgileri
const API_URL = process.env.API_URL || 'https://api.optimai.network';

// Son bakiye bilgileri
const balances = new Map();

// İşlem logları
const logs = new Map();
const MAX_LOGS = 10;

function getProxy() {
    if (proxyList.length === 0) return null;
    return proxyList[Math.floor(Math.random() * proxyList.length)];
}

function createAxiosInstance(refreshToken, proxy = null) {
    const config = {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
        }
    };

    if (proxy) {
        config.proxy = {
            host: proxy.split('@')[1].split(':')[0],
            port: parseInt(proxy.split('@')[1].split(':')[1]),
            auth: {
                username: proxy.split('@')[0].split('//')[1].split(':')[0],
                password: proxy.split('@')[0].split(':')[1]
            }
        };
    }

    return axios.create(config);
}

// Ekranı temizleme fonksiyonu
function clearScreen() {
    process.stdout.write('\x1Bc');
}

// Log ekleme fonksiyonu
function addLog(accountIndex, message) {
    const timestamp = new Date().toISOString().substring(11, 19);
    if (!logs.has(accountIndex)) {
        logs.set(accountIndex, []);
    }
    const accountLogs = logs.get(accountIndex);
    accountLogs.unshift(`[${timestamp}] ${message}`);
    if (accountLogs.length > MAX_LOGS) {
        accountLogs.pop();
    }
    printInfo();
}

// ASCII Art Banner
const banner = `
 ██████╗ ███████╗████████╗ ██████╗ █████╗ ██╗  ██╗███████╗       
██╔════╝ ██╔════╝╚══██╔══╝██╔════╝██╔══██╗██║ ██╔╝██╔════╝       
██║  ███╗█████╗     ██║   ██║     ███████║█████╔╝ █████╗         
██║   ██║██╔══╝     ██║   ██║     ██╔══██║██╔═██╗ ██╔══╝         
╚██████╔╝███████╗   ██║   ╚██████╗██║  ██║██║  ██╗███████╗       
 ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝       
██████╗ ██╗███████╗██╗   ██╗ ██████╗ ██╗   ██╗███╗   ██╗ ██████╗ 
██╔══██╗██║██╔════╝╚██╗ ██╔╝██╔═══██╗██║   ██║████╗  ██║██╔════╝ 
██║  ██║██║█████╗   ╚████╔╝ ██║   ██║██║   ██║██╔██╗ ██║██║  ███╗
██║  ██║██║██╔══╝    ╚██╔╝  ██║   ██║██║   ██║██║╚██╗██║██║   ██║
██████╔╝██║███████╗   ██║   ╚██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝
╚═════╝ ╚═╝╚══════╝   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ 
       GETCAKE DIEYOUNGX - t.me/getcakedieyoungx
`;

// Bilgi mesajı yazdırma
function printInfo() {
    clearScreen();
    console.log(banner);
    
    accounts.forEach((account, index) => {
        console.log(`\nHesap ${index + 1}:`);
        console.log(`Bakiye: ${balances.get(index) || 0}`);
        console.log('Son İşlemler:');
        const accountLogs = logs.get(index) || [];
        accountLogs.forEach(log => console.log(log));
        console.log('===============================');
    });
}

// Token yenileme fonksiyonu
async function refreshAccessToken(accountIndex) {
    const account = accounts[accountIndex];
    try {
        addLog(accountIndex, 'Token yenileniyor...');
        
        const proxy = getProxy();
        const axiosInstance = createAxiosInstance(account.refreshToken, proxy);
        
        const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken: account.refreshToken
        });
        
        if (response.data && response.data.accessToken) {
            account.nodeToken = response.data.accessToken;
            if (response.data.refreshToken) {
                account.refreshToken = response.data.refreshToken;
                // Hesap bilgilerini kaydet
                fs.writeFileSync('./accounts.json', JSON.stringify(accounts, null, 2));
            }
            addLog(accountIndex, 'Token başarıyla yenilendi!');
            return true;
        }
        
        addLog(accountIndex, 'Token yenileme başarısız: Yanıt beklenen formatta değil.');
        return false;
    } catch (error) {
        addLog(accountIndex, `Token yenileme hatası: ${error.message}`);
        return false;
    }
}

// Ping gönderme fonksiyonu
async function pingNode(accountIndex) {
    const account = accounts[accountIndex];
    try {
        const proxy = getProxy();
        const axiosInstance = createAxiosInstance(account.nodeToken, proxy);
        
        addLog(accountIndex, 'Node\'a ping gönderiliyor...');
        
        const statusResponse = await axiosInstance.get('/node-avail/reward-schedule');
        addLog(accountIndex, `Ping başarılı! Sonraki ödül: ${new Date(statusResponse.data.next_execution).toLocaleTimeString()}`);
        
        const ipResponse = await axiosInstance.get('/ips?limit=20&order=asc');
        if (ipResponse.data.items && ipResponse.data.items.length > 0) {
            const ipInfo = ipResponse.data.items[0];
            addLog(accountIndex, `IP: ${ipInfo.ip_address}, Durum: ${ipInfo.status}, Uptime: ${ipInfo.uptime}`);
        }
        
        await checkBalance(accountIndex);
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await refreshAccessToken(accountIndex);
            return await pingNode(accountIndex);
        }
        addLog(accountIndex, `Ping hatası: ${error.message}`);
        return false;
    }
}

// Daily check-in fonksiyonu
async function performDailyCheckin(accountIndex) {
    const account = accounts[accountIndex];
    try {
        const proxy = getProxy();
        const axiosInstance = createAxiosInstance(account.nodeToken, proxy);
        
        addLog(accountIndex, 'Daily check-in yapılıyor...');
        
        const response = await axiosInstance.post('/daily-tasks/check-in');
        
        if (response.data.already_checked_in) {
            addLog(accountIndex, 'Bugün zaten check-in yapılmış.');
        } else {
            addLog(accountIndex, 'Daily check-in başarılı!');
        }
        
        await checkBalance(accountIndex);
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await refreshAccessToken(accountIndex);
            return await performDailyCheckin(accountIndex);
        }
        if (error.response && error.response.status === 400) {
            addLog(accountIndex, 'Daily check-in yapılamadı: Bugün için zaten yapılmış olabilir.');
        } else {
            addLog(accountIndex, `Daily check-in hatası: ${error.message}`);
        }
        return false;
    }
}

// Weekly ödül fonksiyonu
async function claimWeeklyReward(accountIndex) {
    const account = accounts[accountIndex];
    try {
        const proxy = getProxy();
        const axiosInstance = createAxiosInstance(account.nodeToken, proxy);
        
        addLog(accountIndex, 'Weekly ödül kontrol ediliyor...');
        
        const checkResponse = await axiosInstance.get('/daily-tasks/has-claimed-weekly-reward');
        
        if (checkResponse.data.has_claimed) {
            addLog(accountIndex, 'Bu hafta için ödül zaten alınmış.');
            return true;
        }
        
        addLog(accountIndex, 'Weekly ödül talep ediliyor...');
        await axiosInstance.post('/daily-tasks/claim-weekly-reward');
        
        addLog(accountIndex, 'Weekly ödül başarıyla alındı!');
        await checkBalance(accountIndex);
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await refreshAccessToken(accountIndex);
            return await claimWeeklyReward(accountIndex);
        }
        if (error.response && error.response.status === 400) {
            addLog(accountIndex, 'Weekly ödül alınamadı: Henüz yeterli aktivite olmayabilir veya zaten alınmış.');
        } else {
            addLog(accountIndex, `Weekly ödül alma hatası: ${error.message}`);
        }
        return false;
    }
}

// Bakiye kontrol fonksiyonu
async function checkBalance(accountIndex) {
    const account = accounts[accountIndex];
    try {
        const proxy = getProxy();
        const axiosInstance = createAxiosInstance(account.nodeToken, proxy);
        
        const response = await axiosInstance.get('/users/balance');
        balances.set(accountIndex, response.data.balance);
        printInfo();
        return response.data.balance;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await refreshAccessToken(accountIndex);
            return await checkBalance(accountIndex);
        }
        addLog(accountIndex, `Bakiye kontrolü hatası: ${error.message}`);
        return null;
    }
}

// Rastgele saat ve dakika oluşturma fonksiyonu
function getRandomTime() {
    const hour = Math.floor(Math.random() * 24); // 0-23 arası
    const minute = Math.floor(Math.random() * 60); // 0-59 arası
    return { hour, minute };
}

// Rastgele gün oluşturma fonksiyonu (0-6 arası, 0=Pazar)
function getRandomDay() {
    return Math.floor(Math.random() * 7);
}

// Bot başlangıcı
(async () => {
    clearScreen();
    console.log(banner);
    console.log('OPTİMAİ LİTE NODE BOT BAŞLATILIYOR...\n');
    
    if (accounts.length === 0) {
        console.error('HATA: Hesap bilgileri bulunamadı. Lütfen accounts.json dosyanızı kontrol edin.');
        process.exit(1);
    }
    
    // Her hesap için başlangıç işlemleri
    for (let i = 0; i < accounts.length; i++) {
        addLog(i, 'Bot başlatılıyor...');
        await refreshAccessToken(i);
        await pingNode(i);
        await performDailyCheckin(i);
        await claimWeeklyReward(i);
    }
    
    // Zamanlanmış görevler
    const pingSchedule = process.env.PING_CRON || '*/5 * * * *';
    cron.schedule(pingSchedule, async () => {
        for (let i = 0; i < accounts.length; i++) {
            await pingNode(i);
        }
    });
    
    // Her hesap için farklı rastgele zamanlarda daily claim
    for (let i = 0; i < accounts.length; i++) {
        const dailyTime = getRandomTime();
        const dailySchedule = process.env.DAILY_CLAIM_CRON || `${dailyTime.minute} ${dailyTime.hour} * * *`;
        cron.schedule(dailySchedule, async () => {
            await performDailyCheckin(i);
        });
        addLog(i, `Daily claim zamanı ayarlandı: ${dailyTime.hour}:${dailyTime.minute.toString().padStart(2, '0')}`);
    }
    
    // Her hesap için farklı rastgele günlerde weekly claim
    for (let i = 0; i < accounts.length; i++) {
        const weeklyTime = getRandomTime();
        const weeklyDay = getRandomDay();
        const weeklySchedule = process.env.WEEKLY_CLAIM_CRON || `${weeklyTime.minute} ${weeklyTime.hour} * * ${weeklyDay}`;
        cron.schedule(weeklySchedule, async () => {
            await claimWeeklyReward(i);
        });
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        addLog(i, `Weekly claim zamanı ayarlandı: ${days[weeklyDay]} ${weeklyTime.hour}:${weeklyTime.minute.toString().padStart(2, '0')}`);
    }
    
    // Her 12 saatte bir token yenileme
    cron.schedule('0 */12 * * *', async () => {
        for (let i = 0; i < accounts.length; i++) {
            await refreshAccessToken(i);
        }
    });
})();