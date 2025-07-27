module.exports.config = {
  name: 'money',
  version: '1.0.1',
  role: 0,
  author: 'ShinTHL09',
  description: 'Kiểm tra số tiền của bản thân hoặc người được tag',
  category: 'Tiện ích',
  usage: 'money [@tag] (có thể tag nhiều người)',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type, data } = event;

  const mentions = data.mentions;
  const hasMention = mentions && mentions.length > 0;
  const senderID = data.uidFrom;

  if (hasMention && mentions.length > 1) {
    try {
      const moneyList = await Promise.all(mentions.map(async mention => {
        const targetID = mention.uid;
        try {
          const info = await api.getUserInfo(targetID);
          const targetName = info?.changed_profiles?.[targetID]?.displayName || "Không rõ tên";
          const userData = await Users.getData(targetID);
          const money = userData.data.money || 0;
          return `💰 ${targetName}: ${money.toLocaleString('vi-VN')}₫`;
        } catch {
          return `💰 (Không lấy được tên): 0₫`;
        }
      }));

      return api.sendMessage(
        `📊 Danh sách số tiền:\n${moneyList.join("\n")}`,
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
  }

  const targetID = hasMention ? mentions[0].uid : senderID;
  let targetName = "Bạn";

  if (hasMention) {
    try {
      const info = await api.getUserInfo(targetID);
      targetName = info?.changed_profiles?.[targetID]?.displayName || "Người được tag";
    } catch {
      targetName = "Người được tag";
    }
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
