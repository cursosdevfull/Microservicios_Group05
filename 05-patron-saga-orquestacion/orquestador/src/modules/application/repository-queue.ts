export default interface RepositoryQueue {
  sendMessage(queueName: string, message: any): Promise<void>;
  receiveMessage(): Promise<void>;
}
