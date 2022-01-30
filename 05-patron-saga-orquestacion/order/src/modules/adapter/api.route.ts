import express, { Request, Response, Router } from "express";
import Repository from "../application/repository";
import RepositoryQueue from "../application/repository-queue";
import UseCase from "../application/usecase";
import Operation from "../infraestructure/operation";
import OperationQueue from "../infraestructure/operation-queue";
import Controller from "./api.controller";

const router: Router = express.Router();
const operation: Repository = new Operation();
const operationQueue: RepositoryQueue = new OperationQueue(operation);
const useCase: UseCase = new UseCase(operation, operationQueue);
const controller: Controller = new Controller(useCase);

router.post("/", controller.insert.bind(controller));
/* router.post("/", (req: Request, res: Response) => {
    controller.insert(req, res)
}) */

export default router;
