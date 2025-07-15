const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const login = require("./core/login");
const logger = require("./utils/logger");
const listener = require("./core/listen");
const loaderCommand = require("./core/loader/loaderCommand");
const loaderEvent = require("./core/loader/loaderEvent");

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map()
});

global.users = {
  admin: [],
  support: []
};

global.config = new Object();

(async () => {

try {
    const configPath = path.join(__dirname, "config.yml");
    const fileContent = fs.readFileSync(configPath, "utf8");
    const config = YAML.parse(fileContent);

    global.config = config;
    global.users = {
      admin: Array.isArray(config.admin_bot) ? config.admin_bot.map(String) : [],
      support: Array.isArray(config.support_bot) ? config.support_bot.map(String) : []
    };
    logger.log("Đã tải cấu hình từ config.yml thành công", "info");
} catch (error) {
    logger.log(`Lỗi khi đọc config.yml: ${error.message || error}`, "error");
    process.exit(1);
}

const api = await login();

global.client.api = api;

logger.log("Đã đăng nhập thành công", "info")

await loaderCommand();
// Xử lý tải events
await loaderEvent();
logger.log("Đang thực thi các module onLoad...", "info");
    const modulesToLoad = [...global.client.commands.values(), ...global.client.events.values()];
    for (const module of modulesToLoad) {
        if (module.onLoad) {
            try {
                await module.onLoad({ api: global.client.api });
            } catch (error) {
                logger.log(`Lỗi khi thực thi onLoad của module ${module.config.name}: ${error.message}`, "error");
            }
        }
    }
///////////////////
listener(api);

})();
