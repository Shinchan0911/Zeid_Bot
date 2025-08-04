# 🤖 Zeid Bot

**Zeid Bot** là một chatbot Zalo được phát triển bằng Node.js, dựa trên thư viện [ZCA-JS](https://github.com/RFS-ADRENO/zca-js)

> Nhóm Zalo giao lưu, hỗ trợ: [https://zalo.me/g/xwxdtp685](https://zalo.me/g/xwxdtp685)

> [!IMPORTANT]
> 🚧 **Zeid Bot** hiện đang trong quá trình phát triển.
> 
> Nếu bạn gặp bất kỳ sự cố, lỗi hoặc vấn đề nào trong quá trình sử dụng,  
> hãy **đóng góp** bằng cách báo lỗi hoặc gửi pull request.
>
> 💡 Chúng tôi luôn hoan nghênh mọi sự hỗ trợ từ cộng đồng!

---

## 📚 Tài liệu
📚 Xem tài liệu API tại: [https://tdung.gitbook.io/zca-js](https://tdung.gitbook.io/zca-js)

📚 Tải liệu Plugins

<details>
<summary>📁 Lệnh mẫu</summary>

```javascript
module.exports.config = {
    name: "example", // Tên của sự kiện
    event_type: ["message"], // Loại event, có thể nhận nhiều event 1 lúc
    version: "1.0.0", // Phiên bản của sự kiện
    author: "ShinTHL09 ", // Tác giả của sự kiện
    description: "Sự kiện mẫu", // Thông tin sự kiện
    dependencies: {} // Các thư viện cần thiết (Bot sẽ tự cài khi load sự kiện)
};

module.exports.handleEvent = async ({ api, event, eventType, Users, Threads }) => {
  console.log("đã có event xảy ra");
}

module.exports.onLoad =  async function({ api, Users, Threads }) {
  console.log("Sự kiện example đã được load");
}

// Bot nhại tin nhắn
module.exports.run = async function({ api, event, eventType, Users, threads }) {
    const { threaId, type, data } = event;
    const msg = data.content;
    return api.sendMessage(msg, threaId, type);
};
```

</details>

<details>
<summary>📁 Sự kiện mẫu</summary>

```javascript
module.exports.config = {
  name: 'example', // Tên của lệnh
  version: '1.0.0', // Phiên bản của lệnh
  role: 0, // Quyền hạn 0: thành viên, 1: support bot, 2: admin bot
  author: 'ShinTHL09', // Tác giả của lệnh
  description: 'Lệnh mẫu', // Thông tin lệnh
  category: 'Tiện ích', // Mục của lệnh
  usage: 'restart', // Cách dùng lệnh
  cooldowns: 2, // Thời gian hồi lệnh
  dependencies: {} // Các thư viện cần thiết (Bot sẽ tự cài khi load lệnh)
};

module.exports.onLoad = async ({ api, Users, Threads }) => {
  console.log("Lệnh example đã được load")
}

module.exports.run = async ({ args, event, api, Users, Thread }) => {
  const { threadId, type } = event;

  return api.sendMessage("Đây là lệnh mẫu", threadId, type);

};
```

</details>


<details>
<summary>📁 Các biến global</summary>

```js
global.client.config // Config bot
global.client.config.prefix // Prefix hiện tại

global.client.commands // Tất cả command
global.client.commands.get("example").config.author

global.client.events // Tất cả event
global.client.events.get("example").config.author

global.users.admin[0] // ID admin đầu tiên
global.users.support[0] // ID support đầu tiên
```

</details>


<details>
<summary>📁 Các hàm để cập nhật config</summary>

```js
const { updateConfigArray, updateConfigValue, reloadConfig } = require("../../utils/index");

updateConfigArray(key, newArray); // Sửa array trong config
// Example: updateConfigArray("admin_bot", ["1", "2"])

updateConfigValue(key, newValue); // Sửa giá trị trong config
// Example: updateConfigValue("prefix", "!")

reloadConfig();
// Reload lại file config
```
</details>

<details>
<summary>📁 Các hàm để xử lý media</summary>

```js
const { processVideo, processAudio } = require("../../utils/index");

processVideo(videoPath, threadId, type); // Xử lý video

processAudio(audioPath, threadId, type); // Xử lý audio
```
</details>


🗃️ Database (Users & Threads)

<details>
<summary>🧵 Threads</summary>

```js
await Thread.getData("id_box"); // Lấy dữ liệu
await Thread.setData("id_box", data_json); // Lưu dữ liệu
await Thread.getAll(); // Lấy tất cả dữ liệu

// Ví dụ
const databox = (await Thread.getData("id_box")).data;
databox.prefix = "!";
await Thread.setData("id_box", databox);
```
</details>

<details>
<summary>👤 Users</summary>

```js
await Users.getData("user_id"); // Lấy dữ liệu
await Users.setData("user_id", data_json); // Lưu dữ liệu
await Users.getAll(); // Lấy tất cả dữ liệu

// Ví dụ
const datauser = (await Users.getData("user_id")).data;
datauser.money = 1000;
await Users.setData("user_id", datauser);
```
</details>

---

## 🚀 Cài đặt

### 🔧 Yêu cầu

- **Node.js** phiên bản **v20 trở lên**

### 📦 Cài đặt Bot

```bash
git clone https://github.com/Shinchan0911/Zeid_Bot
cd zeid-bot
npm install
```

---

## 🔐 Đăng nhập Bot

### ✅ Cách 1: Đăng nhập bằng **QR Code**

1. Chạy bot bằng lệnh:
   ```bash
   npm start
   ```
2. Mở file `qr.png` được tạo trong thư mục bot và quét mã bằng ứng dụng Zalo
3. Sau khi đăng nhập thành công, bot sẽ tự động lưu **cookie** cho những lần đăng nhập tiếp theo

📘 Xem tài liệu chi tiết tại:  
👉 [https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-qrcode](https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-qrcode)

### ✅ Cách 2: Đăng nhập bằng **Cookie**

1. Tạo file `account.json` với nội dung:

   ```json
   {
     "imei": "Imei_Cua_Ban",
     "userAgent": "userAgent_Cua_Ban",
     "cookie": "cookie.json"
   }
   ```

2. Thay thế các giá trị `imei`, `userAgent`

3. Tạo file `cookie.json` và dán nội dung cookie Zalo vào
4. Chạy bot bằng lệnh:
   ```bash
   npm start
   ```

📘 Xem hướng dẫn chi tiết cách lấy cookie tại:  
👉 [https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie](https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie)

---

## 📄 Giấy phép

Phát hành theo giấy phép **MIT License**

---
