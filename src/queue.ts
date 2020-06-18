import { LinkedList, DoublyLinkedListNode } from "./LinkedList";

class Queue<T = any> extends LinkedList<T> {
  public dequeueNode(): DoublyLinkedListNode<T> | null {
    let nodeData: DoublyLinkedListNode<T> | null = null;
    if (this._firstNode) {
      nodeData = this._firstNode;
      this._firstNode = this._firstNode.next;
    }
    return nodeData;
  }
  public dequeue(): T | null {
    const nodeData = this.shift();
    return nodeData ? nodeData.data : null;
  }
  public enqueue(...items: T[]): void {
    this.push(...items);
  }
}
export { Queue };
