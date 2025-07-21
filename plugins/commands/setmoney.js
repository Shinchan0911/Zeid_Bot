module.exports.config = {
  name: 'setmoney',
  version: '1.0.0',
  role: 2,
  author: 'ShinTHL09',
  description: 'Thêm hoặc đặt số tiền của bản thân hoặc người khác',
  category: 'Tiện ích',
  usage: 'setmoney [set/add] [@tag] [số tiền]',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type, data } = event;

  const subcommand = (args[0] || '').toLowerCase();
  const mention = data.mentions && Object.keys(data.mentions).length > 0;
  const senderID = data.uidFrom;

  const targetID = mention ? Object.keys(data.mentions)[0] : senderID;
  const targetName = mention ? Object.values(data.mentions)[0] : "Bạn";

  try {
    const userData = await Users.getData(targetID).data;

    switch (subcommand) {
      case 'set': {
        const amountArg = mention ? args[2] : args[1];
        if (!amountArg || isNaN(amountArg)) {
          return api.sendMessage("❌ Dùng: setmoney set [@tag] [số tiền]", threadId, type);
        }
        userData.money = parseInt(amountArg);
        await Users.setData(targetID, userData);
        return api.sendMessage(
          `✅ Đã đặt lại số tiền của ${targetName} thành ${userData.money.toLocaleString('vi-VN')}₫`,
          threadId,
          type
        );
      }

      case 'add': {
        const amountArg = mention ? args[2] : args[1];
        if (!amountArg || isNaN(amountArg)) {
          return api.sendMessage("❌ Dùng: setmoney add [@tag] [số tiền]", threadId, type);
        }
        const amountToAdd = parseInt(amountArg);
        userData.money += amountToAdd;
        await Users.setData(targetID, userData);
        return api.sendMessage(
          `✅ Đã cộng thêm ${amountToAdd.toLocaleString('vi-VN')}₫ cho ${targetName}\n💰 Tổng cộng: ${userData.money.toLocaleString('vi-VN')}₫`,
          threadId,
          type
        );
      }

      default:
        return api.sendMessage("❌ Lệnh không hợp lệ. Dùng: setmoney set/add [@tag] [số tiền]", threadId, type);
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
      threadId,
      type
    );
  }
};
