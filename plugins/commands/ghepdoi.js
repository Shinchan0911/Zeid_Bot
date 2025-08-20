const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { TextStyle } = require("zca-js");

module.exports.config = {
  name: 'ghepdoi',
  version: '1.0.2',
  role: 0,
  author: 'ShinTHL09',
  description: 'Ghép đôi bản thân với một thành viên khác trong nhóm',
  category: 'Giải trí',
  usage: 'ghepdoi [nam|nữ]',
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

module.exports.run = async function({ api, event, args }) {
  const { threadId, type } = event;
  const senderId = event.data.uidFrom;
  const tempDir = path.join(__dirname, 'temp');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    const tle = getRandomMatchRate();
    const groupInfo = (await api.getGroupInfo(threadId)).gridInfoMap[threadId];
    const members = groupInfo.memVerList;

    if (members.length < 2) {
      return api.sendMessage("❌ Nhóm không đủ thành viên để ghép đôi!", threadId, type);
    }

    const member1 = senderId;
    const info1 = await api.getUserInfo(member1);
    const user1 = info1.changed_profiles[member1];

    let targetGender = null;
    if (args[0]) {
      if (args[0].toLowerCase() === 'nam') targetGender = 0;
      else if (args[0].toLowerCase() === 'nữ') targetGender = 1;
      else return api.sendMessage("⚠️ Giới tính không hợp lệ. Vui lòng sử dụng 'ghepdoi nam' hoặc 'ghepdoi nữ'.", threadId, type);
    } else {
      return api.sendMessage("⚠️ Bạn chưa chỉ định giới tính cần ghép đôi. Vui lòng sử dụng 'ghepdoi nam' hoặc 'ghepdoi nữ'.", threadId, type);
    }

    const candidates = members
      .map(uid => uid.replace('_0', ''))
      .filter(uid => uid !== senderId);

    const filtered = [];

    for (const uid of candidates) {
      const info = await api.getUserInfo(uid);
      const user = info.changed_profiles[uid];

      if (targetGender === null || user.gender === targetGender) {
        filtered.push({ uid, user });
      }
    }

    if (filtered.length === 0) {
      return api.sendMessage("❌ Không tìm thấy ai phù hợp để ghép đôi theo yêu cầu!", threadId, type);
    }

    const random = filtered[Math.floor(Math.random() * filtered.length)];
    const member2 = random.uid;
    const user2 = random.user;

    const name1 = user1.displayName;
    const name2 = user2.displayName;

    const avatarPath1 = path.join(tempDir, 'tinder_love_avatar1.jpg');
    const avatarPath2 = path.join(tempDir, 'tinder_love_avatar2.jpg');

    await Promise.all([
      downloadImage(user1.avatar, avatarPath1),
      downloadImage(user2.avatar, avatarPath2)
    ]);

    const text = `💙====『 𝗧𝗜𝗡𝗗𝗘𝗥 𝗟𝗢𝗩𝗘 』====💙\n──────────────────\n${name1} 💓 ${name2}\n──────────────────\n|› ⚖️ Tỉ lệ đẹp đôi là: ${tle}%\n|› 📝 Chúc 2 bạn trăm năm hạnh phúc`;

    const msg = {
      msg: text,
      attachments: [avatarPath1, avatarPath2],
      mentions: [
        { uid: member1, pos: text.indexOf(name1), len: name1.length },
        { uid: member2, pos: text.indexOf(name2), len: name2.length }
      ],
      styles: [{ start: 0, len:35, st: TextStyle.Red }]
    };

    await api.sendMessage(msg, threadId, type);

    fs.unlinkSync(avatarPath1);
    fs.unlinkSync(avatarPath2);

  } catch (err) {
    console.error("Lỗi khi ghép đôi:", err.message);
    api.sendMessage("❌ Đã xảy ra lỗi khi ghép đôi. Vui lòng thử lại sau.", threadId, type);
  }
};
