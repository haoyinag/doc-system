const WebSocket = require("ws");
const { getDocument, saveDocument } = require("./services/documentService");

const clients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const docId = new URL(
      req.url,
      `http://${req.headers.host}`
    ).searchParams.get("docId");

    if (!docId) {
      ws.close();
      return;
    }

    if (!clients.has(docId)) {
      clients.set(docId, new Set());
    }
    clients.get(docId).add(ws);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        await saveDocument(docId, data.content);

        clients.get(docId).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "update", content: data.content })
            );
          }
        });
      } catch (err) {
        console.error("WebSocket Error:", err);
      }
    });

    ws.on("close", () => {
      clients.get(docId)?.delete(ws);
      if (clients.get(docId)?.size === 0) {
        clients.delete(docId);
      }
    });
  });

  console.log("WebSocket Server is running...");
}

module.exports = { setupWebSocket };
