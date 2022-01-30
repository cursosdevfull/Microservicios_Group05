import { Application } from "express";
import IBootstrap from "./bootstrap.interface";
import http from "http";

export default class ServerBootstrap implements IBootstrap {
  constructor(private app: Application) {}

  async initialize(): Promise<any> {
    return new Promise((resolve, reject) => {
      const port = process.env.PORT || 3000;

      const server: http.Server = http.createServer(this.app);

      server
        .listen(port)
        .on("listening", () => {
          resolve(true);
          console.log(`Server is listening on port ${port}`);
        })
        .on("error", (error: any) => {
          reject(error);
          console.error(error);
        });
    });
  }
}
