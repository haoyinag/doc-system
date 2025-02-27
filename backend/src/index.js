require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors"); 
const http = require("http");
const serve = require("koa-static");
const path = require("path");
const { setupWebSocket } = require("./websocket");
const docRoutes = require("./routes/documentRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());

app.use(cors()); 
app.use(bodyParser());
// ✅ 保护所有 API（需要身份验证）
app.use(authMiddleware);
app.use(router.routes()).use(router.allowedMethods());

// ✅ 提供 `uploads/` 目录的静态访问权限
app.use(serve(path.join(__dirname, "../uploads")));

router.use("/api", docRoutes.routes());
router.use("/auth", authRoutes.routes());

setupWebSocket(server);

server.listen(3001, () => {
  console.log("✅ 后端服务器运行在 http://localhost:3001");
});
