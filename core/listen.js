const handleCommand = require("./handle/handleCommand");
const logger = require("../utils/logger");

function handleEvent(eventType, eventData, api) {
  for (const [name, eventModule] of global.client.events) {
    const targetEvents = eventModule.config.event_type;
    if (Array.isArray(targetEvents) && targetEvents.includes(eventType)) {
      try {
        if (typeof eventModule.run === "function") {
          eventModule.run({ api, event: eventData, eventType });
        }
      } catch (err) {
        logger.log(`Lỗi khi xử lý event ${eventType} tại module ${name}: ${err.message}`, "error");
      }
    }
  }
}

function startListening(api) {
  if (!api?.listener?.on || !api.listener.start) {
    logger.log("API listener không hợp lệ.", "error");
    return;
  }

  api.listener.on("message", (event) => {
    handleEvent("message", event, api);

    const { data } = event;
    const content = data?.content;
    if (typeof content === "string" && content.startsWith(global.config.prefix)) {
      handleCommand(content, event, api);
    }
  });

  api.listener.on("group_event", (event) => {
    handleEvent("group_event", event, api);
  });

  api.listener.on("reaction", (event) => {
    handleEvent("reaction", event, api);
  });

  api.listener.on("undo", (event) => {
    handleEvent("undo", event, api);
  });

  api.listener.start();
  logger.log("✅ Đã bắt đầu lắng nghe sự kiện", "info");
}

module.exports = startListening;
