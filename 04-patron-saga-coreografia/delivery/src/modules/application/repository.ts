import { PaymentEntity } from "../domain/payment.entity";

export default interface Repository {
  insert(orderEntity: PaymentEntity): Promise<PaymentEntity>;
  update(transaction: string, status: string): Promise<string>;
}
