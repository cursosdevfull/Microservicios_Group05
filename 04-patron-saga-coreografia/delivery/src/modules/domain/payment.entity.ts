export type STATUS =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "CANCELLED"
  | "APPROVED";

export class PaymentBuilder {
  name: string;
  itemCount: number;
  transaction: string;
  status: STATUS;

  addName(name: string) {
    this.name = name;
    return this;
  }

  addItemCount(itemCount: number) {
    this.itemCount = itemCount;
    return this;
  }

  addTransaction(transaction: string) {
    this.transaction = transaction;
    return this;
  }

  addStatus(status: STATUS) {
    this.status = status;
    return this;
  }

  build() {
    return new PaymentEntity(this);
  }
}

export class PaymentEntity {
  name: string;
  itemCount: number;
  transaction: string;
  status: STATUS;

  constructor(obj: PaymentBuilder) {
    this.name = obj.name;
    this.itemCount = obj.itemCount;
    this.transaction = obj.transaction;
    this.status = obj.status;
  }
}
