const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'vdgirl',
  version: '1.0.0',
  role: 0,
  author: 'ShinTHL09',
  description: 'Xem video gái ngẫu nhiên',
  category: 'Tiện ích',
  usage: 'girl',
  cooldowns: 2
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type } = event;
  const { processVideo } = require("../../utils/index");

  const tempDir = path.join(__dirname, 'temp');
  const filePath = path.join(tempDir, 'gai.mp4');

  try {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const link = await axios.get('https://api.zeidteam.xyz/videos/gai');

    const res = await axios.get(link.data.data, {
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
      videoUrl: link.data.data,
      thumbnailUrl: videoData.thumbnailUrl,
      duration: videoData.metadata.duration,
      width: videoData.metadata.width,
      height: videoData.metadata.height,
      msg: "🎥 Video gái ngẫu nhiên"
    }, threadId, type);
  } catch (err) {
    console.error("Lỗi xử lý video:", err.message);
    await api.sendMessage("❌ Không thể tải video.", threadId, type);
  } finally {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Không thể xoá file tạm:", err.message);
    }
  }
};
