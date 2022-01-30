export type STATUS = "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED";

export class OrderBuilder {
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
    return new OrderEntity(this);
  }
}

export class OrderEntity {
  name: string;
  itemCount: number;
  transaction: string;
  status: STATUS;

  constructor(obj: OrderBuilder) {
    this.name = obj.name;
    this.itemCount = obj.itemCount;
    this.transaction = obj.transaction;
    this.status = obj.status;
  }
}
