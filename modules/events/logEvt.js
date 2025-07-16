module.exports.config = {
    name: "logEvt",
    event_type: ["group_event", "undo", "message", "reaction"],
    version: "1.0.0",
    author: "NLam182",
    description: "Lắng nghe và ghi lại sự kiện ra console"
};

module.exports.run = async function({ api, event, eventType }) {
    try {
        const eventDataString = JSON.stringify(event, null, 2);
        console.log(eventDataString);
    } catch (error) {
        console.error(`Lỗi khi xử lý sự kiện ${eventType}:`, error);
    }
};