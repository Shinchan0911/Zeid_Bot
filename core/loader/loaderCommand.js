const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");

const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

function extractDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/dependencies\s*:\s*{([^}]*)}/);
    if (!match) return {};

    const depString = `{${match[1]}}`;
    return eval(`(${depString})`);
  } catch (err) {
    logger.log(`Lỗi khi đọc dependencies từ ${filePath}: ${err.message}`, "error");
    return {};
  }
}

function loadCommands(dir = path.join(__dirname, "../..", "plugins", "commands")) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));
  let shouldRestart = false;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const dependencies = extractDependencies(filePath);

    for (const [pkgName, version] of Object.entries(dependencies)) {
      try {
        require.resolve(pkgName);
      } catch {
        logger.log(`Đang cài package: ${pkgName}@${version || "latest"}`, "info");
        try {
          execSync(`npm install ${pkgName}@${version || "latest"}`, {
            stdio: "inherit",
            cwd: path.join(__dirname, "../../")
          });
          logger.log(`Đã cài xong ${pkgName}`, "info");
          shouldRestart = true;
        } catch (err) {
          logger.log(`Lỗi khi cài ${pkgName}: ${err.message}`, "error");
        }
      }
    }

    if (shouldRestart) continue;

    let command;
    try {
      command = require(filePath);
    } catch (err) {
      logger.log(`Không thể require file ${file}: ${err.message}`, "error");
      continue;
    }

    if (!command.config || !command.config.name || !command.config.cooldowns || typeof command.run !== "function") {
      logger.log(`Command ${file} không hợp lệ`, "warn");
      continue;
    }

    const name = command.config.name.toLowerCase();
    global.client.commands.set(name, command);

    if (typeof command.onLoad === "function") {
      try {
        command.onLoad({ api: global.api, Users, Threads });
      } catch (e) {
        logger.log(`Lỗi trong onLoad của command ${name}: ${e.message}`, "error");
      }
    }
  }

  logger.log(`Đã tải thành công ${global.client.commands.size} lệnh`, "info");

  if (shouldRestart) {
    logger.log("Đã cài thêm package. Đang khởi động lại bot...", "warn");
    process.exit(2);
  }
}

module.exports = loadCommands;
