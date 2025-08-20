const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { processVideo } = require("../../utils/index");

const vdgirl = require('../../assets/vdgirl.json');

module.exports.config = {
  name: 'vdgirl',
  aliases: ['vdgai'],
  version: '1.0.2',
  role: 0,
  author: 'ShinTHL09',
  description: 'Xem video gái ngẫu nhiên',
  category: 'Giải trí',
  usage: 'vdgirl',
  cooldowns: 2
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type } = event;

  const tempDir = path.join(__dirname, 'temp');
  const filePath = path.join(tempDir, 'gai.mp4');

  try {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const link = vdgirl[Math.floor(Math.random() * vdgirl.length)];

    const res = await axios.get(link, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://imgur.com/',
        'Accept': 'video/*,*/*;q=0.8'
      }
    });

    fs.writeFileSync(filePath, res.data);

    const videoData = await processVideo(filePath, threadId, type);

    await api.sendVideo({
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      duration: videoData.metadata.duration,
      width: videoData.metadata.width,
      height: videoData.metadata.height,
      msg: "🎥 Video gái ngẫu nhiên",
      ttl: 60000
    }, threadId, type);
  } catch (err) {
    console.error("Lỗi xử lý video:", err.message);
    await api.sendMessage("❌ Không thể tải video.", threadId, type);
  }
};
