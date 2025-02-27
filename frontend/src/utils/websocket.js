import { useDocumentStore } from "../store/index";

const socket = new WebSocket("ws://localhost:3001");

socket.onmessage = (event) => {
  const store = useDocumentStore();
  const data = JSON.parse(event.data);
  console.log("文档更新:", data);
  if (data.type === "update") {
    store.currentDocument.content = data.content;
  }
};

export function sendUpdate(content) {
  socket.send(JSON.stringify({ content }));
}

export default socket;
