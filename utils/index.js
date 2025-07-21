const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const YAML = require("yaml");

function saveBase64Image(base64String, outputPath) {
    const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    let base64Data = base64String;

    if (matches) {
        base64Data = matches[2];
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, Buffer.from(base64Data, "base64"));
}

const getJsonData = (filePath, defaultData = {}) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    if (!fs.existsSync(filePath)) {
        logger.log(`File ${path.basename(filePath)} chưa tồn tại, tạo mới.`, "warn");
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
        return defaultData;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
};
function convertTimestamp(timestamp) {
    const date = new Date(Number(timestamp));
    return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}
// CONFIG
function updateConfigArray(key, newArray) {
    const configPath = path.join(__dirname, "..", "config.yml");
    const lines = fs.readFileSync(configPath, "utf8").split("\n");

    const updatedLines = [];
    let insideTargetArray = false;
    let indent = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!insideTargetArray) {
            const trimmed = line.trim();
            if (trimmed.startsWith(`${key}:`)) {
                insideTargetArray = true;
                indent = line.match(/^(\s*)/)[0];
                updatedLines.push(`${indent}${key}:`);
                newArray.forEach(item => {
                    updatedLines.push(`${indent}  - "${item}"`);
                });

                let j = i + 1;
                while (j < lines.length && lines[j].trim().startsWith("-")) {
                    j++;
                }

                i = j - 1;
            } else {
                updatedLines.push(line);
            }
        } else {
            updatedLines.push(line);
        }
    }

    fs.writeFileSync(configPath, updatedLines.join("\n"), "utf8");
}

function updateConfigValue(key, newValue) {
    const configPath = path.join(__dirname, "..", "config.yml");
    const lines = fs.readFileSync(configPath, "utf8").split("\n");

    const updatedLines = lines.map((line) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("#") || !trimmedLine.includes(":")) return line;

        const [k, ...rest] = trimmedLine.split(":");
        if (k.trim() === key) {
            const indent = line.match(/^(\s*)/)[0];
            const commentMatch = line.match(/(#.*)/);
            const comment = commentMatch ? " " + commentMatch[1] : "";
            return `${indent}${k.trim()}: ${newValue}${comment}`;
        }

        return line;
    });

    fs.writeFileSync(configPath, updatedLines.join("\n"), "utf8");
}

function reloadConfig() {
    try {
        const configPath = path.join(__dirname, "..", "config.yml");
        const fileContent = fs.readFileSync(configPath, "utf8");
        const config = YAML.parse(fileContent);

        global.config = config;
        global.users = {
            admin: Array.isArray(config.admin_bot) ? config.admin_bot.map(String) : [],
            support: Array.isArray(config.support_bot) ? config.support_bot.map(String) : []
        };
    } catch (error) {
        logger.log(`Lỗi khi đọc config.yml: ${error.message || error}`, "error");
        process.exit(1);
    }
}
// MESSAGE CACHE
const messageCachePath = path.join(__dirname, "..", "data", "message_cache.json");

fs.mkdirSync(path.dirname(messageCachePath), { recursive: true });
if (!fs.existsSync(messageCachePath)) {
    fs.writeFileSync(messageCachePath, "{}", "utf-8");
}

function cleanOldMessages() {
    let messageCache = readMessageJson();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    Object.keys(messageCache).forEach((key) => {
        if (messageCache[key].timestamp < oneDayAgo) {
            delete messageCache[key];
        }
    });
}

function readMessageJson() {
    try {
        const data = fs.readFileSync(messageCachePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        logger.log("Lỗi khi đọc file message.json: " + error.message, "error");
        return {};
    }
}

function writeMessageJson(data) {
    try {
        fs.writeFileSync(messageCachePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        logger.log("Lỗi khi ghi file message.json: " + error.message, "error");
    }
}

function getMessageCache() {
    let messageCache = readMessageJson();
    return messageCache;
}

function getMessageCacheByMsgId(msgId) {
    let messageCache = readMessageJson();
    return Object.values(messageCache).find((message) => message.msgId === msgId);
}

function updateMessageCache(data) {
    let messageCache = readMessageJson();
    try {
        const timestamp = new Date().toISOString();
        const filtered = {
            timestamp: data.data.ts,
            timestampString: timestamp,
            msgId: data.data.msgId,
            cliMsgId: data.data.cliMsgId,
            msgType: data.data.msgType,
            uidFrom: data.data.uidFrom,
            idTo: data.data.idTo,
            dName: data.data.dName,
            content: data.data.content,
            threadId: data.threadId,
            type: data.type
        };
        messageCache[data.data.cliMsgId] = filtered;
        writeMessageJson(messageCache);
    } catch (e) {
        logger.log("Lỗi khi update messageCache: " + e.message, "error");
    }
}

module.exports = {
    updateConfigArray,
    updateConfigValue,
    reloadConfig,
    saveBase64Image,
    getJsonData,
    updateMessageCache,
    getMessageCache,
    getMessageCacheByMsgId,
    cleanOldMessages,
    convertTimestamp
};