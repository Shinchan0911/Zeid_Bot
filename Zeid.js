const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const login = require("./core/login");
const logger = require("./utils/logger");
const listener = require("./core/listen");
const loaderCommand = require("./core/loader/loaderCommand");

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

await loaderCommand();

listener(api);

})();