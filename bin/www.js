#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('chat:server');
const http = require('http');
const Message = require('../models/message.model')

// Config .env
require('dotenv').config()

// Config BD

require('../config/db')



/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

// Config Socket.io
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('Se ha conectado un nuevo cliente')

  socket.broadcast.emit('chat_message', {
    text: 'Se ha conectado un nuevo cliente',
    user: { username: 'INFO' }    
  })

  io.emit('chat_users', io.engine.clientsCount)

  socket.on('chat_message', async (data) => {
    // Guardar el mensaje en la BD
    // data contiene: message, username y user_id
    const message = await Message.create({
      text: data.message,
      user: data.user_id
    })

    io.emit('chat_message', await message.populate('user'))
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    io.emit('chat_message', {
      text: 'Se ha desconectado un usuario',
      user: {username: 'INFO'}
    })
  })

  io.emit('chat_users', io.engine.clientsCount)

})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
