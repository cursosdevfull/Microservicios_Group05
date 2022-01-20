import Repository from "../application/repository";
import { OrderEntity } from "../domain/order.entity";
import model from "./order.model";

export default class Operation implements Repository {
  async insert(orderEntity: OrderEntity): Promise<OrderEntity> {
    await model.create(orderEntity);

    return orderEntity;
  }

  async update(transaction: string, status: string): Promise<string> {
    await model.findOneAndUpdate({ transaction }, { status });

    return status;
  }
}
