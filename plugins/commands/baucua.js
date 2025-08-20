const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Jimp = require("jimp");

module.exports.config = {
  name: "baucua",
  version: "1.0.5",
  role: 0,
  author: "ShinTHL09",
  description: "Game bầu cua đa cược",
  category: "game",
  usage: "baucua <bau/cua/ca/nai/ga/tom>:<số tiền/allin>",
  cooldowns: 10,
  dependencies: { 
    "jimp": "0.16.1"
 }
};

const cacheDir = path.join(__dirname, "cache", "baucua");
const animalList = ["bau", "cua", "ca", "nai", "ga", "tom"];
const emojiMap = {
  bau: "🍐", cua: "🦀", ca: "🐟",
  nai: "🦌", ga: "🐓", tom: "🦞"
};
const imgMap = {
  bau: "https://i.postimg.cc/T2L1mkc1/bau.jpg",
  cua: "https://i.postimg.cc/v8JBvWPz/cua.jpg",
  ca: "https://i.postimg.cc/grFf6cHV/ca.jpg",
  nai: "https://i.postimg.cc/90q6MwZX/nai.jpg",
  ga: "https://i.postimg.cc/KvtYpRwy/ga.jpg",
  tom: "https://i.postimg.cc/nhkhZNnR/tom.jpg",
  gif: "https://i.postimg.cc/PJYd7R6M/gif.gif"
};

const taxRate = 0.1;

async function downloadImage(url, dest) {
  if (fs.existsSync(dest)) return;
  const response = await axios.get(url, { 
    responseType: "arraybuffer",
    headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://imgur.com/',
            'Accept': 'image/*,*/*;q=0.8'
          }
   });
  fs.writeFileSync(dest, response.data);
}

async function ensureCache() {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  for (const key in imgMap) {
    const ext = key === "gif" ? "gif" : "jpg";
    const filePath = path.join(cacheDir, `${key}.${ext}`);
    await downloadImage(imgMap[key], filePath);
  }
}

module.exports.onLoad = async () => {
  await ensureCache();
}

module.exports.run = async function ({ args, event, api, Users }) {
  const { threadId, type, data } = event;
  const uid = data.uidFrom;
  const send = msg => api.sendMessage({ msg }, threadId, type);

  const userData = (await Users.getData(uid)).data;
  let money = userData.money;

  if (args.length === 0)
    return send("💡 Dùng: baucua bau:1000 cua:2000 ... hoặc allin");

  let bets = {};
  for (let arg of args) {
    let [animal, amount] = arg.split(":");
    animal = animal?.toLowerCase();
    if (!animalList.includes(animal)) continue;

    if (amount?.toLowerCase?.() === "allin") amount = money;
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) continue;
    bets[animal] = (bets[animal] || 0) + amount;
  }

  if (Object.keys(bets).length === 0) return send("⚠️ Không có cược hợp lệ.");

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
  if (totalBet > money) return send(`⚠️ Bạn không đủ tiền! Số dư: ${money.toLocaleString()}đ`);
  if (totalBet < 1000) return send("⚠️ Tổng cược tối thiểu là 1000đ!");

  const result = Array.from({ length: 3 }, () => animalList[Math.floor(Math.random() * animalList.length)]);
  const emojiResult = result.map(a => emojiMap[a]).join(" | ");

  const gifPath = path.join(cacheDir, "gif.gif");
  await api.sendMessage({ msg: "🎲 Đang lắc bầu cua...", attachments: gifPath, ttl: 3000 }, threadId, type);

  setTimeout(async () => {
    const images = await Promise.all(result.map(a => Jimp.read(path.join(cacheDir, `${a}.jpg`))));
    const width = images.reduce((w, img) => w + img.bitmap.width, 0);
    const height = images[0].bitmap.height;
    const final = new Jimp(width, height);
    let x = 0;
    for (const img of images) final.composite(img, x += 0, 0), x += img.bitmap.width;
    const resultPath = path.join(cacheDir, "result.jpg");
    await final.writeAsync(resultPath);

    let totalWin = 0;
    let totalTax = 0;
    let msg = `🎲 Kết quả: ${emojiResult}\n`;
    for (const [animal, betAmount] of Object.entries(bets)) {
      const count = result.filter(r => r === animal).length;
      if (count > 0) {
        const raw = count * betAmount;
        const tax = Math.floor(raw * taxRate);
        const net = raw - tax;
        totalWin += net;
        totalTax += tax;
        msg += `✅ ${emojiMap[animal]} x${count}: Thắng ${net.toLocaleString()}đ (bị trừ thuế ${tax.toLocaleString()}đ)\n`;
      } else {
        msg += `❌ ${emojiMap[animal]}: Thua ${betAmount.toLocaleString()}đ\n`;
      }
    }

    const finalMoney = money - totalBet + totalWin;
    userData.money = finalMoney;
    await Users.setData(uid, userData);

    msg += `\n💰 Tổng cược: ${totalBet.toLocaleString()}đ`;
    msg += `\n🏆 Tổng thắng: ${totalWin.toLocaleString()}đ`;
    msg += `\n📦 Số dư mới: ${finalMoney.toLocaleString()}đ`;

    api.sendMessage({ msg, attachments: resultPath, ttl: 15000 }, threadId, type);
  }, 5000);
};
