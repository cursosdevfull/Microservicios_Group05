import BrokerBootstrap from "./bootstrap/broker.bootstrap";
import ServerBootstrap from "./bootstrap/server.bootstrap";
import DatabaseBootstrap from "./bootstrap/database.bootstrap";

import app from "./app";

(async () => {
  const serverBootstrap = new ServerBootstrap(app);
  const brokerBootstrap = new BrokerBootstrap();
  const databaseBootstrap = new DatabaseBootstrap();

  try {
    await serverBootstrap.initialize();
    await brokerBootstrap.initialize();
    await databaseBootstrap.initialize();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
