const moment = require("moment-timezone");
const stringSimilarity = require('string-similarity');

module.exports.config = {
    name: "menu",
    version: "1.0.0",
    role: 0,
    author: "July",
    description: "Xem danh sách lệnh và info",
    category: "Tiện ích",
    usage: "[tên lệnh/all]",
    cooldowns: 2,
    dependencies: {
        "string-similarity": "",
        "moment-timezone": ""
    }
};

function getDayVN() {
    const days = {
        'Sunday': 'Chủ Nhật',
        'Monday': 'Thứ Hai',
        'Tuesday': 'Thứ Ba',
        'Wednesday': 'Thứ Tư',
        'Thursday': 'Thứ Năm',
        'Friday': 'Thứ Sáu',
        'Saturday': 'Thứ Bảy'
    };
    const thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    return days[thu] || thu;
}

function TextPr(permission) {
    return permission == 0 ? "Thành Viên" : permission == 1 ? "Support Bot" : permission == 2 ? "Admin Bot" : "Toàn Quyền";
}

function sortByLengthDesc(arr, key) {
    return arr.sort((a, b) => b[key].length - a[key].length);
}

module.exports.run = async function({ api, event, args }) {
    const { threadId, type, data } = event;
    const senderId = data.uidFrom;
    const cmds = global.client.commands;
    // Fix: safely get threadData
    const TIDdata = (global.data && global.data.threadData && global.data.threadData.get)
        ? global.data.threadData.get(threadId) || {}
        : {};
    const config = global.config;
    const admin = Array.isArray(config.admin_bot) ? config.admin_bot : [];
    const NameBot = config.name_bot;
    const version = config.version;
    const prefix = (typeof TIDdata.PREFIX === "string" && TIDdata.PREFIX.length > 0)
        ? TIDdata.PREFIX
        : config.PREFIX;
    const argType = args[0] ? args[0].toLowerCase() : "";
    let msg = "";

    // Show all commands
    if (argType === "all") {
        const commandsList = Array.from(cmds.values()).map((cmd, idx) =>
            `${idx + 1}. ${cmd.config.name}\n📝 Mô tả: ${cmd.config.description}\n`
        ).join('\n');
        return api.sendMessage(commandsList, threadId, type);
    }

    // Show specific command info or fuzzy search
    if (argType) {
        let command = Array.from(cmds.values()).find(cmd => cmd.config.name.toLowerCase() === argType);
        if (!command) {
            const commandNames = Array.from(cmds.keys());
            const checker = stringSimilarity.findBestMatch(argType, commandNames);
            if (checker.bestMatch.rating >= 0.5) {
                command = cmds.get(checker.bestMatch.target);
                msg = `⚠️ Không tìm thấy lệnh '${argType}' trong hệ thống.\n📌 Lệnh gần giống được tìm thấy '${checker.bestMatch.target}'\n`;
            } else {
                msg = `⚠️ Không tìm thấy lệnh '${argType}' trong hệ thống.`;
                return api.sendMessage(msg, threadId, type);
            }
        }
        const cmd = command.config;
        msg += `[ HƯỚNG DẪN SỬ DỤNG ]\n\n📜 Tên lệnh: ${cmd.name}\n🕹️ Phiên bản: ${cmd.version}\n🔑 Quyền Hạn: ${TextPr(cmd.role)}\n👥 Tác giả: ${cmd.author}\n📝 Mô Tả: ${cmd.description}\n🏘️ Nhóm: ${cmd.category}\n📌 Cách Dùng: ${cmd.usage}\n⏳ Cooldowns: ${cmd.cooldowns}s`;
        return api.sendMessage(msg, threadId, type);
    }

    // Show grouped commands by category
    const commandsArray = Array.from(cmds.values()).map(cmd => cmd.config);
    const grouped = [];
    commandsArray.forEach(cmd => {
        const { category, name } = cmd;
        let group = grouped.find(g => g.cmdCategory === category);
        if (!group) {
            grouped.push({ cmdCategory: category, nameModule: [name] });
        } else {
            group.nameModule.push(name);
        }
    });
    sortByLengthDesc(grouped, "nameModule");
    grouped.forEach(cmd => {
        // Fix: check cmd.cmdCategory before using toUpperCase
        if (
            cmd.cmdCategory &&
            ['NO PREFIX'].includes(cmd.cmdCategory.toUpperCase()) &&
            !admin.includes(senderId)
        ) return;
        msg += `[ ${cmd.cmdCategory ? cmd.cmdCategory.toUpperCase() : "KHÁC"} ]\n📝 Tổng lệnh: ${cmd.nameModule.length} lệnh\n${cmd.nameModule.join(", ")}\n\n`;
    });
    // Show current prefix (system and group)
    //const { getGroupPrefix } = require("../../modules/commands/setprefix");
    //const currentPrefix = getGroupPrefix(threadId);
    const currentPrefix = global.config.prefix;
    msg += `📝 Tổng số lệnh: ${cmds.size} lệnh\n👤 Tổng số admin bot: ${admin.length}\n👾 Tên Bot: ${NameBot}\n⏰ Hôm nay là: ${getDayVN()}\n⏱️ Thời gian: ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY")}\n${currentPrefix}help + tên lệnh để xem chi tiết\n${currentPrefix}help + all để xem tất cả lệnh`;
    return api.sendMessage(msg, threadId, type);
}