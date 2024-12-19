"use client";


import React, { useEffect, useState } from 'react'
import { getInvoices, updateInvoiceStatus } from "./actions"
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Invoice, InvoiceStatus } from '@prisma/client'
import { Download, FileText } from 'lucide-react'

export default function InvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL')
    const [search, setSearch] = useState('')
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

    useEffect(() => {
        async function fetchInvoices() {
          try {
            const data = await getInvoices(
              statusFilter === 'ALL' ? undefined : statusFilter,
              search || undefined
            )
            setInvoices(data)
          } catch (error) {
            console.error('Error fetching invoices:', error)
          }
        }
    
        const debounce = setTimeout(fetchInvoices, 300)
        return () => clearTimeout(debounce)
      }, [statusFilter, search])

    const handleStatusUpdate = async (invoiceId: string, newStatus: InvoiceStatus) => {
        try {
            await updateInvoiceStatus(invoiceId, newStatus)
            const data = await getInvoices(
                statusFilter === 'ALL' ? undefined : statusFilter,
                search || undefined
            )
            setInvoices(data)
            setSelectedInvoice(null)
        } catch (error) {
            console.error('Error updating invoice:', error)
        }
    }

    const getStatusBadge = (status: InvoiceStatus) => {
        const variants = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PAID: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        }

        return (
            <Badge className={variants[status]}>
                {status}
            </Badge>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-gray-500">Manage customer invoices and payments</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Management</CardTitle>
                    <CardDescription>View and manage all invoices in the system</CardDescription>

                    <div className="mt-4 flex items-center gap-4">
                        <div className="w-[200px]">
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'ALL')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Input
                            placeholder="Search invoices..."
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
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Currency Pair</TableHead>
                                <TableHead>Exchange Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow
                                    key={invoice.id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => setSelectedInvoice(invoice)}
                                >
                                    <TableCell className="font-medium">#{invoice.id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{invoice.customer.name}</div>
                                            <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{invoice.amount.toLocaleString()} {invoice.baseCurrency}</TableCell>
                                    <TableCell>{invoice.baseCurrency}/{invoice.quoteCurrency}</TableCell>
                                    <TableCell>{invoice.exchangeRate.toFixed(4)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Invoice ID</p>
                                    <p className="text-xl font-bold">#{selectedInvoice.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    {getStatusBadge(selectedInvoice.status)}
                                </div>
                            </div>

                            <Tabs defaultValue="details">
                                <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="bank">Bank Information</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Invoice Information</h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Amount</p>
                                                    <p className="text-2xl font-bold">
                                                        {selectedInvoice.amount.toLocaleString()} {selectedInvoice.baseCurrency}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Currency Pair</p>
                                                    <p className="font-medium">
                                                        {selectedInvoice.baseCurrency}/{selectedInvoice.quoteCurrency}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Exchange Rate</p>
                                                    <p className="font-medium">{selectedInvoice.exchangeRate.toFixed(4)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Customer Information</h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-medium">{selectedInvoice.customer.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{selectedInvoice.customer.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="bank" className="space-y-4">
                                    {selectedInvoice.bankDetails ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Bank Name</p>
                                                <p className="font-medium">{selectedInvoice.bankDetails.bankName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Account Name</p>
                                                <p className="font-medium">{selectedInvoice.bankDetails.accountName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Account Number</p>
                                                <p className="font-medium">{selectedInvoice.bankDetails.accountNumber}</p>
                                            </div>
                                            {selectedInvoice.bankDetails.swiftCode && (
                                                <div>
                                                    <p className="text-sm text-gray-500">SWIFT Code</p>
                                                    <p className="font-medium">{selectedInvoice.bankDetails.swiftCode}</p>
                                                </div>
                                            )}
                                            {selectedInvoice.bankDetails.iban && (
                                                <div>
                                                    <p className="text-sm text-gray-500">IBAN</p>
                                                    <p className="font-medium">{selectedInvoice.bankDetails.iban}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p>No bank details available</p>
                                    )}
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-4">
                                    {selectedInvoice.upload ? (
                                        <div className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">Invoice Document</p>
                                                        <p className="text-sm text-gray-500">
                                                            {selectedInvoice.upload.fileType} • {(selectedInvoice.upload.fileSize / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No documents attached</p>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                                    Close
                                </Button>
                                {selectedInvoice.status === 'PENDING' && (
                                    <>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleStatusUpdate(selectedInvoice.id, 'CANCELLED')}
                                        >
                                            Cancel Invoice
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedInvoice.id, 'PAID')}
                                        >
                                            Mark as Paid
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