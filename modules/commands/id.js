module.exports.config = {
    name: "id",
    version: "1.0.0",
    role: 0,
    author: "NLam182",
    description: "Lấy userId của người dùng, hoặc ID của nhóm chat.",
    category: "Tiện ích",
    usage: "id | id [số điện thoại] | id box",
    cooldowns: 5,
    dependencies: {}
};
const { ThreadType } = require("zca-js");
module.exports.run = async ({
    args,
    event,
    api
}) => {
    const {
        threadId,
        type,
        data
    } = event;

    if (args[0] === 'box') {
        if (type === ThreadType.Group) {
            await api.sendMessage(`ID của nhóm này là: ${threadId}`, threadId, type);
        } else {
            await api.sendMessage("Lệnh này chỉ có thể sử dụng trong nhóm chat.", threadId, type);
        }
        return;
    }

    if (args.length === 0) {
        try {
            const senderId = data.uidFrom;
            await api.sendMessage(`ID của bạn là: ${senderId}`, threadId, type);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin cá nhân:", error);
            await api.sendMessage("Đã xảy ra lỗi khi lấy thông tin của bạn. Vui lòng thử lại!", threadId, type);
        }
        return;
    }

    const phoneNumber = args[0];
    try {
        const userInfo = await api.findUser(phoneNumber);

        if (userInfo && userInfo.uid) {
            const targetId = userInfo.uid;
            await api.sendMessage(`Tìm thấy người dùng với SĐT ${phoneNumber}!\nID: ${targetId}`, threadId, type);
            await api.sendCard({
                userId: targetId,
                phoneNumber: phoneNumber
            }, threadId, type);
        } else {
            await api.sendMessage(`Không tìm thấy người dùng nào với số điện thoại "${phoneNumber}".`, threadId, type);
        }
    } catch (error) {
        console.error(`Lỗi khi tìm kiếm SĐT ${phoneNumber}:`, error);
        await api.sendMessage("Đã có lỗi xảy ra trong quá trình tìm kiếm. Có thể SĐT không hợp lệ.", threadId, type);
    }
};