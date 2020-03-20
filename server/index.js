const Path = require('path');
const Koa = require('koa');
const Socket = require( 'koa-socket' )
const BodyParser = require('koa-bodyparser');
const Serve = require('koa-static');

const app = new Koa();
const chatSock = new Socket()
chatSock.attach(app);

const Datastore = require('nedb-promise');
  db = new Datastore();

chatSock.on('connection', ctx => {
  console.log('joining', ctx.socket.id)
})

chatSock.on('login', async ( {socket}, {user, local} ) => {
  try {
    const result = await db.findOne({table:'user', name:user});
    if (!local) {
      if (result !== null){
        socket.emit('login', {error: 'OCCUPIED'});
      } else {
        await db.insert({table:'user', name:user});
        socket.emit('login', {ok: 'NEW'});
      }
    } else {
      if (result === null){
        socket.emit('login', {error: 'EXPIRED'});
      } else {
        socket.emit('login', {ok: 'BACK'});
      }
    }
  } catch ({name, message}) {
    socket.emit('login', {error:name, message});
  }
})

chatSock.on('message', async ({socket, data}, {message, from}) => {
  console.log('recv message', data);
  chatSock.broadcast('message', {message, from});
})

var {PORT: port, MODE: mode} = process.env;
port = parseInt(port);
!port && (port = 3000);

var publicPath;
if (mode !== 'production') {
  port += 1;
  publicPath = Path.join(__dirname, '../client/public');
} else {
  publicPath = Path.join(__dirname, '../client/build')
}

app.use( async ( ctx, next )  => {
  const start = new Date
  await next()
  const ms = new Date - start
  console.log( `${ ctx.method } ${ ctx.url } - ${ ms }ms` )
})

console.log('mode: ', mode, 'port: ', port)
app.use(BodyParser());
app.use(Serve(publicPath));
app.listen(port);