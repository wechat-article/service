import { generatePDf } from "./utils/pptr.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件的目录路径
const __dirname = path.dirname(__filename);
const rootDirectory = path.join(__dirname, "../resources");

// http://localhost:8080/2024-02-28/第三回小道具勾引成功一触便泄小美女兴奋追高被绿帽反扣/index.html
// await generatePDf("http://localhost:8080/2024-02-28/第三回小道具勾引成功一触便泄小美女兴奋追高被绿帽反扣/index.html", "1.pdf");

function findIndexHtmlFiles(dir, baseDir = dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search in subdirectories
      findIndexHtmlFiles(fullPath, baseDir, fileList);
    } else if (file === "index.html") {
      // Add index.html file to the list
      fileList.push(path.relative(baseDir, fullPath));
    }
  });

  return fileList;
}
const indexHtmlFiles = findIndexHtmlFiles(rootDirectory);
for (let i = 0; i < indexHtmlFiles.length; i++) {
  console.log(`(${i + 1}/${indexHtmlFiles.length}): 开始导出${indexHtmlFiles[i]}`);
  await generatePDf("http://localhost:8080/" + indexHtmlFiles[i], `output/${i}.pdf`);
}
