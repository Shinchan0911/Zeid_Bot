module.exports.config = {
  name: 'admin',
  version: '1.0.0',
  role: 2,
  author: 'shinthl09',
  description: 'Quản lý admin',
  category: 'Hệ thống',
  usage: 'admin <add|rm|sp|rmsp|list>',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, message, event, api }) => {
  const action = args[0]?.toLowerCase();
  const { threadId, type } = event;

  const { updateConfigArray, reloadConfig } = require("../../utils/index");

  switch (action) {
    case "add": {
      const id = args[1];

      if (!id || isNaN(id)) {
        return api.sendMessage("Vui lòng nhập ID hợp lệ (chỉ chứa số)", threadId, type);
      }

      if (global.users.admin.includes(id)) {
        return api.sendMessage("ID này đã là admin bot rồi.", threadId, type);
      }

      const newList = [...global.users.admin, id];
      await updateConfigArray("admin_bot", newList);

      await reloadConfig();

      return api.sendMessage(`Đã thêm admin với ID: ${id}`, threadId, type);
    }

    case "rm": {
      const id = args[1];

      if (!id || isNaN(id)) {
        return api.sendMessage("Vui lòng nhập ID hợp lệ (chỉ chứa số)", threadId, type);
      }

      if (!global.users.admin.includes(id)) {
        return api.sendMessage("ID này không phải admin bot.", threadId, type);
      }

      const newList = global.users.admin.filter(uid => uid !== id);
      await updateConfigArray("admin_bot", newList);
      await reloadConfig();

      return api.sendMessage(`Đã xoá admin với ID: ${id}`, threadId, type);
    }

    case "sp": {
      const id = args[1];

      if (!id || isNaN(id)) {
        return api.sendMessage("Vui lòng nhập ID hợp lệ (chỉ chứa số)", threadId, type);
      }

      if (global.users.support.includes(id)) {
        return api.sendMessage("ID này đã là support bot rồi.", threadId, type);
      }

      const newList = [...global.users.support, id];
      await updateConfigArray("support_bot", newList);
      await reloadConfig();

      return api.sendMessage(`Đã thêm support với ID: ${id}`, threadId, type);
    }

    case "rmsp": {
      const id = args[1];

      if (!id || isNaN(id)) {
        return api.sendMessage("Vui lòng nhập ID hợp lệ (chỉ chứa số)", threadId, type);
      }

      if (!global.users.support.includes(id)) {
        return api.sendMessage("ID này không phải support bot.", threadId, type);
      }

      const newList = global.users.support.filter(uid => uid !== id);
      await updateConfigArray("support_bot", newList);
      await reloadConfig();

      return api.sendMessage(`Đã xoá support với ID: ${id}`, threadId, type);
    }

    case "list": {
      const adminList = global.users.admin;
      const supportList = global.users.support;

      let msg = "Danh sách quản trị viên bot:\n";
      msg += adminList.length ? adminList.map(id => `👑 ${id}`).join("\n") : "Không có admin nào.";
      msg += "\n\nDanh sách hỗ trợ bot:\n";
      msg += supportList.length ? supportList.map(id => `🛠 ${id}`).join("\n") : "Không có support nào.";

      return api.sendMessage(msg, threadId, type);
    }


    default:
      return api.sendMessage(
        "Quản lý admin bot\n\n" +
        "admin add <id> - Thêm người làm admin bot\n" +
        "admin rm <id> - Gỡ vai trò admin bot\n" +
        "admin sp <id> - Thêm người làm support bot\n" +
        "admin rmsp <id> - Gỡ vai trò support bot\n" +
        "admin list - Xem danh sách admin bot và support bot\n",
        threadId, type
      );
  }
};
