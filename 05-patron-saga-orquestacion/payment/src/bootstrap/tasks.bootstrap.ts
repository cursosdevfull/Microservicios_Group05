import UseCase from "../modules/application/usecase";

export default class TasksBootstrap {
  constructor(private useCase: UseCase) {}

  async listenMessages() {
    await this.useCase.receiveMessage();
  }
}
