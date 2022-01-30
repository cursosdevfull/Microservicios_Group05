import { OrderEntity } from "../domain/order.entity";

export default interface Repository {
  insert(orderEntity: OrderEntity): Promise<OrderEntity>;
  update(transaction: string, status: string): Promise<string>;
}
