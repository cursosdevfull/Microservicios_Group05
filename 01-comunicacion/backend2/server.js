const http = require("http");
const app = require("./app");

const port = process.env.PORT || 19020;
const server = http.createServer(app);

server
  .listen(port)
  .on("listening", () => console.log(`Backend2 is running on ${port}`))
  .on("error", (err) => {
    console.log("ocurrió un error");
    console.log(err);
    process.exit(1);
  });
