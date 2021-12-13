export default interface RepositoryQueue {
  sendMessage(message: any): void;
  receiveMessage(callback: (message: any) => void): void;
}
