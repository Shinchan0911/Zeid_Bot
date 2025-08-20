const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: 'tile',
  version: '1.0.1',
  role: 0,
  author: 'ShinTHL09', // ý tưởng từ mdl gốc của D-Jukie
  description: 'Xem tỉ lệ hợp đôi giữa 2 người',
  category: 'Giải trí',
  usage: 'tile [tag1] [tag2]',
  cooldowns: 2,
  dependencies: {}
};

const downloadImage = (url, filePath) => {
  return axios.get(url, { responseType: 'arraybuffer' })
    .then(response => fs.promises.writeFile(filePath, response.data))
    .catch(error => {
      console.error("Lỗi tải ảnh:", error.message);
      throw error;
    });
};

const getRandomMatchRate = () => Math.floor(Math.random() * 101);

module.exports.run = async function({ api, event }) {
  const { threadId, type, data } = event;
  const senderId = event.data.uidFrom;
  const tempDir = path.join(__dirname, 'temp');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    const mentions = data.mentions;
    const hasMention = mentions && mentions.length > 0;

    if (!hasMention) {
        return api.sendMessage("❌ Cần phải tag ít nhất 1 người để xem tỉ lệ hợp nhau", threadId, type);
    }

    const tle = getRandomMatchRate();

    if (mentions.length === 1) {
        const mention = mentions[0].uid;

        const info1 = await api.getUserInfo(mention);
        const user1 = info1.changed_profiles[mention];

        const info2 = await api.getUserInfo(senderId);
        const user2 = info2.changed_profiles[senderId];

        const name1 = user1.displayName;
        const name2 = user2.displayName;
        
        const avatarPath1 = path.join(tempDir, 'tile_avatar1.jpg');
        const avatarPath2 = path.join(tempDir, 'tile_avatar2.jpg');
        
        await Promise.all([
            downloadImage(user1.avatar, avatarPath1),
            downloadImage(user2.avatar, avatarPath2)
        ]);
        const text = `[❤️]➜ Tỉ lệ hợp đôi giữa\n👤 ${name1}\n👤 ${name2}\n💞 Mức độ phù hợp: ${tle}%`;

        await api.sendMessage({
            msg: text,
            attachments: [avatarPath1, avatarPath2],
            mentions: [
                { uid: mention, pos: text.indexOf(name1), len: name1.length },
                { uid: senderId, pos: text.indexOf(name2), len: name2.length }
            ],
        }, threadId, type);
        fs.unlinkSync(avatarPath1);
        fs.unlinkSync(avatarPath2);

    } else if (mentions.length === 2) {
        const mention1 = mentions[0].uid;
        const mention2 = mentions[1].uid;

        const info1 = await api.getUserInfo(mention1);
        const info2 = await api.getUserInfo(mention2);

        const user1 = info1.changed_profiles[mention1];
        const user2 = info2.changed_profiles[mention2];

        const name1 = user1.displayName;
        const name2 = user2.displayName;

        const avatarPath1 = path.join(tempDir, 'tile_avatar1.jpg');
        const avatarPath2 = path.join(tempDir, 'tile_avatar2.jpg');

        await Promise.all([
            downloadImage(user1.avatar, avatarPath1),
            downloadImage(user2.avatar, avatarPath2)
        ]);

        const text = `[❤️]➜ Tỉ lệ hợp đôi giữa\n👤 ${name1}\n👤 ${name2}\n💞 Mức độ phù hợp: ${tle}%`;
        await api.sendMessage({
            msg: text,
            attachments: [avatarPath1, avatarPath2],
            mentions: [
                { uid: mention1, pos: text.indexOf(name1), len: name1.length },
                { uid: mention2, pos: text.indexOf(name2), len: name2.length }
            ]
        }, threadId, type);
        fs.unlinkSync(avatarPath1);
        fs.unlinkSync(avatarPath2);
    }
    

  } catch (err) {
    console.error("Lỗi khi xem tỉ lệ:", err.message);
    api.sendMessage("❌ Đã xảy ra lỗi xem tỉ lệ. Vui lòng thử lại sau.", threadId, type);
  }
};
