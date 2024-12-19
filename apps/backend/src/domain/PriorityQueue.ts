export default class PriorityQueue<T> {
	private items: T[] = [];

	constructor(private readonly comparator: (a: T, b: T) => number) {}

	add(item: T) {
		this.items.push(item);
		this.items.sort(this.comparator);
	}

	poll() {
		return this.items.shift();
	}

	peek() {
		return this.items[0];
	}

	isEmpty() {
		return this.items.length === 0;
	}

	values() {
		return this.items;
	}

	load(items: T[]): void {
		this.items = items;
	}

	remove(id: string): void {
		const index = this.items.findIndex((item) => (item as any).id === id);

		if (index !== -1) {
			this.items.splice(index, 1);
		}
	}
}
