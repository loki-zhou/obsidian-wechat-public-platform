---
title: "代码块测试文档"
author: "测试用户"
digest: "测试微信公众号代码块显示效果"
banner: "public/obsidian-wechat.png"
---

# 微信公众号代码块测试

这个文档用于测试修复后的代码块在微信公众号中的显示效果。

## 行内代码测试

这是一个行内代码示例：`console.log('Hello World')`，应该能正常显示。

## JavaScript 代码块

```javascript
// 这是一个 JavaScript 函数
function greetUser(name) {
    if (!name) {
        console.log('请输入用户名');
        return;
    }
    
    const greeting = `你好，${name}！`;
    console.log(greeting);
    
    // 返回问候语
    return greeting;
}

// 调用函数
greetUser('张三');
```

## Python 代码块

```python
# Python 示例代码
def calculate_fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    
    return b

# 测试函数
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

## HTML/CSS 代码块

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>测试页面</title>
    <style>
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .highlight {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎使用 Obsidian 微信公众号插件</h1>
        <p class="highlight">这个插件可以帮助你轻松发布内容到微信公众号。</p>
    </div>
</body>
</html>
```

## SQL 代码块

```sql
-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO users (username, email) VALUES 
    ('张三', 'zhangsan@example.com'),
    ('李四', 'lisi@example.com'),
    ('王五', 'wangwu@example.com');

-- 查询用户信息
SELECT id, username, email, 
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_time
FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
```

## 长代码行测试

```javascript
// 测试长代码行的换行效果
const veryLongVariableName = "这是一个非常长的字符串，用来测试代码块在微信公众号中的换行效果，确保内容不会被截断或显示异常";

function processLongParameterFunction(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive) {
    return `处理结果: ${parameterOne} + ${parameterTwo} + ${parameterThree} + ${parameterFour} + ${parameterFive}`;
}
```

## 特殊字符测试

```bash
# 包含特殊字符的命令
echo "测试 <特殊字符> & 符号处理"
grep -r "pattern" /path/to/directory --include="*.js" --exclude-dir=node_modules
curl -X POST "https://api.example.com/data" -H "Content-Type: application/json" -d '{"key": "value"}'
```

## 测试说明

修复后的代码块应该具有以下特点：

1. **保持格式**：代码的缩进和换行应该被正确保留
2. **语法高亮**：不同类型的代码应该有适当的颜色区分
3. **微信兼容**：在微信公众号编辑器中不会被过滤或丢失
4. **响应式**：在不同设备上都能正常显示
5. **可读性**：字体和间距适合阅读

如果你看到这些代码块都能正常显示，说明修复已经生效！