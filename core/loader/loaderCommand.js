const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");

function loadCommands(dir = path.join(__dirname, "../..", "modules", "commands")) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const command = require(filePath);

    if (!command.config || !command.config.name || typeof command.run !== "function") {
      logger.log(`Command ${file} không hợp lệ`, "warn");
      continue;
    }

    const name = command.config.name.toLowerCase();
    const dependencies = command.config.dependencies || {};

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

    global.client.commands.set(name, command);

    if (typeof command.onLoad === "function") {
      try {
        command.onLoad({ api });
      } catch (e) {
        logger.log(`Lỗi trong onLoad của command ${name}: ${e.message}`, "error");
      }
    }
  }

  logger.log(`Đã tải thành công ${global.client.commands.size} lệnh`, "info");
}

module.exports = loadCommands;
