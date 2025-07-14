const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const login = require("./utils/login");
const logger = require("./utils/logger");

global.client = new Object();

global.config = new Object();

(async () => {

try {
    const configPath = path.join(__dirname, "config.yml");
    const fileContent = fs.readFileSync(configPath, "utf8");
    const config = YAML.parse(fileContent);

    global.config = config;
    logger.log("Đã tải cấu hình từ config.yml thành công", "info");
} catch (error) {
    logger.log(`Lỗi khi đọc config.yml: ${error.message || error}`, "error");
    process.exit(1);
}

const api = await login();

global.client.api = api;

logger.log(`Đã đăng nhập thành công`, "info");

api.listener.start();

})();