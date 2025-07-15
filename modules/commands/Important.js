// sử dụng để test

module.exports.config = {
  name: 'important',
  version: '1.0.0',
  role: 2,
  author: 'shinthl09',
  description: 'gửi tin nhắn quan trọng',
  category: 'Hệ thống',
  usage: 'important <nội dung>',
  cooldowns: 3,
  dependencies: {}
};

const { Urgency, TextStyle } = require("zca-js");

module.exports.run = ({ args, message, event, api }) => {
    if (args.length == 0) return api.sendMessage("Vui lòng nhập nội dung", event.threadId, event.type);

    const text = args[0];
    api.sendMessage({msg: text,
    urgency: Urgency.Important,
    styles: [
        {
            start: 0,
            len: text.length,
            st: TextStyle.Bold // in đậm
        },
        {
            start: 0,
            len: text.length,
            st: TextStyle.Red // màu đỏ
        },
        {
            start: 0,
            len: text.length,
            st: TextStyle.Big // cỡ chữ lớn
        }
    ]}, event.threadId, event.type);
};
