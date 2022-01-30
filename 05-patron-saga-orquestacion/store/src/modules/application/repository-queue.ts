export default interface RepositoryQueue {
  sendMessage(message: any): Promise<void>;
  receiveMessage(): Promise<void>;
}
