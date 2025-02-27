const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../database.json");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ documents: {} }, null, 2));
}

function loadDatabase() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

async function createDocument(title, content) {
  const db = loadDatabase();
  const id = Date.now().toString();
  db.documents[id] = { id, title, content };
  saveDatabase(db);
  return db.documents[id];
}

async function getDocument(id) {
  const db = loadDatabase();
  return db.documents[id] || null;
}

async function deleteDocument(id) {
  const db = loadDatabase();
  delete db.documents[id];
  saveDatabase(db);
}

async function saveDocument(id, content, user) {
  const db = loadDatabase();
  if (!db.documents[id]) return null;

  // **检查用户权限**
  // if (db.documents[id].owner !== user) return "无权限";

  // 生成新版本
  if (!db.documents[id].history) {
    db.documents[id].history = [];
  }
  db.documents[id].history.push({
    timestamp: new Date().toISOString(),
    content: db.documents[id].content,
  });

  db.documents[id].content = content;
  saveDatabase(db);
  // return db.documents[id];
  // 保存文档的逻辑
  const updatedDoc = { id, content, owner: user, updatedAt: new Date() }; // 示例
  // 可能是保存到数据库或者文件等地方
  return updatedDoc;
}

async function getDocumentVersions(id) {
  const db = loadDatabase();
  return db.documents[id]?.history || [];
}

module.exports = {
  loadDatabase,
  getDocument,
  saveDocument,
  createDocument,
  deleteDocument,
  getDocumentVersions,
};
