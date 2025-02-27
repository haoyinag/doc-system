const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
// const multer = require("multer");
const multer = require("@koa/multer");

const dbPath = path.join(__dirname, "../../users.json");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储方式
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.username}${ext}`);
  },
});

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2));
}

// 加载用户数据
function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

// 保存用户数据
function saveUsers(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// 注册用户
async function createUser(username, password) {
  const db = loadUsers();

  if (db.users && db.users[username]) {
    return { error: "用户已存在" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.users[username] = { username, password: hashedPassword };
  saveUsers(db);

  return { success: true };
}

// 验证用户登录
async function authenticateUser(username, password) {
  const db = loadUsers();
  const user = db.users[username];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "用户名或密码错误" };
  }

  return { success: true };
}

async function changePassword(username, oldPassword, newPassword) {
  const db = loadUsers();
  const user = db.users[username];

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    return { error: "旧密码错误" };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  db.users[username].password = hashedNewPassword;
  saveUsers(db);

  return { success: true };
}

const upload = multer({ storage });

module.exports = {
  createUser,
  saveUsers,
  authenticateUser,
  changePassword,
  upload,
};
