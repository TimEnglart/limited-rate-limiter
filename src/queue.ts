class Queue<T> {
	private head?: ILinkedListNode<T>;
	private tail?: ILinkedListNode<T>;
	constructor(...items: T[]) {
		if (items.length) this.enqueue(...items);
	}
	public enqueue(...items: T[]): void {
		for (const item of items) {
			const node: ILinkedListNode<T> = {
				data: item
			};
			if (!this.head) this.head = node;
			else this.tail!.next = node;
			this.tail = node;
		}
	}
	public dequeueNode(): ILinkedListNode<T> | undefined {
		let nodeData: ILinkedListNode<T> | undefined;
		if (this.head) {
			nodeData = this.head;
			this.head = this.head.next;
		}
		return nodeData;
	}
	public dequeue(): T | undefined {
		const nodeData = this.dequeueNode();
		return nodeData ? nodeData.data : undefined;
	}
	get firstNode(): ILinkedListNode<T> | undefined {
		return this.head;
	}
	get firstElement(): T | undefined {
		return this.head ? this.head.data : undefined;
	}
	get populated(): boolean {
		return !!this.head;
	}
	get size(): number {
		let size = 0;
		let node = this.head;
		while (node) {
			size++;
			node = node.next;
		}
		return size;
	}
	public toArray(): T[] {
		const list: T[] = [];
		let node = this.head;
		while (node) {
			list.push(node.data);
			node = node.next;
		}
		return list;
	}
	public clear(): void {
		let node;
		do {
			node = this.dequeueNode();
		} while (node);
	}
}
interface ILinkedListNode<T> {
	next?: ILinkedListNode<T>;
	data: T;
}
export { Queue };