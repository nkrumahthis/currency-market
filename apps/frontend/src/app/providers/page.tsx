"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpDown, Trash2, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Extended Order type with status
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

const OrderPlacementInterface = () => {
  const userId = "lp_123456";

  // Sample orders with status
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: "ord_1",
      side: "buy",
      price: 680,
      amount: 50000,
      timestamp: Date.now(),
      userId: "lp_123456",
      baseCurrency: "EUR",
      quoteCurrency: "XOF",
      status: "pending",
      statusTimestamp: Date.now(),
    },
    {
      id: "ord_2",
      side: "sell",
      price: 682,
      amount: 25000,
      timestamp: Date.now() - 3600000,
      userId: "lp_123456",
      baseCurrency: "EUR",
      quoteCurrency: "XOF",
      status: "accepted",
      statusTimestamp: Date.now() - 3500000,
    },
    {
      id: "ord_3",
      side: "buy",
      price: 681,
      amount: 15000,
      timestamp: Date.now() - 7200000,
      userId: "lp_123456",
      baseCurrency: "EUR",
      quoteCurrency: "XOF",
      status: "rejected",
      statusTimestamp: Date.now() - 7100000,
      statusMessage: "Insufficient liquidity",
    }
  ]);


  const handleDeleteOrder = (orderId: string) => {
    setActiveOrders(activeOrders.filter(order => order.id !== orderId));
  };

  // Simulate status changes
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus, message?: string) => {
    setActiveOrders(orders =>
      orders.map(order =>
        order.id === orderId
          ? {
            ...order,
            status: newStatus,
            statusTimestamp: Date.now(),
            statusMessage: message
          }
          : order
      )
    );
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 w-2/3 mx-auto my-8">
      <div className="flex justify-center m-8">
        <h1 className="text-4xl">Partner Dashboard</h1>
      </div>
      {/* Order Status Summary */}
      <div className="rounded-md shadow flex space-x-8">
        <Link href={"/providers/order"} className="w-full flex items-center justify-center px-8 py-3 text-white bg-black">
          Place Order
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {(['pending', 'accepted', 'rejected'] as OrderStatus[]).map(status => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="font-medium capitalize">{status} Orders</span>
                </div>
                <span className="text-2xl font-bold">
                  {activeOrders.filter(order => order.status === status).length}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order Book</CardTitle>
          <button
            className="p-2 hover:bg-gray-100 rounded"
            onClick={() => {/* Refresh orders */ }}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 border rounded-lg ${order.side === 'buy' ? 'border-green-200' : 'border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {order.side.toUpperCase()}
                      </span>
                      <span>{order.amount.toLocaleString()} {order.baseCurrency}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Rate: {order.price} {order.quoteCurrency}
                    </div>
                    <div className="text-xs text-gray-400 space-x-2">
                      <span>Created: {formatTimestamp(order.timestamp)}</span>
                      {order.statusTimestamp && (
                        <span>• Last Update: {formatTimestamp(order.statusTimestamp)}</span>
                      )}
                    </div>
                    {order.statusMessage && (
                      <div className="text-sm text-red-500">
                        {order.statusMessage}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        Total: {(order.amount * order.price).toLocaleString()} {order.quoteCurrency}
                      </div>
                    </div>
                    {/* Demo buttons for status changes */}
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'accepted')}
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'rejected', 'Market rate changed')}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPlacementInterface;