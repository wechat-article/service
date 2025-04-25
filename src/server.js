import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件的目录路径
const __dirname = path.dirname(__filename);

// 设置映射的根目录
const baseDirectory = path.resolve(__dirname, "../resources");

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 解析请求路径，确保不会逃出 baseDirectory
  const safePath = path.normalize(path.join(baseDirectory, req.url));
  if (!safePath.startsWith(baseDirectory)) {
    res.writeHead(403, { "Content-Type": "text/html" });
    res.end("<h1>403 Forbidden</h1>", "utf-8");
    return;
  }

  let filePath = decodeURIComponent(safePath);

  // 如果请求的是目录，默认返回 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  // 获取文件的扩展名并设置内容类型
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".svg": "application/image/svg+xml",
  };

  const contentType = mimeTypes[extname] || "application/octet-stream";

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        // 文件不存在，返回 404
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>", "utf-8");
      } else {
        // 其他错误，返回 500
        res.writeHead(500);
        res.end(`Sorry, there was an error: ${error.code} ..\n`);
      }
    } else {
      // 成功读取文件，返回内容
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

// 启动服务器，监听端口 8080
server.listen(8080, () => {
  console.log("Server running at http://localhost:8080/");
  console.log(`Serving files from: ${baseDirectory}`);
});
