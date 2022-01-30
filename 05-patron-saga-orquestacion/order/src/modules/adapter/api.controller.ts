import { Request, Response } from "express";
import UseCase from "../application/usecase";
import { OrderBuilder, OrderEntity } from "../domain/order.entity";

export default class Controller {
  constructor(private useCase: UseCase) {}

  async insert(req: Request, res: Response) {
    const { name, itemCount, transaction } = req.body;
    const entity: OrderEntity = new OrderBuilder()
      .addName(name)
      .addItemCount(itemCount)
      .addTransaction(transaction)
      .addStatus("PENDING")
      .build();
    await this.useCase.insert(entity);

    res.json({ name, itemCount, transaction, status: "PENDING" });
  }
}
