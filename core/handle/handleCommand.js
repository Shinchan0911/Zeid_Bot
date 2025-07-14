const logger = require("../../utils/logger");

function handleCommand(messageText, event = null, api = null) {
  const config = global.config;

  if (!messageText || typeof messageText !== "string") return;

  const threadId = event?.threadId || "unknown";
  const type = event?.type || "Unknown";
  const UIDUsage = event?.data?.uidFrom || "Unknown";

  if (type === "User" && config.allow_private_command === false) {
    return;
  }

  const args = messageText.slice(config.prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = global.client.commands.get(commandName);
  if (!command) {
    if (api && threadId) {
      api.sendMessage("⚠️ Lệnh không tồn tại!", threadId, type);
    }
    return;
  }

  const role = command.config.role || 0;
  const isAdmin = global.users?.admin?.includes(UIDUsage);
  const isSupport = global.users?.support?.includes(UIDUsage);

  if (
    (role === 2 && !isAdmin) || 
    (role === 1 && !isAdmin && !isSupport) 
  ) {
    if (api && threadId) {
      api.sendMessage("🚫 Bạn không có quyền sử dụng lệnh này.", threadId, type);
    }
    return;
  }

  const cdTime = (command.config.cooldowns || 0) * 1000;

  if (!global.client.cooldowns.has(commandName)) {
    global.client.cooldowns.set(commandName, new Map());
  }

  const cdMap = global.client.cooldowns.get(commandName);
  const lastUsed = cdMap.get(threadId);

  if (lastUsed && Date.now() - lastUsed < cdTime) {
    const timeLeft = ((cdTime - (Date.now() - lastUsed)) / 1000).toFixed(1);

    if (api && threadId) {
      api.sendMessage(`⏳ Vui lòng chờ ${timeLeft}s để dùng lại lệnh '${commandName}'`, threadId, type);
    }
    return;
  }

  cdMap.set(threadId, Date.now());

  try {
    command.run({ args, message: messageText, event, api, logger });
  } catch (err) {
    if (api && threadId) {
      api.sendMessage("❌ Đã xảy ra lỗi khi xử lý lệnh!", threadId, type);
    }
  }
}

module.exports = handleCommand;
