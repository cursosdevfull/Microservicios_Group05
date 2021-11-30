const http = require("http");
const app = require("./app");

const port = process.env.PORT || 19000;
const server = http.createServer(app);

server
  .listen(port)
  .on("listening", () => console.log(`Frontend is running on ${port}`))
  .on("error", (err) => {
    console.log(err);
    process.exit(1);
  });
