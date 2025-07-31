const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'girl',
  version: '1.0.0',
  role: 0,
  author: 'ShinTHL09',
  description: 'Xem ảnh gái ngẫu nhiên',
  category: 'Tiện ích',
  usage: 'girl',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type } = event;
  const filePath = path.join(__dirname, 'temp', 'gai.jpg');

  try {
    const link = await axios.get('https://api.zeidteam.xyz/images/gai');

    const res = await axios.get(link.data.data, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://imgur.com/',
        'Accept': 'image/*,*/*;q=0.8'
      }
    });

    fs.writeFileSync(filePath, res.data);

    await api.sendMessage({ msg: "", attachments: filePath }, threadId, type);

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi tải ảnh gái:", error.message);
    return api.sendMessage("❌ Không thể tải ảnh gái lúc này. Vui lòng thử lại sau.", threadId, type);
  }
};
