const net = require("net");


const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    console.log(data.toString());
    socket.write("Hello from server");
  });
});

server.listen(4221, "localhost");