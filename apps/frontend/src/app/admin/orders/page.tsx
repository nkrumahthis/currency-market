"use client"

import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Order, OrderSide, OrderStatus } from '@prisma/client'
import { fetchOrders, approveOrder, rejectOrder } from './actions'
import { DataTable } from '@/components/data-table'

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const columns = [
        {
            header: 'Order ID',
            accessorKey: 'id',
            cell: (row: Order) => `#${row.id}`,
        },
        {
            header: 'User',
            accessorKey: 'user',
            cell: (row: Order) => (
                <div>
                    <div className="font-medium">{row.user?.name ?? "unknown name"}</div>
                    <div className="text-sm text-gray-500">{row.user?.email ?? "no email"}</div>
                </div>
            ),
        },
        {
            header: 'Side',
            accessorKey: 'side',
            cell: (row: Order) => getSideBadge(row.side),
        },
        {
            header: 'Currency Pair',
            accessorKey: 'currencyPair',
            cell: (row: Order) => `${row.currencyPair.baseCurrency}/${row.currencyPair.quoteCurrency}`,
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: (row: Order) => `${row.amount.toLocaleString()} ${row.currencyPair.baseCurrency}`,
        },
        {
            header: 'Rate',
            accessorKey: 'rate',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (row: Order) => getStatusBadge(row.status),
        },
        {
            header: 'Created',
            accessorKey: 'createdAt',
            cell: (row: Order) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: 'Actions',
            accessorKey: 'id',
            cell: (row: Order) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(row)}>
                    View
                </Button>
            ),
        },
    ]

    useEffect(() => {
        const loadOrders = async () => {
            // console.log("loading orders. in useeffect")
            const fetchedOrders = await fetchOrders()
            setOrders(fetchedOrders)
            console.log("fetchedOrders", fetchedOrders)
        }
        loadOrders()
    }, [])

    const handleApproveOrder = async (orderId: string) => {
        await approveOrder(orderId)
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'FILLED' } : order))
        setSelectedOrder(null)
    }

    const handleRejectOrder = async (orderId: string) => {
        await rejectOrder(orderId)
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'REJECTED' } : order))
        setSelectedOrder(null)
    }

    const getStatusBadge = (status: OrderStatus) => {
        const variants = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            NEW: 'bg-blue-100 text-blue-800',
            PARTIALLY_FILLED: 'bg-indigo-100 text-indigo-800',
            FILLED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            REJECTED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-orange-100 text-orange-800'
        }

        return (
            <Badge className={variants[status]}>
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    const getSideBadge = (side: OrderSide) => {
        const variant = side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        return <Badge className={variant}>{side}</Badge>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-gray-500">Manage and monitor all trading orders</p>
                </div>
            </div>

            {orders && (<Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>List of all orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={orders}
                        columns={columns}
                        onView={(rate) => setSelectedOrder(rate)}
                        onEdit={(rate) => { }}
                    />
                </CardContent>
            </Card>)}

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="text-xl font-bold">#{selectedOrder.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Order Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Side</p>
                                            {getSideBadge(selectedOrder.side)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Currency Pair</p>
                                            <p className="font-medium">
                                                {selectedOrder.baseCurrency}/
                                                {selectedOrder.quoteCurrency}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="font-medium">
                                                {selectedOrder.amount.toLocaleString()} {selectedOrder.baseCurrency}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Rate</p>
                                            <p className="font-medium">{selectedOrder.rate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">User Information</h3>
                                    <div className="grid gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{selectedOrder.userId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{selectedOrder.userId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Order Timeline</h3>
                                <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] mt-1.5 h-3 w-3 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="font-medium">Order Created</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(selectedOrder.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Add more timeline items based on order history */}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                    Close
                                </Button>
                                {selectedOrder.status === 'PENDING' && (
                                    <>
                                        <Button variant="destructive" onClick={() => handleRejectOrder(selectedOrder.id)}>
                                            Reject Order
                                        </Button>
                                        <Button onClick={() => handleApproveOrder(selectedOrder.id)}>
                                            Approve Order
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}