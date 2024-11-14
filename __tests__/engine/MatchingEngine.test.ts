import MatchingEngine from "@/engine/MatchingEngine";
import { Order } from "@/types";

describe("MatchingEngine", () => {
    let engine: MatchingEngine;

    beforeEach(() => {
        engine = new MatchingEngine();
    })

    test("should add buy order to the buy queue", () => {
        const order: Order = {
            id: "123",
            side: "buy",
            price: 100,
            amount: 10,
            timestamp: 1632000000000
        }

        engine.submitOrder(order);

        expect(engine["buyOrders"].peek()).toEqual(order);
        expect(engine["sellOrders"].peek()).toEqual(undefined);
    })

})