const logger = require("../../utils/logger");

const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

function handleEvent(eventType, eventData, api) {
  for (const [name, eventModule] of global.client.events) {
    const targetEvents = eventModule.config.event_type;
    if (Array.isArray(targetEvents) && targetEvents.includes(eventType)) {
      try {
        if (typeof eventModule.run === "function") {
          const replyData = { content: eventData.data.content, msgType: eventData.data.msgType, propertyExt: eventData.data.propertyExt, uidFrom: eventData.data.uidFrom, msgId: eventData.data.msgId, cliMsgId: eventData.data.cliMsgId, ts: eventData.data.ts, ttl: eventData.data.ttl };
          eventModule.run({ api, event: eventData, eventType, Users, Threads, replyData });
        }
      } catch (err) {
        logger.log(`Lỗi khi xử lý event ${eventType} tại module ${name}: ${err.message}`, "error");
      }
    }
  }

  for (const [name, commandModule] of global.client.commands) {
    if (typeof commandModule.handleEvent === "function") {
      try {
        const replyData = { content: eventData.data.content, msgType: eventData.data.msgType, propertyExt: eventData.data.propertyExt, uidFrom: eventData.data.uidFrom, msgId: eventData.data.msgId, cliMsgId: eventData.data.cliMsgId, ts: eventData.data.ts, ttl: eventData.data.ttl };
        commandModule.handleEvent({ api, event: eventData, eventType, Users, Threads, replyData });
      } catch (err) {
        logger.log(`Lỗi khi xử lý handleEvent trong command ${name}: ${err.message}`, "error");
      }
    }
  }
}

module.exports = handleEvent;