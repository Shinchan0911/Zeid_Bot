const handleCommand = require("./handle/handleCommand");
const handleEvent = require("./handle/handleEvent");
const logger = require("../utils/logger");

function startListening(api) {
  if (!api?.listener?.on || !api.listener.start) {
    logger.log("API listener không hợp lệ.", "error");
    return;
  }

  api.listener.on("message", (event) => {
    handleEvent("message", event, api);
    const { data } = event;
    const content = data.content;
    if (!content || typeof content !== "string") return;

    if (content.startsWith(global.config.prefix)) {
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
  logger.log("Bắt đầu nhận lệnh", "info");
}

module.exports = startListening;
