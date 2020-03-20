# Node (Koa) + React 聊天室

## 1. Prerequesites

先安装几个命令行工具
```
npm i -g concurrent cross-env
```
其中
* concurrent 是一个多线程工具，我们通过它先启动我们的服务器，再启动客户端所用的
  webpack-dev-server。注意这个仅限于development mode。
* cross-env 是一个跨平台环境变量工具