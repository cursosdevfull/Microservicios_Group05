export enum QUEUE_NAME {
  ORCHESTATOR_EVENT = "ORCHESTATOR_EVENT",
  ORDER_PREPARE_EVENT = "ORDER_PREPARE_EVENT",
}

export enum TYPE_MESSAGE {
  ORDER_DELIVERIED = "ORDER_DELIVERIED",
}

export enum EXCHANGE_NAME {
  FAILED_ERROR_EXCHANGE = "FAILED_ERROR_EXCHANGE",
  ORDER_CONFIRMED_EXCHANGE = "ORDER_CONFIRMED_EXCHANGE",
}

export enum EXCHANGE_TYPE {
  TOPIC = "topic",
  FANOUT = "fanout",
}

export enum ROUTING_KEY_ERROR {
  STORE_ERROR = "store.order_cancelled.error",
  DELIVERY_ERROR = "delivery.order_cancelled.error",
}
