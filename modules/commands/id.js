module.exports.config = {
    name: "id",
    version: "1.3.0",
    role: 0,
    author: "NLam182",
    description: "Lấy userId, globalId của người dùng, hoặc ID nhóm.",
    category: "Tiện ích",
    usage: "id | id [số điện thoại] | id box | id @user (nhiều tag)",
    cooldowns: 5,
    dependencies: {}
};

const { ThreadType } = require("zca-js");

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type, data } = event;

    if (args[0]?.toLowerCase() === "box") {
        if (type === ThreadType.Group) {
            try {
                const groupInfo = await api.getGroupInfo(threadId);
                const details = groupInfo.gridInfoMap?.[threadId];
                const groupName = details?.name || "Không rõ tên nhóm";
                return api.sendMessage(`🧩 Tên nhóm: ${groupName}\n🆔 ID nhóm: ${threadId}`, threadId, type);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin nhóm:", err);
                return api.sendMessage("❌ Không thể lấy thông tin nhóm hiện tại.", threadId, type);
            }
        } else {
            return api.sendMessage("❌ Lệnh này chỉ sử dụng trong nhóm.", threadId, type);
        }
    }

    const mentions = data.mentions;
    if (mentions && mentions.length > 0) {
        const list = await Promise.all(mentions.map(async m => {
            const uid = m.uid;
            try {
                const info = await api.getUserInfo(uid);
                const profile = info?.changed_profiles?.[uid];
                const name = profile?.displayName || "Không rõ tên";
                const globalId = profile?.globalId || "Không có";
                return `👤 ${name} - ${uid}\n🌐 GlobalID: ${globalId}`;
            } catch {
                return `👤 (Không thể lấy tên) - ${uid}`;
            }
        }));
        return api.sendMessage(`📌 Thông tin người được tag:\n\n${list.join("\n\n")}`, threadId, type);
    }

    if (args.length === 0) {
        try {
            const senderId = data.uidFrom;
            const info = await api.getUserInfo(senderId);
            const profile = info?.changed_profiles?.[senderId];

            if (!profile) throw new Error("Không tìm thấy hồ sơ người dùng");

            const name = profile.displayName || "Không rõ tên";
            const globalId = profile.globalId || "Không có";

            return api.sendMessage(`🙋‍♂️ Tên bạn: ${name}\n🆔 UID: ${senderId}\n🌐 GlobalID: ${globalId}`, threadId, type);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin bản thân:", error);
            return api.sendMessage("❌ Không thể lấy thông tin của bạn.", threadId, type);
        }
    }

    const phoneNumber = args[0];
    try {
        const userInfo = await api.findUser(phoneNumber);
        if (userInfo?.uid) {
            const uid = userInfo.uid;
            const info = await api.getUserInfo(uid);
            const profile = info?.changed_profiles?.[uid];

            const name = profile?.displayName || "Không rõ tên";
            const globalId = profile?.globalId || "Không có";

            await api.sendMessage(`📞 Tìm thấy người dùng:\n👤 ${name} - ${uid}\n🌐 GlobalID: ${globalId}`, threadId, type);
            return await api.sendCard({
                userId: uid,
                phoneNumber
            }, threadId, type);
        } else {
            return api.sendMessage(`❌ Không tìm thấy người dùng với SĐT "${phoneNumber}".`, threadId, type);
        }
    } catch (err) {
        console.error(`Lỗi khi tìm theo số điện thoại ${phoneNumber}:`, err);
        return api.sendMessage("❌ Có lỗi khi tìm kiếm số điện thoại.", threadId, type);
    }
};
