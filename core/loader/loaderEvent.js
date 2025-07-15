const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");

function loadEvents(dir = path.join(__dirname, "../..", "modules", "events")) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const event = require(filePath);

    if (!event.config || !event.config.event_type || typeof event.run !== "function") {
      logger.log(`Event ${file} không hợp lệ`, "warn");
      continue;
    }
    const eventType = event.config.event_type.toLowerCase();
    const eventName = event.config.name.toLowerCase();

    const dependencies = event.config?.dependencies || {};
    for (const [pkgName, version] of Object.entries(dependencies)) {
      try {
        require.resolve(pkgName);
      } catch {
        logger.log(`Đang cài package: ${pkgName}@${version || "latest"}`, "info");
        try {
          execSync(`npm install ${pkgName}@${version || "latest"}`, { stdio: "inherit" });
          logger.log(`Đã cài xong ${pkgName}`, "info");
        } catch (err) {
          logger.log(`Lỗi khi cài ${pkgName}: ${err.message}`, "error");
        }
      }
    }

    if (!global.client.events.has(eventType)) {
        global.client.events.set(eventType, []);
    }
    global.client.events.get(eventType).push(event);

    if (typeof event.onLoad === "function") {
        try {
            event.onLoad({ logger });
        } catch (e) {
            logger.log(`Lỗi trong onLoad của event ${eventName}: ${e.message}`, "error");
        }
    }
  }

  logger.log(`Đã tải thành công ${global.client.events.size} event`, "info");
}

module.exports = loadEvents;
