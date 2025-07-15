const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports.config = {
    name: "cmd",
    version: "1.0.0",
    role: 2,
    author: "NLam182",
    description: "Quản lý và kiểm soát các module lệnh của bot.",
    category: "Hệ thống",
    usage: ".cmd <load|unload|loadall|unloadall|list|info> [tên lệnh]",
    cooldowns: 2
};

async function loadModule(api, event, moduleName) {
    const { threadId, type } = event;
    try {
        const commandPath = path.join(__dirname, `${moduleName}.js`);
        if (!fs.existsSync(commandPath)) {
            return api.sendMessage(`Không tìm thấy module '${moduleName}'.`, threadId, type);
        }
        delete require.cache[require.resolve(commandPath)];
        const command = require(commandPath);
        if (!command.config || !command.config.name || typeof command.run !== "function") {
            return api.sendMessage(`Module '${moduleName}' không đúng định dạng.`, threadId, type);
        }
        const dependencies = command.config.dependencies || {};
        for (const [pkgName, version] of Object.entries(dependencies)) {
            try {
                require.resolve(pkgName);
            } catch {
                api.sendMessage(`Đang cài package '${pkgName}' cho lệnh '${command.config.name}'...`, threadId, type);
                execSync(`npm install ${pkgName}@${version || "latest"} --no-save`, { stdio: "inherit" });
            }
        }
        global.client.commands.set(command.config.name, command);
        if (command.onLoad) {
            await command.onLoad({ api });
        }
        return api.sendMessage(`✅ Đã tải thành công lệnh '${command.config.name}'.`, threadId, type);
    } catch (error) {
        console.error(`Lỗi khi tải lệnh ${moduleName}:`, error);
        return api.sendMessage(`Đã xảy ra lỗi khi tải lệnh '${moduleName}':\n${error.message}`, threadId, type);
    }
}

async function unloadModule(api, event, moduleName) {
    const { threadId, type } = event;
    if (!global.client.commands.has(moduleName)) {
        return api.sendMessage(`Lệnh '${moduleName}' chưa được tải.`, threadId, type);
    }
    global.client.commands.delete(moduleName);
    const commandPath = path.join(__dirname, `${moduleName}.js`);
    if (require.cache[require.resolve(commandPath)]) {
        delete require.cache[require.resolve(commandPath)];
    }
    return api.sendMessage(`✅ Đã gỡ thành công lệnh '${moduleName}'.`, threadId, type);
}

module.exports.run = async function({ api, event, args }) {
    const { threadId, type } = event;

    if (!global.users.admin.includes(event.data.uidFrom)) {
        return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadId, type);
    }

    const action = args[0]?.toLowerCase();
    const moduleName = args[1];

    switch (action) {
        case "load":
            if (!moduleName) return api.sendMessage("Vui lòng nhập tên lệnh cần tải.", threadId, type);
            await loadModule(api, event, moduleName);
            break;

        case "unload":
            if (!moduleName) return api.sendMessage("Vui lòng nhập tên lệnh cần gỡ.", threadId, type);
            await unloadModule(api, event, moduleName);
            break;

        case "loadall":
            try {
                await api.sendMessage("Bắt đầu quá trình tải lại tất cả các lệnh...", threadId, type);
                Object.keys(require.cache).forEach(key => {
                    if (key.startsWith(path.join(__dirname))) {
                        delete require.cache[key];
                    }
                });
                global.client.commands.clear();
                const loaderCommand = require("../../core/loader/loaderCommand");
                await loaderCommand();
                await api.sendMessage(`✅ Đã tải lại thành công ${global.client.commands.size} lệnh.`, threadId, type);
            } catch (error) {
                console.error("Lỗi khi tải lại lệnh:", error);
                await api.sendMessage(`Đã xảy ra lỗi trong quá trình tải lại:\n${error.message}`, threadId, type);
            }
            break;

        case "unloadall":
            try {
                const commandDir = path.join(__dirname);
                const allCommandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));
                let unloadedCount = 0;
                for (const file of allCommandFiles) {
                    if (file === "cmd.js") continue;
                    const moduleNameToUnload = path.basename(file, ".js");
                    if (global.client.commands.has(moduleNameToUnload)) {
                        global.client.commands.delete(moduleNameToUnload);
                        delete require.cache[require.resolve(path.join(commandDir, file))];
                        unloadedCount++;
                    }
                }
                await api.sendMessage(`✅ Đã gỡ thành công ${unloadedCount} lệnh.`, threadId, type);
            } catch (error) {
                console.error("Lỗi khi gỡ tất cả lệnh:", error);
                await api.sendMessage(`Đã xảy ra lỗi khi gỡ lệnh:\n${error.message}`, threadId, type);
            }
            break;

        case "list":
            const commandNames = Array.from(global.client.commands.keys());
            api.sendMessage(`Hiện tại có ${commandNames.length} lệnh đang hoạt động:\n\n${commandNames.join(", ")}`, threadId, type);
            break;

        case "info":
            if (!moduleName) return api.sendMessage("Vui lòng nhập tên lệnh cần xem thông tin.", threadId, type);
            const command = global.client.commands.get(moduleName);
            if (!command) return api.sendMessage(`Lệnh '${moduleName}' không tồn tại hoặc chưa được tải.`, threadId, type);
            
            const { name, version, role, author, description, category, usage, cooldowns, dependencies } = command.config;
            const roleText = role === 0 ? "Người dùng" : role === 1 ? "Support" : "Admin";
            const depsText = dependencies ? Object.keys(dependencies).join(", ") : "Không có";

            const infoMsg = `🔎 Thông tin lệnh: ${name.toUpperCase()}\n\n` +
                          `- Mô tả: ${description}\n` +
                          `- Tác giả: ${author}\n` +
                          `- Phiên bản: ${version}\n` +
                          `- Quyền hạn: ${roleText}\n` +
                          `- Cách dùng: ${usage}\n` +
                          `- Dependencies: ${depsText}`;
            api.sendMessage(infoMsg, threadId, type);
            break;

        default:
            api.sendMessage(
                "Quản lý module bot\n\n" +
                "cmd load <lệnh> - Tải một lệnh\n" +
                "cmd unload <lệnh> - Gỡ một lệnh\n" +
                "cmd loadall - Tải lại tất cả lệnh\n" +
                "cmd unloadall - Gỡ tất cả lệnh\n" +
                "cmd list - Liệt kê các lệnh\n" +
                "cmd info <lệnh> - Xem thông tin lệnh",
                threadId, type
            );
            break;
    }
};
