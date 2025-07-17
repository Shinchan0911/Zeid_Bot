const logger = require("../../utils/logger");

const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

async function handleCommand(messageText, event = null, api = null, threadInfo = null, prefix = null) {
  const config = global.config;

  if (!messageText || typeof messageText !== "string") return;

  const threadId = event?.threadId;
  const type = event?.type;
  const UIDUsage = event?.data?.uidFrom || event?.senderID;

  if (type === "User" && config.allow_private_command === false) {
    return;
  }

  const args = messageText.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = global.client.commands.get(commandName);
  if (!command) {
    if (api && threadId) {
      api.sendMessage("⚠️ Lệnh không tồn tại!", threadId, type);
    }
    return;
  }

  const role = command.config.role || 0;
  const isBotAdmin = global.users?.admin?.includes(UIDUsage);
  const isSupport = global.users?.support?.includes(UIDUsage);
  
  if (type == 1) {
    if (threadInfo.box_only) {
      let isGroupAdmin = false;

      try {
        const info = await api.getThreadInfo(threadId);

        console.log(info);

        const isCreator = info.creatorId === event.senderID;
        const isDeputy = Array.isArray(info.adminIds) && info.adminIds.includes(event.senderID);

        isGroupAdmin = isCreator || isDeputy;
      } catch (err) {
        logger.log("⚠️ Không thể lấy thông tin nhóm từ API: " + err.message, "warn");
      }
    }

    if (threadInfo.admin_only && !isBotAdmin) {
      return api.sendMessage("❌ Nhóm đã bật chế độ chỉ admin bot đùng được lệnh.", threadId, type);
    }

    if (threadInfo.support_only && !isSupport && !isBotAdmin) {
      return api.sendMessage("❌ Nhóm đã bật chế độ chỉ support bot hoặc admin bot đùng được lệnh.", threadId, type);
    }

    if (threadInfo.box_only && !isGroupAdmin && !isBotAdmin) {
      return api.sendMessage("❌ Nhóm đã bật chế độ chỉ trưởng nhóm hoặc phó nhóm đùng được lệnh.", threadId, type);
    }
  }

  if ((role === 2 && !isBotAdmin) || (role === 1 && !isBotAdmin && !isSupport)) {
    return api.sendMessage("🚫 Bạn không có quyền sử dụng lệnh này.", threadId, type);
  }

  const cdTime = (command.config.cooldowns || 0) * 1000;

  if (!global.client.cooldowns.has(commandName)) {
    global.client.cooldowns.set(commandName, new Map());
  }

  const cdMap = global.client.cooldowns.get(commandName);
  const lastUsed = cdMap.get(threadId);

  if (lastUsed && Date.now() - lastUsed < cdTime) {
    const timeLeft = ((cdTime - (Date.now() - lastUsed)) / 1000).toFixed(1);
    return api.sendMessage(`⏳ Vui lòng chờ ${timeLeft}s để dùng lại lệnh '${commandName}'`, threadId, type);
  }

  cdMap.set(threadId, Date.now());

  try {
    command.run({ args, event, api, Users, Threads });
  } catch (err) {
    logger.log("❌ Lỗi khi xử lý lệnh: " + err.message, "error");
    return api.sendMessage("❌ Đã xảy ra lỗi khi xử lý lệnh!", threadId, type);
  }
}


module.exports = handleCommand;
