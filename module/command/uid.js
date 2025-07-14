// sử dụng để test

module.exports.config = {
  name: 'uid',
  version: '1.0.0',
  role: 0,
  author: 'shinthl09',
  description: 'lấy uid của chính bản thân',
  category: 'Hệ thống',
  usage: 'uid',
  cooldowns: 3,
  dependencies: {}
};

module.exports.run = ({ args, message, event, api }) => {
    api.sendMessage("UID: " + event.data.uidFrom, event.threadId, event.type);
};
