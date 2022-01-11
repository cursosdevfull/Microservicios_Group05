export default interface RepositoryQueue {
  sendMessage(message: any): Promise<void>;
  receiveMessage(
    callback: (message: any, isError: boolean) => void
  ): Promise<void>;
}
