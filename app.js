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

const mineflayer = require('mineflayer');
const http = require('http');
const readline = require("readline");
const fs = require('fs');

process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.message.includes('ECONNRESET')) {
        return; 
    }
    console.error('[Hệ Thống] Phát hiện lỗi bất ngờ:', err);
});

const configPath = './afk.json';
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
        console.log("Không tìm thấy file afk.json. Đang tự động tạo cấu hình mặc định...");
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
        config = defaultConfig;
    } else {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (e) {
    console.log("Không thể đọc file afk.json hoặc file bị lỗi format!");
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
    fs.writeFileSync('./afk.json', JSON.stringify(config, null, 4), 'utf8');
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
const RESET = "\x1b[0m";
const BRIGHT_BLACK = "\x1b[90m";
const BRIGHT_RED = "\x1b[91m";
const BRIGHT_GREEN = "\x1b[92m";
const BRIGHT_YELLOW = "\x1b[93m";
const BRIGHT_BLUE = "\x1b[94m";
const BRIGHT_MAGENTA = "\x1b[95m";
const BRIGHT_CYAN = "\x1b[96m";
const BRIGHT_WHITE = "\x1b[97m";
const BANNER_TEXT = `    ${BRIGHT_CYAN}██╗  ██╗██╗███╗   ██╗ ██████╗████████╗ ██████╗  ██████╗ ██╗     
    ${BRIGHT_CYAN}██║ ██╔╝██║████╗  ██║██╔════╝╚══██╔══╝██╔═══██╗██╔═══██╗██║     
    ${BRIGHT_RED}█████╔╝ ██║██╔██╗ ██║██║  ███╗  ██║   ██║   ██║██║   ██║██║     
    ${BRIGHT_CYAN}██╔═██╗ ██║██║╚██╗██║██║   ██║  ██║   ██║   ██║██║   ██║██║     
    ${BRIGHT_GREEN}██║  ██╗██║██║ ╚████║╚██████╔╝  ██║   ╚██████╔╝╚██████╔╝████
    ${BRIGHT_YELLOW}╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝`;

function render_logo() {
    console.log(BANNER_TEXT);
    console.log(`\n${BRIGHT_BLUE}Created by:${RESET} \x1b[46m @dkhanh ${RESET} - ${BRIGHT_YELLOW}Tool auto buy skeleton${RESET}\n===============================\n`);
}
function Render() {
    console.clear();
    console.log('\n')
    render_logo()
    const accountKeys = Object.keys(config.Accounts);

    if (CurrentTab === "Home") {
        console.log(`\x1b[33mDanh sách tài khoản đã thêm (${accountKeys.length}):\x1b[0m`);
        accountKeys.forEach((acc, index) => {
            const isProxy = config.Accounts[acc].proxy && config.Accounts[acc].proxy.enable;
            console.log(`[${index + 1}]: \x1b[32m${acc} \x1b[0m ${isProxy ? '(Proxy)' : ''}`);
        });

        console.log(`\n\x1b[36mTài khoản đã chọn (${selectedAccounts.length}):\x1b[0m`);
        selectedAccounts.forEach((acc, index) => {
            const isProxy = config.Accounts[acc].proxy && config.Accounts[acc].proxy.enable;
            const owner = config.Accounts[acc].owner;

            let label = '';
            if (isProxy && owner) {
                label = `(Proxy | ${owner})`;
            } else if (isProxy && !owner) {
                label = `(Proxy)`;
            } else if (!isProxy && owner) {
                label = `(${owner})`;
            }

            console.log(`[${index + 1}]: \x1b[4m\x1b[32m${acc}\x1b[0m ${label ? `\x1b[33m${label}\x1b[0m` : ''}`);
        });

        console.log(`\n- \x1b[38;5;129mNhập \x1b[92m'Exit' \x1b[94mđể thoát`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Help' \x1b[94mđể xem lệnh`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Run' \x1b[94mđể chạy bot`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Acc <bot/index>' \x1b[94mđể bật/tắt bot`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Acc <bot1/index1 bot2...> <Tên_acc_chính>' \x1b[94mđể gán tài khoản chính`);
        console.log(`- \x1b[38;5;129mNhập \x1b[92m'Setting' \x1b[94mđể cài đặt proxy/account\x1b[0m`);

    }
    else if (CurrentTab === "Setting") {
        console.log(`\x1b[33mDanh sách tài khoản đã thêm (${accountKeys.length}):\x1b[0m`);
        accountKeys.forEach((acc, index) => {
            const isProxy = config.Accounts[acc].proxy && config.Accounts[acc].proxy.enable;
            console.log(`[${index + 1}]: \x1b[32m${acc} \x1b[0m ${isProxy ? '(Proxy)' : ''}`);
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
        console.log(`  + "Acc <danh sách bot/index> <Tên_acc_chính>"`);
        console.log(`  + "Exit"`);
        console.log(`  + "Proxy <username/index> <IP> <PORT>"`);
        console.log(`  + "Proxy <username/index> <IP:PORT>"`);
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
    let isverified = false;
    let inkingsmp = false;
    let retryMenuTimer = null;
    let reconnectTimer = null;
    let jumpInterval = null;
    let hasEnded = false; 
    let hasSentAuth = false;
    let gggg = false;
    let isActionPending = false;

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
        log(`Đang khởi tạo Bot QUA HTTP PROXY: ${proxyConfig.ip}:${proxyConfig.port}...`);

        botOptions.port = 25565;
        botOptions.connect = (client) => {
            const req = http.request({
                host: proxyConfig.ip,
                port: proxyConfig.port,
                method: 'CONNECT',
                path: `${host}:25565`
            });

            req.on('connect', (res, socket, head) => {
                socket.on('error', (err) => {
                    logErr(`Lỗi kết nối Socket Proxy: ${err.message}`);
                });

                if (res.statusCode !== 200) {
                    logErr(`Lỗi kết nối proxy. Mã lỗi: ${res.statusCode}`);
                    sendDiscordWebhook(
                        username,
                        "⛔ Proxy Từ Chối Kết Nối",
                        `Mã lỗi HTTP: **${res.statusCode}**\nIP Proxy: \`${maskIp(proxyConfig.ip)}\``
                    );
                    return;
                }
                log('\x1b[96m✔️ Đã vào được server / Proxy sống\x1b[0m');
                sendDiscordWebhook(username, "LOGGED", `**Proxy**: ${proxyConfig.ip}`)
                client.setSocket(socket);
                client.emit('connect');
            });

            req.on('error', (err) => {
                logErr('Proxy chết hoặc sai cấu hình:', err.message);
                sendDiscordWebhook(
                    username,
                    "❌ Proxy Bị Chết / Hỏng",
                    `Chi tiết lỗi: \`${err.message}\`\nIP Proxy: \`${maskIp(proxyConfig.ip)}\``
                );
            });

            req.end();
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
        if (jumpInterval) {
            clearInterval(jumpInterval);
            jumpInterval = null;
        }
    }

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
            delay = customDelay; 
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

    async function to_owner() {
        const owner = 'dkhanhhhh';
        if (owner && owner.trim() !== '') {
            log(`📍 Đang thực hiện yêu cầu dịch chuyển tới chủ sở hữu (Owner): ${owner}`);
            bot.chat(`/tpa ${owner}`);
        } else {
            log(`ℹ️ Bot không cấu hình tài khoản chính (Owner). Sẽ ở yên tại chỗ không dịch chuyển.`);
        }
    }
    function getReadableName(customNameString) {
        if (!customNameString) return '';
        
        if (!customNameString.startsWith('{') && !customNameString.startsWith('[')) {
            return customNameString;
        }

        try {
            const parsed = JSON.parse(customNameString);
            let result = parsed.text || '';

            if (parsed.extra && Array.isArray(parsed.extra)) {
            for (const component of parsed.extra) {
                if (typeof component === 'string') {
                result += component;
                } else if (component && component.text) {
                result += component.text;
                }
            }
            }
            return result;
        } catch (error) {
            return customNameString;
        }
    }
    function findItemAdvanced(bot, baseName, keyword) {
        const items = bot.inventory.items();
        const searchKeyword = keyword.toLowerCase().trim();

        for (const item of items) {
            if (item.name === baseName) {
                const rawName = item.customName || item.displayName;
                
                const readableName = getReadableName(rawName);
                
                const cleanName = readableName.replace(/§[0-9a-fk-or]/ig, '').toLowerCase();

                if (cleanName.includes(searchKeyword)) {
                    return item;
                }
            }
        }
        return null;
    }
    function performJump() {
        if (hasEnded || !bot) return;
        log('🦘 Đang thực hiện nhảy và đấm để chống AFK...');
        try {
            bot.swingArm('right');

            bot.setControlState('jump', true);
            setTimeout(() => {
                if (!hasEnded && bot) {
                    bot.setControlState('jump', false);
                }
            }, 800);
        } catch (err) {}
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

    // Hàm drop vật phẩm sử dụng gói tin mô phỏng thao tác ném thật
    async function dropItem(item) {
        if (!item) {
            log('[Lỗi] Vật phẩm không tồn tại hoặc bằng null.');
            return false;
        }

        try {
            // Trang bị vật phẩm vào tay chính
            await bot.equip(item, 'hand');
            
            // Chờ một khoảng thời gian nhỏ để thiết bị đồng bộ hoàn tất
            await new Promise(resolve => setTimeout(resolve, 350));

            if (bot._client) {
                // Sử dụng gói tin 'player_digging' chuẩn của Minecraft Protocol:
                // status = 3: Ném ra 1 vật phẩm đang cầm (phím Q)
                // status = 4: Ném toàn bộ stack vật phẩm đang cầm (phím Ctrl + Q)
                bot._client.write('player_digging', {
                    status: 4, 
                    location: { x: 0, y: 0, z: 0 },
                    face: 0
                });
                
                log(`[Thành công] Đã ném ${item.count}x ${item.name} bằng gói tin Vanilla.`);
                
                // Chờ hòm đồ đồng bộ từ phản hồi của máy chủ
                await new Promise(resolve => setTimeout(resolve, 350));
                return true;
            } else {
                throw new Error("Kết nối Client của bot chưa sẵn sàng.");
            }
        } catch (error) {
            console.error('[Lỗi] Có lỗi xảy ra trong quá trình ném vật phẩm:', error);
            return false;
        }
    }

    function scanPlayer(distance_block, player_name) {
        const searchName = player_name.toLowerCase().trim();

        for (const id in bot.entities) {
            const entity = bot.entities[id];

            if (entity.type === 'player' && entity.username) {
            if (entity.username.toLowerCase() === searchName) {
                const distance = bot.entity.position.distanceTo(entity.position);

                if (distance <= distance_block) {
                return entity;
                }
            }
            }
        }

        return null;
    }
    async function lookAtPlayer(player_entity) {
        if (!player_entity) {
            console.log('[Lỗi] Không có thực thể người chơi để nhìn.');
            return false;
        }

        try {
            const eyePosition = player_entity.position.offset(0, 1.62, 0);
            await bot.lookAt(eyePosition);
            return true;
        } catch (error) {
            console.error('[Lỗi] Không thể thực hiện nhìn mục tiêu:', error);
            return false;
        }
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
        const ggg = `/tpa ${'dkhanhhhh'}`
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

        } else if (title.length === 13) {
            const ske = window.slots.find(item => item && item.displayName.includes('Skeleton'));
            const target = ske ? ske.slot : 13;

            try {
                log(`👉 Đang click vào spawner skeleton ở ô [${target}]...`);
                await bot.clickWindow(target, 0, 0);
                inkingsmp = true;
            } catch (err) {
                if (err.message.includes("didn't respond to transaction")) {
                    inkingsmp = true;
                } else {
                    logErr(`Lỗi khi click ${title}:`, err.message);
                }
            }
        } else if (title.length === 27) {
            const ske = window.slots.find(item => item && item.displayName.includes('xác nhận'));
            const target = ske ? ske.slot : 23;

            try {
                log(`👉 Đang mua spawner skeleton ở ô [${target}]...`);
                if (getShardFromScoreboard()) {
                    for (let i = 1; i <= (getShardFromScoreboard() / 1500); i++) {
                        await bot.clickWindow(target, 0, 0);
                    }
                    setTimeout(() => {
                        bot.closeWindow(bot.currentWindow);
                    }, 3000);
                }
                inkingsmp = true;
            } catch (err) {
                if (err.message.includes("didn't respond to transaction")) {
                    inkingsmp = true;
                } else {
                    logErr(`Lỗi khi click ${title}:`, err.message);
                }
            }
        } else if (title.length === ggg.length) {
            const ske = window.slots.find(item => item && item.displayName.includes('đồng ý'));
            const target = ske ? ske.slot : 16;

            try {
                log(`👉 Đang đồng ý teleport ở ô [${target}]...`);
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
    });

    let autoLogicInterval = null; 
    function cleanTimers() {
        if (retryMenuTimer) clearTimeout(retryMenuTimer);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (jumpInterval) clearInterval(jumpInterval);
        if (autoLogicInterval) clearInterval(autoLogicInterval);
    }

    bot.on('spawn', () => {
        setTimeout(() => {
            performJump();
        }, 2000);

        if (!jumpInterval) {
            jumpInterval = setInterval(() => {
                performJump();
            }, 60000);
        }
        if ('dkhanhhhh') {
            if (!autoLogicInterval) {
                autoLogicInterval = setInterval(async () => {
                    if (hasEnded || !inkingsmp) return;
                    if (bot.currentWindow) return;
                    
                    if (isActionPending) return;

                    const targetItem = findItemAdvanced(bot, 'spawner', 'skeleton');

                    if (targetItem && getShardFromScoreboard() < 1500) {
                        const plr = scanPlayer(4, 'dkhanhhhh');
                        if (plr) {
                            isActionPending = true; 
                            try {
                                console.log(`[Hành động] Đã thấy chủ sở hữu ${plr.username} ở gần. Tiến hành quay mặt và ném...`);
                                await lookAtPlayer(plr);
                                await new Promise(resolve => setTimeout(resolve, 200)); 
                                await dropItem(targetItem);
                            } catch (err) {
                                console.error('[Lỗi] Trục trặc trong tiến trình ném vật phẩm:', err);
                            } finally {
                                isActionPending = false;
                            }
                        } else {
                            to_owner(); 
                        }
                    } else {
                        const currentShard = getShardFromScoreboard();
                        if (currentShard !== null && currentShard >= 1500) {
                            console.log(`[Hành động] Đủ 1500 Shard (Hiện có: ${currentShard}). Tiến hành mở menu /shard để mua...`);
                            bot.chat('/shard');
                        }
                    }
                }, 2000); 
            }
        } else {
            log(`${BRIGHT_RED} Chưa có Account Owner ${RESET}- ${BRIGHT_GREEN}Hãy Thêm Account owner trong phần Setting`)
        }
        

        setTimeout(() => {
            if (hasEnded) return;

            if (find_game_menu() && !gggg) {
                log('📌 Phát hiện bot đang ở sảnh HUB.');
                isverified = true;
                selectServer();
            }
            else if (!find_game_menu() && isverified) {
                inkingsmp = true;
                setTimeout(() => {
                    bot.chat("/tpatogglegui");
                }, 1500);
            } else {
                bot.chat('/dk ' + pass);
            }
        }, 5000);
        log('\x1b[93mBot đã vào game thành công!\x1b[0m');
    });

    bot.on('kicked', (reason) => {
        const cleanReason = resolveText(reason);
        log('Bị kick khỏi server:', cleanReason);
        
        let isGhostSession = false;
        const normalizedReason = cleanReason.toLowerCase();
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

        if (plainText.includes('ký với lệnh')) {
            bot.chat('/dk ' + pass);
        }
        if (plainText.includes("1.5K để mua vật phẩm này")) {
            log(`khong mua duoc nua`);
            bot.closeWindow(bot.currentWindow);
        }
        if (plainText.includes('không giới hạn shard nhận được tại afk')) {
            gggg = true;
        }
        if (plainText.includes('Đã bật menu xác nhận tpa')) {
            bot.chat('/tpatogglegui');
            log(`⚡ Đã gửi lệnh /tpatogglegui để mở menu xác nhận TPA`);
        }
        if (plainText.includes('hãy đăng kí')) {
            bot.chat('/dk ' + pass);
        }
        if (plainText.includes('Đăng nhập thành công')) {
            isverified = true;
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
       
        if (plainText.includes("có tài khoảng cùng ip của ban")) {
            logErr("Đã có tài khoản nào đó chạy cùng IP \x1b[33m(Vui lòng thêm hoặc đổi Proxy khác)\x1b[0m")
            sendDiscordWebhook(username, "Trùng IP", "Đã có tài khoản nào đó chạy cùng IP (Vui lòng thêm hoặc đổi Proxy khác)")
        }
        if (plainText.includes('chưa liên kết')) {
            sendDiscordWebhook(username, "Chưa liên kết discord", "Bị limit Shard")
        }
    });
}

startBot("ThinhNL", {
    "pass": "kingmc123@",
    "proxy": {
        "enable": false,
        "ip": "127.0.0.1",
        "port": 9097
    }
});
