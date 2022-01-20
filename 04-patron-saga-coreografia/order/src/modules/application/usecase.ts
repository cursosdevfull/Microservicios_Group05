import { OrderEntity } from "../domain/order.entity";
import Repository from "./repository";
import RepositoryQueue from "./repository-queue";

export default class UseCase {
  constructor(private repository: Repository, private queue: RepositoryQueue) {}

  async insert(orderEntity: OrderEntity): Promise<OrderEntity> {
    const result: OrderEntity = await this.repository.insert(orderEntity);
    this.queue.sendMessage({
      type: "ORDER_CREATED_EVENT",
      data: result,
    });

    return result;
  }

  async receiveMessage() {
    await this.queue.receiveMessage();
  }
}
