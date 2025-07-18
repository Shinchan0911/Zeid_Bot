
# 🤖 Zeid Bot

**Zeid Bot** là một chatbot Zalo được phát triển bằng **Node.js**, sử dụng thư viện [ZCA-JS](https://github.com/RFS-ADRENO/zca-js).

📚 **Tài liệu API**: [https://tdung.gitbook.io/zca-js](https://tdung.gitbook.io/zca-js)

---

## 📦 Cài đặt

### 🔧 Yêu cầu
- Node.js **v20** hoặc mới hơn

### 🚀 Cài đặt Bot

```bash
git clone https://github.com/Shinchan0911/Zeid_Bot
cd zalo-bot
npm install
```

---

## 🔐 Đăng nhập Bot

### ✅ Cách 1: Đăng nhập bằng **QR Code**

```bash
npm start
```

- Mở file `qr.png` được tạo sau khi chạy bot
- Dùng ứng dụng **Zalo** để quét mã
- Bot sẽ tự lưu **cookie** cho các lần chạy sau

---

### ✅ Cách 2: Đăng nhập bằng **Cookie**

1. Tạo file `account.json` với nội dung:

```json
{
  "imei": "Imei_Cua_Ban",
  "userAgent": "userAgent_Cua_Ban",
  "cookie": "cookie.json"
}
```

2. Thêm file `cookie.json` và dán nội dung cookie Zalo

3. Chạy bot:

```bash
npm start
```

📘 Hướng dẫn lấy cookie:  
👉 [https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie](https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie)

---

## 📁 Ví dụ về lệnh

<details>
<summary>📁 Lệnh mẫu</summary>

```javascript
module.exports.config = {
  name: 'example',
  version: '1.0.0',
  role: 0,
  author: 'ShinTHL09',
  description: 'Lệnh mẫu',
  category: 'Tiện ích',
  usage: 'restart',
  cooldowns: 2,
  dependencies: {}
};

module.exports.onLoad = async function({ api }) {
  console.log("Lệnh example đã được load");
};

module.exports.run = async ({ args, event, api, Users, Thread }) => {
  const { threadId, type } = event;
  return api.sendMessage("Đây là lệnh mẫu", threadId, type);
};
```

</details>

---

## 📁 Ví dụ về sự kiện

<details>
<summary>📁 Sự kiện mẫu</summary>

```javascript
module.exports.config = {
  name: "example",
  event_type: ["message"],
  version: "1.0.0",
  author: "ShinTHL09",
  description: "Sự kiện mẫu",
  dependencies: {}
};

module.exports.onLoad = async function({ api }) {
  console.log("Sự kiện example đã được load");
};

module.exports.run = async function({ api, event, eventType, Users, threads }) {
  const { threaId, type, data } = event;
  const msg = data.content;
  return api.sendMessage(msg, threaId, type);
};
```

</details>

---

## 🌐 Biến toàn cục

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

---

## ⚙️ Cập nhật config

<details>
<summary>📁 Các hàm để cập nhật config</summary>

```js
const { updateConfigArray, updateConfigValue, reloadConfig } = require("../../utils/index");

updateConfigArray(key, newArray);
// Example: updateConfigArray("admin_bot", ["1", "2"])

updateConfigValue(key, newValue);
// Example: updateConfigValue("prefix", "1")

reloadConfig();
// Reload lại file config
```
</details>

---

## 🗃️ Database (Users & Threads)

<details>
<summary>🧵 Threads</summary>

```js
await Thread.getData("id_box"); // Lấy dữ liệu
await Thread.saveData("id_box", data_json); // Lưu dữ liệu

// Ví dụ
const databox = (await Thread.getData("id_box")).data;
databox.prefix = "!";
await Thread.saveData("id_box", databox);
```
</details>

<details>
<summary>👤 Users</summary>

```js
await Users.getData("user_id"); // Lấy dữ liệu
await Users.saveData("user_id", data_json); // Lưu dữ liệu

// Ví dụ
const datauser = (await Users.getData("user_id")).data;
datauser.money = 1000;
await Users.saveData("user_id", datauser);
```
</details>

---

## 📌 Important

> 🚧 Dự án **Zeid Bot** hiện đang trong quá trình phát triển.  
> Nếu bạn gặp sự cố, lỗi hoặc vấn đề nào, hãy **đóng góp** bằng cách báo lỗi hoặc gửi pull request.  
> Chúng tôi luôn hoan nghênh mọi sự hỗ trợ từ cộng đồng!

---

## 📄 Giấy phép

Phát hành theo giấy phép **MIT License**
