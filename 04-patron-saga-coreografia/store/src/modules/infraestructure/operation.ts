import Repository from "../application/repository";
import { PaymentEntity } from "../domain/payment.entity";
import model from "./payment.model";

export default class Operation implements Repository {
  async insert(paymentEntity: PaymentEntity): Promise<PaymentEntity> {
    await model.create(paymentEntity);

    return paymentEntity;
  }

  async update(transaction: string, status: string): Promise<string> {
    await model.findOneAndUpdate({ transaction }, { status });

    return status;
  }
}
