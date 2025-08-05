# 测试代码块渲染

这是一个测试文档，用来验证微信公众号兼容的代码块渲染效果。

## JavaScript 代码示例

```javascript
// 这是一个简单的 JavaScript 函数
function greetUser(name) {
    if (!name) {
        console.log('请提供用户名');
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

## Python 代码示例

```python
# Python 示例代码
def calculate_fibonacci(n):
    """计算斐波那契数列的第n项"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    
    return b

# 测试函数
for i in range(10):
    print(f"fibonacci({i}) = {calculate_fibonacci(i)}")
```

## HTML 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试页面</title>
</head>
<body>
    <h1>欢迎来到我的网站</h1>
    <p>这是一个测试页面。</p>
</body>
</html>
```

这些代码块现在应该能够在微信公众号中正确显示行号和格式化的代码内容。