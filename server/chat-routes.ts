import express from 'express';
import * as mongoose from 'mongoose';
import * as http from 'http';
import Chat from './models/chat';
import socket from 'socket.io';


export default (app: express.Application) => {
  const router = express.Router();
  const wsApp = express();
  const server = http.createServer(wsApp);
  const io = socket(server);

// socket io
  io.on('connection',  (socket) => {
    console.log('User connected');
    socket.on('disconnect', function () {
      console.log('User disconnected');
    });
    socket.on('save-message', function (data) {
      console.log(data);
      io.emit('new-message', {message: data});
    });
  });

  /* GET ALL CHATS */
  router.get('/:room',  (req, res, next) =>
    Chat.find({room: req.params.room}).then(c => res.json(c))
      .catch(err => next(err)));

  /* SAVE CHAT */
  router.post('/', (req, res, next) =>
    Chat.create(req.body).then(p => res.json(p))
      .catch(err => next(err)));

  app.use('/api/chat', router);
  return server;
}
