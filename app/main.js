const net = require("net");


const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    console.log(data.toString());
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  });
});

server.listen(4221, "localhost");