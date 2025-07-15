module.exports.config = {
    event_type: "message",
    name: "log",
    version: "1.0.0",
    author: "ShinTHL09",
    description: "Log tin nhắn lên console",
    dependencies: {
        "moment-timezone": ""
    }
};

module.exports.run = async function({ api, event }) {
    const moment = require("moment-timezone");
    const logger = require("../../utils/logger");

    const time = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY HH:mm:ss");

    const groupInfo = await api.getGroupInfo(event.threadId);
    const groupName = groupInfo.gridInfoMap[event.threadId].name ||"Tên không tồn tại";
    const senderName = event.data.dName;
    const content = event.data.content;
    
    var message = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 Nhóm: ${groupName}
 Người dùng: ${senderName}
 Nội dung: ${content}\n
 Thời gian: ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`
    return logger.log(message);
}