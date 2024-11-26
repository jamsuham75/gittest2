
const express = require("express");
const app = express();

//socket.io
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);


app.get('/socket', function(req, res){
  res.render('socket.ejs');
})

io.on('connection', function(socket){
  console.log('유저접속');

  socket.on('user-send', function(data){
    console.log(data)
    io.emit('broadcast', data)
  })
})

app.get("/", function (req, res) {
  console.log('루');
})


http.listen(8080, function () {
  console.log("listening on 8080 ");
});

