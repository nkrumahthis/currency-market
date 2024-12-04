"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpDown } from 'lucide-react';

type OrderStatus = 'pending' | 'accepted' | 'rejected';

type Order = {
    id: string;
    side: "buy" | "sell";
    price: number;
    amount: number;
    timestamp: number;
    userId: string;
    baseCurrency: string;
    quoteCurrency: string;
    status: OrderStatus;
    statusTimestamp?: number;
    statusMessage?: string;
};

const page = () => {
    const userId = "lp_123456";

    const [newOrder, setNewOrder] = useState({
        side: "buy",
        price: "",
        amount: "",
        baseCurrency: "EUR",
        quoteCurrency: "XOF"
    });

    const handleSubmitOrder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const order: Order = {
            id: `ord_${Math.random().toString(36).substring(2, 9)}`,
            ...newOrder,
            timestamp: Date.now(),
            userId,
            status: 'pending',
            statusTimestamp: Date.now(),
            amount: Number(newOrder.amount),
            price: Number(newOrder.price),
        } as Order;

        // TODO send order to backend

        setNewOrder({
            side: "buy",
            price: "",
            amount: "",
            baseCurrency: "EUR",
            quoteCurrency: "XOF"
        });
    };

    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="mx-auto m-8"><h1 className="text-4xl mx-auto">Place Order</h1></div>
            {/* Order Placement Form */}
            <div className="w-2/3 mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Place New Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                            {/* Order Type Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Order Type</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="side"
                                            value="buy"
                                            checked={newOrder.side === "buy"}
                                            onChange={(e) => setNewOrder({ ...newOrder, side: e.target.value as "buy" | "sell" })}
                                            className="form-radio"
                                        />
                                        <span>Buy XOF</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="side"
                                            value="sell"
                                            checked={newOrder.side === "sell"}
                                            onChange={(e) => setNewOrder({ ...newOrder, side: e.target.value as "buy" | "sell" })}
                                            className="form-radio"
                                        />
                                        <span>Sell XOF</span>
                                    </label>
                                </div>
                            </div>

                            {/* Currency Pair Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Currency Pair</label>
                                <div className="flex space-x-4">
                                    <select
                                        value={newOrder.baseCurrency}
                                        onChange={(e) => setNewOrder({ ...newOrder, baseCurrency: e.target.value })}
                                        className="p-2 border rounded"
                                    >
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                    <ArrowUpDown className="h-6 w-6" />
                                    <select
                                        value={newOrder.quoteCurrency}
                                        onChange={(e) => setNewOrder({ ...newOrder, quoteCurrency: e.target.value })}
                                        className="p-2 border rounded"
                                        disabled
                                    >
                                        <option value="XOF">XOF</option>
                                    </select>
                                </div>
                            </div>

                            {/* Amount and Rate Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Amount ({newOrder.baseCurrency})
                                    </label>
                                    <input
                                        type="number"
                                        value={newOrder.amount}
                                        onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                                        placeholder="Enter amount"
                                        className="w-full p-2 border rounded"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Rate (XOF per {newOrder.baseCurrency})
                                    </label>
                                    <input
                                        type="number"
                                        value={newOrder.price}
                                        onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                                        placeholder="Enter rate"
                                        className="w-full p-2 border rounded"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                                disabled={!newOrder.amount || !newOrder.price}
                            >
                                Place Order
                            </button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}

export default page