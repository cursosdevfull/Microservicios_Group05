import RepositoryQueue from "./repository-queue";

export default class UseCase {
  constructor(private queue: RepositoryQueue) {}

  async receiveMessage() {
    await this.queue.receiveMessage();
  }
}
