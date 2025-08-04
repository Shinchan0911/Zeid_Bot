const logger = require("../../utils/logger");

const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

const { ThreadType } = require("zca-js");

async function handleCommand(messageText, event = null, api = null, threadInfo = null, prefix = null) {
  const config = global.config;

  if (!messageText || typeof messageText !== "string") return;

  const threadId = event?.threadId;
  const type = event?.type;
  const UIDUsage = event?.data?.uidFrom;

  if (type == ThreadType.User && config.allow_private_command === false) {
    return;
  }

  const args = messageText.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = global.client.commands.get(commandName);
  if (!command) {
    if (api && threadId) {
      api.sendMessage({
        msg: "⚠️ Lệnh không tồn tại!",
        ttl: 20000  // Tự xóa sau 20 giây
      }, threadId, type);
    }
    return;
  }

  const role = command.config.role || 0;
  const isBotAdmin = global.users?.admin?.includes(UIDUsage);
  const isSupport = global.users?.support?.includes(UIDUsage);
  
  let isGroupAdmin = false;

  if (type == 1) {
    if (threadInfo.box_only) {
      try {
        const info = await api.getGroupInfo(threadId);
        const groupInfo = info.gridInfoMap[threadId];

        const isCreator = groupInfo.creatorId == UIDUsage;
        const isDeputy = Array.isArray(groupInfo.adminIds) && groupInfo.adminIds.includes(UIDUsage);

        isGroupAdmin = isCreator || isDeputy;
      } catch (err) {
        logger.log("⚠️ Không thể lấy thông tin nhóm từ API: " + err.message, "warn");
      }
    }

    if (threadInfo.admin_only && !isBotAdmin) {
      return api.sendMessage({
        msg: "❌ Nhóm đã bật chế độ chỉ admin bot đùng được lệnh.",
        ttl: 30000  // Tự xóa sau 30 giây
      }, threadId, type);
    }

    if (threadInfo.support_only && !isSupport && !isBotAdmin) {
      return api.sendMessage({
        msg: "❌ Nhóm đã bật chế độ chỉ support bot hoặc admin bot đùng được lệnh.",
        ttl: 30000  // Tự xóa sau 30 giây
      }, threadId, type);
    }

    if (threadInfo.box_only && !isGroupAdmin && !isBotAdmin) {
      return api.sendMessage({
        msg: "❌ Nhóm đã bật chế độ chỉ trưởng nhóm hoặc phó nhóm đùng được lệnh.",
        ttl: 30000  // Tự xóa sau 30 giây
      }, threadId, type);
    }
  }

  if ((role === 2 && !isBotAdmin) || (role === 1 && !isBotAdmin && !isSupport)) {
    return api.sendMessage({
      msg: "🚫 Bạn không có quyền sử dụng lệnh này.",
      ttl: 30000  // Tự xóa sau 30 giây
    }, threadId, type);
  }

  const cdTime = (command.config.cooldowns || 0) * 1000;

  if (!global.client.cooldowns.has(commandName)) {
    global.client.cooldowns.set(commandName, new Map());
  }

  const cdMap = global.client.cooldowns.get(commandName);
  const lastUsed = cdMap.get(threadId);

  if (lastUsed && Date.now() - lastUsed < cdTime) {
    const timeLeft = ((cdTime - (Date.now() - lastUsed)) / 1000).toFixed(1);
    return api.sendMessage({
      msg: `⏳ Vui lòng chờ ${timeLeft}s để dùng lại lệnh '${commandName}'`,
      ttl: 15000  // Tự xóa sau 15 giây (cooldown message)
    }, threadId, type);
  }

  cdMap.set(threadId, Date.now());

  try {
    command.run({ args, event, api, Users, Threads });
  } catch (err) {
    logger.log("❌ Lỗi khi xử lý lệnh: " + err.message, "error");
    return api.sendMessage({
      msg: "❌ Đã xảy ra lỗi khi xử lý lệnh!",
      ttl: 30000  // Tự xóa sau 30 giây
    }, threadId, type);
  }
}


module.exports = handleCommand;
