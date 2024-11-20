export default class PriorityQueue<T> {
    private items: Array<T> = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.items = [];
        this.comparator = comparator
    }

    add(item: T) {
        this.items.push(item)
        this.items.sort(this.comparator)
    }

    poll() {
        return this.items.shift()
    }

    peek() {
        return this.items[0]
    }

    isEmpty() {
        return this.items.length === 0;
    }

    values() {
        return this.items;
    }
}