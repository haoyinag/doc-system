const Router = require("koa-router");
const {
  createDocument,
  getDocument,
  saveDocument,
  deleteDocument,
} = require("../services/documentService");
const jwt = require("jsonwebtoken");

const router = new Router();

// **获取所有文档**
router.get("/documents", async (ctx) => {
  const db = require("../services/documentService").loadDatabase();
  ctx.body = Object.values(db.documents);
});

// **创建新文档**
router.post("/documents", async (ctx) => {
  const { title } = ctx.request.body;
  const user = ctx.state.user.username; // ✅ 确保用户身份
  const newDoc = createDocument(title, "", user);
  ctx.body = newDoc;
});

// **获取单个文档**
router.get("/documents/:id", async (ctx) => {
  const doc = getDocument(ctx.params.id);
  if (!doc) {
    ctx.status = 404;
    ctx.body = { error: "文档不存在" };
  } else {
    ctx.body = doc;
  }
});

// **更新文档（仅允许所有者）**
router.put("/documents/:id", async (ctx) => {
  const user = ctx.state.user.username;
  const { content } = ctx.request.body;
  const doc = getDocument(ctx.params.id);

  if (!doc) {
    ctx.status = 404;
    ctx.body = { error: "文档不存在" };
    return;
  }

  if (doc.owner !== user) {
    ctx.status = 403;
    ctx.body = { error: "无权限修改此文档" };
    return;
  }

  const updatedDoc = saveDocument(ctx.params.id, content, user);
  ctx.body = updatedDoc;
});

// **删除文档（仅允许所有者）**
router.delete("/documents/:id", async (ctx) => {
  const user = ctx.state.user.username;
  const doc = getDocument(ctx.params.id);

  if (!doc) {
    ctx.status = 404;
    ctx.body = { error: "文档不存在" };
    return;
  }

  if (doc.owner !== user) {
    ctx.status = 403;
    ctx.body = { error: "无权限删除此文档" };
    return;
  }

  deleteDocument(ctx.params.id, user);
  ctx.body = { success: true };
});

module.exports = router;
