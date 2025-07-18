module.exports.config = {
  name: 'money',
  version: '1.0.0',
  role: 0,
  author: 'ShinTHL09',
  description: 'Kiểm tra số tiền của bản thân hoặc người được tag',
  category: 'Tiện ích',
  usage: 'money [@tag]',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type, data } = event;

  let targetID, targetName;

  if (args.length > 0 && Array.isArray(data.mentions) && data.mentions.length > 0) {
    targetID = Object.keys(data.mentions)[0];
    targetName = Object.values(data.mentions)[0] || "Người được tag";
  } else {
    targetID = data.uidFrom;
    targetName = "Bạn";
  }

  try {
    const userData = (await Users.getData(targetID));
    const money = userData.data.money || 0;

    return api.sendMessage(
      `💰 ${targetName} đang có ${money.toLocaleString('vi-VN')}₫`,
      threadId,
      type
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "❌ Không thể lấy dữ liệu ví. Vui lòng thử lại sau.",
      threadId,
      type
    );
  }
};
