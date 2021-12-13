import express, { Request, Response } from "express";
import ErrorsHelper from "./helpers/errors.helper";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => res.send("I am alive"));

app.use(ErrorsHelper.pathNotFound);
app.use(ErrorsHelper.genericError);

export default app;
