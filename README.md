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

如果还没有安装npm/node，这个系统需要node.js v12 LTS (加 npm 6) 以上版本，请从这里安装：

```
$ curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

## 2. 安装和运行

```
# 先将repository复制到本地
$ git clone https://github.com/marvintau/chatroom-node/
# 先进入客户端目录()
$ cd chatroom-node/client
# 安装必要的项目
$ npm i
$ npm run build
# 回到上级目录（服务端）
$ npm i
$ npm run deploy
```

需要注意的是，deploy后运行的是node-dev，仍然是一个开发环境的node支持。如果退出terminal
这个服务器进程也会随之停止。当投入实际运行的时候应该选择一个类似`forever`或者`pm2`的node进程
管理平台，例如

```
pm2 start ./server
```

来运行