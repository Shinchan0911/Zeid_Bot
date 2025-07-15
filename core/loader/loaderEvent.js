const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");

module.exports = async () => {
    const eventsPath = path.join(__dirname, "..", "..", "modules", "events");
    
    if (!fs.existsSync(eventsPath)) {
        logger.log("Thư mục 'modules/events' không tồn tại, bỏ qua việc tải event.", "warn");
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
    logger.log(`Đang tải ${eventFiles.length} events...`, "info");

    for (const file of eventFiles) {
        try {
            const filePath = path.join(eventsPath, file);
            const eventModule = require(filePath);
            const { config } = eventModule;

            if (!config || !config.name) {
                logger.log(`File event ${file} không có config hợp lệ.`, "warn");
                continue;
            }

            const dependencies = config.dependencies || {};
            for (const [pkgName, version] of Object.entries(dependencies)) {
                try {
                    require.resolve(pkgName);
                } catch {
                    logger.log(`Đang cài package cho event ${config.name}: ${pkgName}@${version || "latest"}`, "info");
                    try {
                        execSync(`npm install ${pkgName}@${version || "latest"} --no-save`, { stdio: "inherit" });
                        logger.log(`Đã cài xong ${pkgName}`, "info");
                    } catch (err) {
                        logger.log(`Lỗi khi cài ${pkgName}: ${err.message}`, "error");
                    }
                }
            }
            
            const name = config.name.toLowerCase();
            global.client.events.set(name, eventModule);
        } catch (error) {
            logger.log(`Lỗi khi tải event ${file}: ${error.message}`, "error");
        }
    }
    logger.log(`Đã tải thành công ${global.client.events.size} events`, "info");
};