# 🤖 Zeid Bot

**Zeid Bot** là một chatbot Zalo được phát triển bằng Node.js, dựa trên thư viện [ZCA-JS](https://github.com/RFS-ADRENO/zca-js)

📚 Xem tài liệu API tại: [https://tdung.gitbook.io/zca-js](https://tdung.gitbook.io/zca-js)

<details>
<summary>📁 Ví dụ về lệnh</summary>

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


module.exports.run = async ({ args, event, api, Users, Thread }) => {
  const { threadId, type } = event;

  return api.sendMessage("Đây là lệnh mẫu", threadId, type);

};
```

</details>

<details>
<summary>📁 Ví dụ về sự kiện</summary>

```javascript 
module.exports.config = {
    name: "example", // Tên của sự kiện
    event_type: ["message"], // Loại event, có thể nhận nhiều event 1 lúc
    version: "1.0.0", // Phiên bản của sự kiện
    author: "ShinTHL09 ", // Tác giả của sự kiện
    description: "Sự kiện mẫu", // Thông tin sự kiện
    dependencies: {} // Các thư viện cần thiết (Bot sẽ tự cài khi load sự kiện)
};

// Bot nhại tin nhắn
module.exports.run = async function({ api, event, eventType, Users, threads }) {
    const { threaId, type, data } = event;
    const msg = data.content;
    return api.sendMessage(msg, threaId, type);
};
```

</details>

<details>
<summary>📦 Tài liệu về Database (Threads & Users)</summary>

### 🧵 Threads

- **Lấy dữ liệu box:**
  ```js
  await Thread.getData("id_box");
  ```

- **Lưu dữ liệu box:**
  ```js
  await Thread.saveData("id_box", data_json);
  ```

- 🔹 **Ví dụ lấy dữ liệu:**
  ```js
  const databox = (await Thread.getData("id_box")).data;
  ```

  **Response:**
  ```json
  {
    "ban": false,
    "admin_only": false,
    "support_only": false,
    "box_only": false,
    "prefix": "/"
  }
  ```

- 🔹 **Ví dụ đổi prefix:**
  ```js
  const databox = (await Thread.getData("id_box")).data;
  databox.prefix = "!";
  return Thread.saveData("id_box", databox);
  ```

---

### 👤 Users

- **Lấy dữ liệu user:**
  ```js
  await Users.getData("user_id");
  ```

- **Lưu dữ liệu user:**
  ```js
  await Users.saveData("user_id", data_json);
  ```

- 🔹 **Ví dụ lấy dữ liệu:**
  ```js
  const datauser = (await Users.getData("user_id")).data;
  ```

  **Response:**
  ```json
  {
    "ban": false,
    "money": 0
  }
  ```

- 🔹 **Ví dụ đổi tiền:**
  ```js
  const datauser = (await Users.getData("user_id")).data;
  datauser.money = 1000;
  return Users.saveData("user_id", datauser);
  ```

</details>

---

## 📌 Important

> 🚧 Dự án **Zeid Bot** hiện đang trong quá trình phát triển.  
>  
> Nếu bạn gặp bất kỳ sự cố, lỗi hoặc vấn đề nào trong quá trình sử dụng,  
> **hãy đóng góp** bằng cách báo lỗi hoặc gửi pull request.  
>  
> Chúng tôi luôn hoan nghênh mọi sự hỗ trợ từ cộng đồng!

---

## 🚀 Cài đặt

### 🔧 Yêu cầu

- **Node.js** phiên bản **v20 trở lên**

---

### 📦 Cài đặt Bot

```bash
git clone https://github.com/ten-ban/zalo-bot.git
cd zalo-bot
npm install
```

---

## 🔐 Đăng nhập Bot

### ✅ Cách 1: Đăng nhập bằng **QR Code**

1. Chạy bot bằng lệnh:
   ```bash
   node index.js
   ```
2. Mở file `qr.png` được tạo trong thư mục bot và quét mã bằng ứng dụng Zalo
3. Sau khi đăng nhập thành công, bot sẽ tự động lưu **cookie** cho những lần đăng nhập tiếp theo

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

2. Thay thế các giá trị `imei`, `userAgent`

3. Tạo file `cookie.json` và dán nội dung cookie Zalo vào

📘 Xem hướng dẫn chi tiết cách lấy cookie tại:  
👉 [https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie](https://tdung.gitbook.io/zca-js/dang-nhap/dang-nhap-voi-cookie)

---

## 📄 Giấy phép

Phát hành theo giấy phép **MIT License**

---
