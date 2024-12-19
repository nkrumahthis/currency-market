"use client"

import React, { useState, useEffect } from 'react'
import { getTrades, updateTradeStatus } from './actions'
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
import { TradeStatus } from '@prisma/client'
import { format } from 'date-fns'

interface Trade {
  id: string;
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
  baseCurrency: string;
  quoteCurrency: string;
  amount: number;
  rate: number;
  status: TradeStatus;
  createdAt: string;
  buyOrderId: string;
  sellOrderId: string;
}

export default function TradesClient({ initialTrades }: { initialTrades: Trade[] }): React.JSX.Element {
    const [selectedTrade, setSelectedTrade] = useState(null)
    const [statusFilter, setStatusFilter] = useState<TradeStatus | 'ALL'>('ALL')
    const [search, setSearch] = useState('')
    const [trades, setTrades] = useState<Trade[]>(initialTrades)
  
    useEffect(() => {
      async function fetchTrades() {
        try {
          const data = await getTrades(
            statusFilter === 'ALL' ? undefined : statusFilter,
            search || undefined
          )
          setTrades(data)
        } catch (error) {
          console.error('Error fetching trades:', error)
        }
      }
  
      const debounce = setTimeout(fetchTrades, 300)
      return () => clearTimeout(debounce)
    }, [statusFilter, search])
  
    const handleStatusUpdate = async (tradeId: string, newStatus: TradeStatus) => {
      try {
        await updateTradeStatus(tradeId, newStatus)
        const data = await getTrades(
          statusFilter === 'ALL' ? undefined : statusFilter,
          search || undefined
        )
        setTrades(data)
        setSelectedTrade(null)
      } catch (error) {
        console.error('Error updating trade:', error)
      }
    }
  
    const getStatusBadge = (status: TradeStatus) => {
      const variants = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        SETTLED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
        REVERSED: 'bg-purple-100 text-purple-800'
      }
      
      return (
        <Badge className={variants[status]}>
          {status}
        </Badge>
      )
    }
  
    const formatAmount = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }
  
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trades</h1>
            <p className="text-gray-500">Monitor and manage all trading activities</p>
          </div>
        </div>
  
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Trades (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trades.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {trades.filter(t => t.status === 'PENDING').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Failed Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {trades.filter(t => t.status === 'FAILED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Settled Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {trades.filter(t => t.status === 'SETTLED').length}
                </div>
              </CardContent>
            </Card>
          </div>
  
          {/* Main Table */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Management</CardTitle>
              <CardDescription>View and manage all trades in the system</CardDescription>
              
              <div className="mt-4 flex items-center gap-4">
                <div className="w-[200px]">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TradeStatus | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SETTLED">Settled</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REVERSED">Reversed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Input 
                  placeholder="Search trades..." 
                  className="max-w-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow 
                      key={trade.id}
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <TableCell className="font-medium">#{trade.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{trade.buyer.name}</div>
                        <div className="text-sm text-gray-500">{trade.buyer.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{trade.seller.name}</div>
                        <div className="text-sm text-gray-500">{trade.seller.email}</div>
                      </TableCell>
                      <TableCell>{trade.baseCurrency}/{trade.quoteCurrency}</TableCell>
                      <TableCell>{formatAmount(trade.amount, trade.baseCurrency)}</TableCell>
                      <TableCell>{trade.rate.toFixed(4)}</TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell>{format(new Date(trade.createdAt), 'PPp')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
  
        {/* Trade Detail Dialog */}
        <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Trade Details</DialogTitle>
            </DialogHeader>
            
            {selectedTrade && (
              <div className="space-y-6">
                <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Trade ID</p>
                    <p className="text-xl font-bold">#{selectedTrade.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(selectedTrade.status)}
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Trade Information</h3>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-2xl font-bold">
                          {formatAmount(selectedTrade.amount, selectedTrade.baseCurrency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Currency Pair</p>
                        <p className="font-medium">
                          {selectedTrade.baseCurrency}/{selectedTrade.quoteCurrency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Exchange Rate</p>
                        <p className="font-medium">{selectedTrade.rate.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium">
                          {format(new Date(selectedTrade.createdAt), 'PPpp')}
                        </p>
                      </div>
                    </div>
                  </div>
  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Parties Information</h3>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Buyer</p>
                        <p className="font-medium">{selectedTrade.buyer.name}</p>
                        <p className="text-sm text-gray-500">{selectedTrade.buyer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Seller</p>
                        <p className="font-medium">{selectedTrade.seller.name}</p>
                        <p className="text-sm text-gray-500">{selectedTrade.seller.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="space-y-4">
                  <h3 className="font-semibold">Related Orders</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Buy Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">#{selectedTrade.buyOrderId}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Sell Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">#{selectedTrade.sellOrderId}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
  
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedTrade(null)}>
                    Close
                  </Button>
                  {selectedTrade.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate(selectedTrade.id, 'FAILED')}
                      >
                        Mark as Failed
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedTrade.id, 'SETTLED')}
                      >
                        Mark as Settled
                      </Button>
                    </>
                  )}
                  {selectedTrade.status === 'SETTLED' && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedTrade.id, 'REVERSED')}
                    >
                      Reverse Trade
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }