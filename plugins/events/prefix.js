module.exports.config = {
    name: "prefix",
    event_type: ["message"],
    version: "1.0.0",
    author: "ShinTHL09",
    description: "Xem prefix bot"
};

module.exports.run = async function({ api, event, Threads }) {
    const { threadId, type } = event;

    const { prefix } = global.config;

    var threadSetting = (await Threads.getData(event.threadId)).data || {};

    let prefixThread = threadSetting.prefix || prefix;

    const lowerBody = event.data.content.toLowerCase();

    if (
        lowerBody === "prefix" ||
        lowerBody === "prefix bot là gì" ||
        lowerBody === "quên prefix r" ||
        lowerBody === "dùng sao"
    ) {
        api.sendMessage(
        `✏️ Prefix của nhóm: ${prefixThread}\n📎 Prefix hệ thống: ${prefix}`,
        threadId,
        type
    );
  }

};
