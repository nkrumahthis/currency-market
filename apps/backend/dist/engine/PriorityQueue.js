"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PriorityQueue = /** @class */ (function () {
    function PriorityQueue(comparator) {
        this.items = [];
        this.items = [];
        this.comparator = comparator;
    }
    PriorityQueue.prototype.add = function (item) {
        this.items.push(item);
        this.items.sort(this.comparator);
    };
    PriorityQueue.prototype.poll = function () {
        return this.items.shift();
    };
    PriorityQueue.prototype.peek = function () {
        return this.items[0];
    };
    PriorityQueue.prototype.isEmpty = function () {
        return this.items.length === 0;
    };
    PriorityQueue.prototype.values = function () {
        return this.items;
    };
    return PriorityQueue;
}());
exports.default = PriorityQueue;
