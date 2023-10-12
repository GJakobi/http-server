const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const { method, path, headers } = parseRequestData(data.toString());

    const response = formatResponse({path});
    socket.write(response);
    socket.end();
  });
});

server.listen(4221, "localhost");

/**
 * Receives content separated by \r\n\r\n and returns an object with the method, path and headers
 * GET /index.html HTTP/1.1
 * Host: localhost:4221
 * User-Agent: curl/7.64.1
 */
const parseRequestData = (request) => {
  const [requestLine, ...headers] = request.split("\r\n");

  // remove the last two items of the headers array because they are empty
  headers.length = headers.length - 2;

  const [method, path, HTTPVersion] = requestLine.split(" ");

  const headersObject = headers.reduce((acc, header) => {
    const [key, value] = header.split(": ");
    return { ...acc, [key]: value };
  }, {});

  return { method, path, headers: headersObject };
};

const formatResponse = ({path}) => {
  let response = "HTTP/1.1";

  if(path === '/') {
    return response + ' 200 OK\r\n\r\n';
  } else if (path.split("/")[1] !== 'echo'){
    return response + ' 404 Not Found\r\n\r\n';
  }


  response = "HTTP/1.1 200 OK \r\nContent-Type: text/plain\r\n";

  const randomString = path.split("/").slice(2).join("/");


  response += `Content-Length: ${randomString.length}\r\n\r\n${randomString}`;


  return response;
}
