const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.vue') || file.endsWith('.js')) {
      fixFile(fullPath);
    }
  });
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  // 替换中文冒号为英文冒号
  content = content.replace(/：/g, ':');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('已修复: ' + filePath);
  }
}

const srcPath = path.join(__dirname, 'frontend', 'src');
walkDir(srcPath);
console.log('修复完成！');