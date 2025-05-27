项目使用python环境

# 安装

```bash
cd /path/to/browserUse
```

环境安装有多种方式，这里列出两种供参考

## uv安装：

推荐使用uv管理python环境

创建虚拟环境

```
uv venv 
```

激活虚拟环境

+ Linux/macOS：

```
source .venv/bin/activate
```

+ windows

```
.venv\Scripts\activate
```

安装依赖

+ pyproject.toml：

```
uv pip install .
```

+ requirements.txt：

```
uv pip install -r requirements.txt
```

## Pip安装：

首先激活对应的虚拟环境

然后执行

```
pip install -r requirements.txt
```

依赖安装

## 浏览器插件安装：

```bash
#需要激活项目虚拟环境
patchright install chromium --with-deps --no-shell
```



# 启动

```bash
cd /path/to/browserUse
```

```bash
激活虚拟环境
```

```
python browser_use\server.py
```



# 注意

模型必须支持工具调用和 function calling，vision模式仅支持gpt-4o
