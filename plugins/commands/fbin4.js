const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'fbin4',
  version: '1.0.0',
  role: 0,
  author: 'ShinTHL09',
  description: 'Lấy thông tin facebook bằng link hoặc uid',
  category: 'Tiện ích',
  usage: 'fbin4 [uid hoặc link]',
  cooldowns: 2,
  dependencies: {}
};

module.exports.run = async ({ args, event, api, Users }) => {
  const { threadId, type } = event;

  if (!args[0]) {
    return api.sendMessage('Vui lòng sử dụng đúng định dạng: fbin4 [uid hoặc link]', threadId, type);
  }

  const fbId = args[0];

  // truy cập https://api.zeidteam.xyz/
  // chọn phần API get token
  // nhập cookie fb
  // nhập loại token là EAAD6V7
  const accessToken = ""; // Sử dụng token EAAD6V7

  const url = `https://graph.facebook.com/${fbId}?fields=id,name,picture.width(720).height(720),username,is_verified,created_time,gender,relationship_status,hometown,location,education,work,birthday,about,locale,updated_time,timezone&access_token=${accessToken}`;

  if (!accessToken) {
    return api.sendMessage('Vui lòng nhập Token vào plugin/command/fbin4.js để sử dụng', threadId, type);
  }

  try {

    const res = await axios.get(url);
    const data = res.data;

    if (data.error) {
      await api.sendMessage("Không tìm thấy thông tin cho ID đã nhập.", threadId, type);
      return;
    }

    const id = data.id || "N/A";
    const name = data.name || "N/A";
    const username = data.username || "N/A";
    const verified = data.is_verified ? "Có" : "Không";
    const created_time = data.created_time || "N/A";
    const gender = data.gender || "N/A";
    const relationship_status = data.relationship_status || "N/A";
    const hometown = data.hometown?.name || "N/A";
    const location = data.location?.name || "N/A";
    const birthday = data.birthday || "N/A";
    const locale = data.locale || "N/A";
    const updated_time = data.updated_time || "N/A";
    const timezone = data.timezone !== undefined ? `GMT ${data.timezone}` : "N/A";
    const work = data.work?.map(job => job.employer?.name || "N/A").join(", ") || "N/A";
    const avatar_url = data.picture?.data?.url || "";

    const message = `
╭─────────────⭓
│ 𝗜𝗗: ${id}
│ 𝗡𝗮𝗺𝗲: ${name}
│ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${username}
│ 𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱: ${verified}
│ 𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗧𝗶𝗺𝗲: ${created_time}
│ 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender}
│ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻𝘀𝗵𝗶𝗽𝘀: ${relationship_status}
│ 𝗛𝗼𝗺𝗲𝘁𝗼𝘄𝗻: ${hometown}
│ 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${location}
│ 𝗪𝗼𝗿𝗸: ${work}
│ 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${birthday}
├─────────────⭔
│ 𝗟𝗼𝗰𝗮𝗹𝗲: ${locale}
│ 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 𝗧𝗶𝗺𝗲: ${updated_time}
│ 𝗧𝗶𝗺𝗲 𝗭𝗼𝗻𝗲: ${timezone}
╰─────────────⭓`;

    const filePath = path.join(__dirname, 'temp', 'fbin4.jpg');

    const image = await axios.get(avatar_url, {
          responseType: "arraybuffer"
    });
    fs.writeFileSync(filePath, image.data);
    
    await api.sendMessage({ msg: message, attachments: filePath }, threadId, type);
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('Lỗi:', error);
    return api.sendMessage('Đã xảy ra lỗi khi kiểm tra thông tin. Vui lòng thử lại sau!', threadId, type);
  }
};
