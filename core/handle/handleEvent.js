const logger = require("../../utils/logger");

function handleEvent(eventType, event_input, api) {
  const events = global.client.events.get(eventType.toLowerCase());
  if (!events || events.length === 0) return;

  for (const event of events) {
    try {
      event.run({
        api: api,       
        event: event_input,
      });
    } catch (err) {
      const name = event.config?.name || "unknown";
      logger.log(`lỗi khi thực hiện event "${name}": ${err.message}`, 'error');
    }
  }
}

module.exports = handleEvent;