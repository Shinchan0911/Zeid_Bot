const { updateConfigArray, reloadConfig } = require("../../utils/index");

module.exports.config = {
  name: 'admin',
  version: '1.1.0',
  role: 2,
  author: 'shinthl09',
  description: 'Quản lý admin và support của bot bằng ID hoặc tag.',
  category: 'Hệ thống',
  usage: 'admin <add|rm|sp|rmsp|list> [@tag/ID] (có thể tag nhiều người, nhập nhiều uid cách nhau dấu cách hoặc ,)',
  cooldowns: 2
};

module.exports.run = async ({ args, event, api }) => {
  const action = args[0]?.toLowerCase();
  const { threadId, type, data } = event;

  let targetIds = [];

  if (data.mentions && Object.keys(data.mentions).length > 0) {
    targetIds = Object.values(data.mentions).map(m => m.uid);
  }

  if (targetIds.length === 0 && args.length > 1) {
    targetIds = args.slice(1)
      .join(" ")            
      .split(/[\s,]+/)      
      .filter(id => id && !isNaN(id));
  }

  const processAdd = async (listName, label) => {
    if (targetIds.length === 0) return api.sendMessage(`Vui lòng nhập ID hoặc tag người dùng cần thêm làm ${label}.`, threadId, type);

    const currentList = global.users[listName];
    const newIds = targetIds.filter(id => !currentList.includes(id));
    if (newIds.length === 0) return api.sendMessage("Không có người dùng nào mới cần thêm.", threadId, type);

    const updated = [...currentList, ...newIds];
    await updateConfigArray(`${listName}_bot`, updated);
    await reloadConfig();

    const infos = await Promise.all(newIds.map(id => api.getUserInfo(id).catch(() => null)));
    const names = infos.map((info, i) => `${info?.changed_profiles?.[newIds[i]]?.displayName || "Không rõ"} - ${newIds[i]}`);

    return api.sendMessage(`✅ Đã thêm ${label}:\n` + names.join("\n"), threadId, type);
  };

  const processRemove = async (listName, label) => {
    if (targetIds.length === 0) return api.sendMessage(`Vui lòng nhập ID hoặc tag người dùng cần gỡ khỏi ${label}.`, threadId, type);

    const currentList = global.users[listName];
    const existing = targetIds.filter(id => currentList.includes(id));
    if (existing.length === 0) return api.sendMessage("Không có người dùng nào trong danh sách hiện tại.", threadId, type);

    const updated = currentList.filter(id => !existing.includes(id));
    await updateConfigArray(`${listName}_bot`, updated);
    await reloadConfig();

    const infos = await Promise.all(existing.map(id => api.getUserInfo(id).catch(() => null)));
    const names = infos.map((info, i) => `${info?.changed_profiles?.[existing[i]]?.displayName || "Không rõ"} - ${existing[i]}`);

    return api.sendMessage(`✅ Đã gỡ ${label}:\n` + names.join("\n"), threadId, type);
  };

  switch (action) {
    case "add":
      return processAdd("admin", "admin bot");
    case "rm":
      return processRemove("admin", "admin bot");
    case "sp":
      return processAdd("support", "support bot");
    case "rmsp":
      return processRemove("support", "support bot");

    case "list": {
      const adminList = global.users.admin || [];
      const supportList = global.users.support || [];

      const adminInfos = await Promise.all(adminList.map(id => api.getUserInfo(id).catch(() => null)));
      const supportInfos = await Promise.all(supportList.map(id => api.getUserInfo(id).catch(() => null)));

      let msg = "--- DANH SÁCH QUẢN TRỊ ---\n\n";

      msg += "👑 Admin Bot:\n";
      msg += adminInfos.length > 0
        ? adminInfos.map((info, i) => {
            const uid = adminList[i];
            const name = info?.changed_profiles?.[uid]?.displayName || "(Không rõ)";
            return ` - ${name} - ${uid}`;
          }).join("\n")
        : "Không có admin nào.";

      msg += "\n\n🛠️ Support Bot:\n";
      msg += supportInfos.length > 0
        ? supportInfos.map((info, i) => {
            const uid = supportList[i];
            const name = info?.changed_profiles?.[uid]?.displayName || "(Không rõ)";
            return ` - ${name} - ${uid}`;
          }).join("\n")
        : "Không có support nào.";

      return api.sendMessage(msg, threadId, type);
    }

    default:
      return api.sendMessage(
        "Quản lý admin bot\n\n" +
        "admin add [@tag/ID...] - Thêm admin\n" +
        "admin rm [@tag/ID...] - Gỡ admin\n" +
        "admin sp [@tag/ID...] - Thêm support\n" +
        "admin rmsp [@tag/ID...] - Gỡ support\n" +
        "admin list - Xem danh sách",
        threadId, type
      );
  }
};
