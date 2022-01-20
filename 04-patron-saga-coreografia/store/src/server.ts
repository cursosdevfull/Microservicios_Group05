import BrokerBootstrap from "./bootstrap/broker.bootstrap";
import ServerBootstrap from "./bootstrap/server.bootstrap";
import DatabaseBootstrap from "./bootstrap/database.bootstrap";
import TasksBootstrap from "./bootstrap/tasks.bootstrap";

import app from "./app";
import UseCase from "./modules/application/usecase";
import OperationQueue from "./modules/infraestructure/operation-queue";
import Operation from "./modules/infraestructure/operation";

(async () => {
  const serverBootstrap = new ServerBootstrap(app);
  const brokerBootstrap = new BrokerBootstrap();
  const databaseBootstrap = new DatabaseBootstrap();

  const operation = new Operation();
  const operationQueue = new OperationQueue(operation);
  const useCase = new UseCase(operationQueue);
  const tasksBootstrap = new TasksBootstrap(useCase);

  try {
    await serverBootstrap.initialize();
    await databaseBootstrap.initialize();
    await brokerBootstrap.initialize();
    await tasksBootstrap.listenMessages();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
