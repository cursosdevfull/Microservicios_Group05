import IBootstrap from "./bootstrap.interface";
import mongoose from "mongoose";

export default class DatabaseBootstrap implements IBootstrap {
  async initialize(): Promise<any> {
    return new Promise((resolve, reject) => {
      const username = process.env.MONGO_USERNAME || "root";
      const password = process.env.MONGO_PASSWORD || "root";
      const host = process.env.MONGO_HOST || "localhost";
      const port = process.env.MONGO_PORT || 27017;
      const database = process.env.MONGO_DATABASE || "order";
      const authSource = process.env.MONGO_AUTH_SOURCE || "admin";

      const connectionString = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}&retryWrites=true&w=majority`;

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        poolSize: 10,
      };

      const callback = (error: any) => {
        if (error) {
          reject(error);
        } else {
          console.log("Connected to MongoDB");
          resolve(true);
        }
      };

      mongoose.connect(connectionString, options, callback);
    });
  }
}
