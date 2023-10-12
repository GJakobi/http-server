const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const { method, path, headers } = parseRequestData(data.toString());

    const response = formatResponse({ path, headers });
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

const formatResponse = ({ path, headers }) => {
  if (path === "/") {
    return getHTTPResponse("200 OK");
  } else if (path.split("/")[1] === "echo") {
    const randomString = path.split("/").slice(2).join("/");
    return getHTTPResponse(
      "200 OK",
      "text/plain",
      randomString.length,
      randomString
    );
  } else if (path.split("/")[1] === "user-agent") {
    return getHTTPResponse(
      "200 OK",
      "text/plain",
      headers["User-Agent"].length,
      headers["User-Agent"]
    );
  }

  return getHTTPResponse("404 Not Found");
};

/**
 * Receives the status, content type, content length and body and returns a string with the HTTP response
 */
const getHTTPResponse = (status, contentType, contentLength, body = "") => {
  let response = "HTTP/1.1";

  response += ` ${status}\r\n`;

  if (contentType) {
    response += `Content-Type: ${contentType}\r\n`;
  }

  if (contentLength) {
    response += `Content-Length: ${contentLength}\r\n`;
  }

  response += `\r\n${body}`;

  return response;
};
