const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");

function loadEvents(dir = path.join(__dirname, "../..", "modules", "events")) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const event = require(filePath);

    if (
      !event.config ||
      !Array.isArray(event.config.event_type) ||
      typeof event.run !== "function"
    ) {
      logger.log(`Event ${file} không hợp lệ`, "warn");
      continue;
    }

    const eventName = event.config.name?.toLowerCase() || file.replace(/\.js$/, "");

    const dependencies = event.config?.dependencies || {};
    for (const [pkgName, version] of Object.entries(dependencies)) {
      try {
        require.resolve(pkgName);
      } catch {
        logger.log(`Cài đặt package: ${pkgName}@${version || "latest"}`, "info");
        try {
          execSync(`npm install ${pkgName}@${version || "latest"}`, { stdio: "inherit" });
          logger.log(`Đã cài xong ${pkgName}`, "info");
        } catch (err) {
          logger.log(`Lỗi khi cài ${pkgName}: ${err.message}`, "error");
        }
      }
    }

    global.client.events.set(eventName, event);

    if (typeof event.onLoad === "function") {
      try {
        event.onLoad({ api: global.api });
      } catch (e) {
        logger.log(`Lỗi trong onLoad của event ${eventName}: ${e.message}`, "error");
      }
    }
  }

  logger.log(`Đã tải ${global.client.events.size} event module`, "info");
}

module.exports = loadEvents;
