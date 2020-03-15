class LinkedList<T = any> {
  protected _firstNode: DoublyLinkedListNode<T> | null;
  protected _lastNode: DoublyLinkedListNode<T> | null;
  protected _length: number;
  constructor(...items: DoublyLinkedListNode<T>[] | T[]) {
    this._firstNode = null;
    this._lastNode = null;
    this._length = 0;
    this.push(...items);
  }

  *[Symbol.iterator]() {
    let currentNode = this._firstNode;
    while (currentNode) {
      yield currentNode;
      currentNode = currentNode.next;
    }
  }
  private addLast(item: DoublyLinkedListNode<T>): void {
    if(!this._firstNode || !this._lastNode) {
      this._firstNode = item;
      this._lastNode = item;
    }
    else {
      item.previous = this._lastNode;
      this._lastNode.next = item;
      this._lastNode = item;
    }
    this._length++;
  }
  private addFirst(item: DoublyLinkedListNode<T>): void {
    if(!this._firstNode || !this._lastNode) {
      this._firstNode = item;
      this._lastNode = item;
    }
    else {
      item.next = this._firstNode;
      this._firstNode.previous = item;
      this._firstNode = item;
    }
    this._length++;
  }

  public push(...items: DoublyLinkedListNode<T>[] | T[]): void {
    for (const item of items) {
      this.addLast(
        item instanceof DoublyLinkedListNode
          ? item
          : new DoublyLinkedListNode(item)
      );
    }
  }
  public unshift(...items: DoublyLinkedListNode<T>[] | T[]): void {
    for (const item of items) {
      this.addFirst(
        item instanceof DoublyLinkedListNode
          ? item
          : new DoublyLinkedListNode(item)
      );
    }
  }
  public pushAfter(
    after: DoublyLinkedListNode<T>,
    ...items: DoublyLinkedListNode<T>[]
  ) {}

  public pop(): DoublyLinkedListNode<T> | undefined {
    let node: DoublyLinkedListNode<T> | undefined;
		if (this._lastNode) {
			node = this._lastNode;
			this._lastNode = node.previous;
		}
		return node;
  }
  public shift(): DoublyLinkedListNode<T> | undefined {
    let node: DoublyLinkedListNode<T> | undefined;
		if (this._firstNode) {
			node = this._firstNode;
			this._firstNode = node.next;
		}
		return node;
  }
  public clear(): void {
    this._firstNode = null;
    this._lastNode = null;
    this._length = 0;
    // Garbage Collection?
  }
  public toArray(): DoublyLinkedListNode<T>[] {
    const array: DoublyLinkedListNode<T>[] = [];
    for (const node of this) {
      array.push(node);
    }
    return array;
  }
  get length() {
    return this._length;
  }
  get isEmpty() {
    return this.length === 0;
  }
  get firstNode() {
    return this._firstNode;
  }
  get lastNode() {
    return this._lastNode;
  }
}

class DoublyLinkedListNode<T = any> {
  public previous: DoublyLinkedListNode<T> | null;
  public next: DoublyLinkedListNode<T> | null;
  public data: T;
  constructor(data: T);
  constructor(data: T, previous?: DoublyLinkedListNode<T>);
  constructor(
    data: T,
    previous?: DoublyLinkedListNode<T>,
    next?: DoublyLinkedListNode<T>
  ) {
    this.data = data;
    this.previous = previous || null;
    this.next = next || null;
  }

  get hasPrevious() {
    return !!this.previous;
  }
  get hasNext() {
    return !!this.next;
  }
}

export { DoublyLinkedListNode, LinkedList };
