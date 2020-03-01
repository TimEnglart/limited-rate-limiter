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
  private addLast(item: DoublyLinkedListNode<T>) {
    if (this._firstNode === null) {
      // No First Node
      this._firstNode = item;
    } else {
      if (this._lastNode === null) {
        // No Last Node
        this._lastNode = item;
        this._lastNode.previous = this._firstNode;
        this._firstNode.next = item;
      } else {
        // There Are Both a First And Last Node
        this._lastNode.next = item;
        item.previous = this._lastNode;
        this._lastNode = item;
      }
    }
    this._length++;
  }
  private addFirst(item: DoublyLinkedListNode<T>) {
    if (this._firstNode === null) {
      // No First Node
      this._firstNode = item;
    } else {
      item.next = this._firstNode;
      this._firstNode.previous = item;
      this._firstNode = item;
    }
    this._length++;
  }

  public push(...items: DoublyLinkedListNode<T>[] | T[]) {
    for (const item of items) {
      this.addLast(
        item instanceof DoublyLinkedListNode
          ? item
          : new DoublyLinkedListNode(item)
      );
    }
  }
  public unshift(...items: DoublyLinkedListNode<T>[] | T[]) {
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

  public pop() {
    const lastNode = this._lastNode;
    if (this._lastNode) {
      const secondLastNode = this._lastNode.previous;
      if (secondLastNode) {
        this._lastNode.next = null;
        this._lastNode.previous = secondLastNode.previous;
        this._lastNode.data = secondLastNode.data;
      } else {
        // There is Only One Node
        this._lastNode = null;
        this._firstNode = null;
      }
    }
    return lastNode;
  }
  public shift() {
    const firstNode = this._firstNode;
    if (this._firstNode) {
      const secondNode = this._firstNode.next;
      if (secondNode) {
        this._firstNode.previous = null;
        this._firstNode.next = secondNode.next;
        this._firstNode.data = secondNode.data;
      } else {
        // There is Only One Node
        this._lastNode = null;
        this._firstNode = null;
      }
    }
    return firstNode;
  }
  public clear() {
    this._firstNode = null;
    this._lastNode = null;
    this._length = 0;
    // Garbage Collection?
  }
  public toArray() {
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
