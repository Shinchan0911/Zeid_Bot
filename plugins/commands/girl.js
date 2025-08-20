const axios = require('axios');
const fs = require('fs');
const path = require('path');

const girlImages = require('../../assets/girl.json');

module.exports.config = {
  name: 'girl',
  aliases: ['gai'],
  version: '1.0.3',
  role: 0,
  author: 'ShinTHL09',
  description: 'Xem ảnh gái ngẫu nhiên',
  category: 'Giải trí',
  usage: 'girl',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type } = event;
  const tempDir = path.join(__dirname, 'temp');
  const filePath = path.join(__dirname, 'temp', 'gai.jpg');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    const link = girlImages[Math.floor(Math.random() * girlImages.length)];

    const res = await axios.get(link, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://imgur.com/',
        'Accept': 'image/*,*/*;q=0.8'
      }
    });

    fs.writeFileSync(filePath, res.data);

    await api.sendMessage({ msg: "📷 Ảnh gái ngẫu nhiên", attachments: filePath, ttl: 60000 }, threadId, type);

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi tải ảnh gái:", error.message);
    return api.sendMessage("❌ Không thể tải ảnh gái lúc này. Vui lòng thử lại sau.", threadId, type);
  }
};
