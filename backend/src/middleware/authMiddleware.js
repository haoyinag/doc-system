const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "secret_key";

module.exports = async (ctx, next) => { 
  if (ctx.url === "/auth/login" || ctx.url === "/auth/register") {
    await next();
  } else {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = { error: "未授权访问" };
      return;
    }
    const token = authHeader.split(" ")[1]; 
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY); // 替换为你的 JWT 密钥
      ctx.state.user = decoded;
      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = { error: "无效的 Token，请重新登录" };
    }
  }
};
