import { OrderEntity } from "../domain/order.entity";
import { TYPE_MESSAGE } from "../infraestructure/enums";
import Repository from "./repository";
import RepositoryQueue from "./repository-queue";

export default class UseCase {
  constructor(private repository: Repository, private queue: RepositoryQueue) {}

  async insert(orderEntity: OrderEntity): Promise<OrderEntity> {
    const result: OrderEntity = await this.repository.insert(orderEntity);
    this.queue.sendMessage({
      type: TYPE_MESSAGE.ORDER_CREATED,
      payload: result,
    });

    return result;
  }

  async receiveMessage() {
    await this.queue.receiveMessage();
  }
}
