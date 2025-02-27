const Router = require("koa-router");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const multer = require("@koa/multer");
const {
  saveUsers,
  createUser,
  authenticateUser,
} = require("../services/userService");

const router = new Router();
const upload = multer({ dest: "uploads/" });

const dbPath = path.join(__dirname, "../../users.json");
const SECRET_KEY = process.env.JWT_SECRET || "secret_key";

const extractToken = (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

// **加载数据库**
function loadDatabase() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// 用户注册
router.post("/register", async (ctx) => {
  const db = loadDatabase();

  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { error: "用户名和密码不能为空" };
    return;
  }

  if (db.users && db.users[username]) {
    ctx.status = 400;
    ctx.body = { error: "用户已存在" };
    return;
  }

  const result = await createUser(username, password);

  if (result.error) {
    ctx.status = 400;
    ctx.body = { error: result.error };
  } else {
    ctx.body = { success: true };
    const hashedPassword = await bcrypt.hash(password, 10); // ✅ 加密密码

    db.users[username] = { username, password: hashedPassword };
    saveDatabase(db);
  }
});

// 用户登录
router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  const db = loadDatabase();

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { error: "用户名和密码不能为空" };
    return;
  }

  const storedUser = db.users[username];

  if (!storedUser) {
    ctx.status = 401;
    ctx.body = { error: "用户名或密码错误" };
    return;
  }

  const passwordMatch = await bcrypt.compare(password, storedUser.password);

  const result = await authenticateUser(username, password);
  if (result.error) {
    ctx.status = 401;
    ctx.body = { error: result.error, success: false };
  } else if (!passwordMatch) {
    ctx.status = 401;
    ctx.body = { error: "用户名或密码错误", success: false };
    return;
  } else {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    ctx.body = { token, success: true };
  }
});

// 获取当前用户信息
router.get("/me", async (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: "未授权" };
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, SECRET_KEY);
    ctx.body = { username: user.username };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "无效的 Token" };
  }
});

// 修改密码
router.post("/change-password", async (ctx) => {
  const { oldPassword, newPassword } = ctx.request.body;
  const token = extractToken(ctx);

  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "未授权" };
    return;
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    const result = await changePassword(
      user.username,
      oldPassword,
      newPassword
    );

    if (result.error) {
      ctx.status = 400;
      ctx.body = { error: result.error };
    } else {
      ctx.body = { success: true };
    }
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "无效的 Token" };
  }
});

// ✅ **确保 `multer` 只在 `upload-avatar` 路由内生效**
router.post("/upload-avatar", upload.single("avatar"), async (ctx) => {
  if (!ctx.file) {
    ctx.status = 400;
    ctx.body = { error: "文件上传失败" };
    return;
  }

  const ext = path.extname(ctx.file.originalname) || ".png";
  const newFileName = `${ctx.file.filename}${ext}`;
  const newFilePath = path.join("uploads", newFileName);

  fs.renameSync(ctx.file.path, newFilePath);

  ctx.body = { avatarUrl: `/uploads/${newFileName}` };

  // 获取用户信息并更新头像路径
  const db = loadDatabase();
  const username = ctx.state.user.username; // 获取当前用户
  const user = db.users[username];
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "用户未找到" };
    return;
  }

  user.avatar = avatarUrl; // 保存头像路径到用户信息
  saveUsers(db); // 更新数据库

  ctx.body = { avatarUrl }; // 返回头像路径
});

// ✅ **修正头像获取 API**
router.get("/avatar/:filename", async (ctx) => {
  const filePath = path.join(__dirname, "../../uploads", ctx.params.filename);

  if (fs.existsSync(filePath)) {
    ctx.type = "image/png";
    ctx.body = fs.createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = { error: "头像未上传" };
  }
});

module.exports = router;
