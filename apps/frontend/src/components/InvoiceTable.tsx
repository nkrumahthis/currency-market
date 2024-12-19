'use client'

import React, { useState } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Invoice = {
    id: string;
    amount: number;
    baseCurrency: string;
    quoteCurrency: string;
    exchangeRate: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    createdAt: string;
    customer: {
        name: string;
        email: string;
    };
    bankDetails?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        swiftCode?: string;
        iban?: string;
    };
    upload?: {
        filePath: string;
        fileType: string;
        fileSize: number;
    };
};

function InvoiceTable({ invoices }: { invoices: Invoice[] }): JSX.Element {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const getStatusBadge = (status: Invoice['status']) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PAID: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };

        return (
            <Badge variant="outline" className={styles[status]}>
                {status}
            </Badge>
        );
    };

    return (<>
        <Card>
            <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Manage and view all your invoices</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Currency Pair</TableHead>
                            <TableHead>Exchange Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow
                                key={invoice.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <TableCell>{invoice.id}</TableCell>
                                <TableCell>{invoice.amount.toLocaleString()}</TableCell>
                                <TableCell>{`${invoice.baseCurrency}/${invoice.quoteCurrency}`}</TableCell>
                                <TableCell>{invoice.exchangeRate}</TableCell>
                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                <TableCell>
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                        <DialogDescription>
                            Invoice #{selectedInvoice?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Status and Amount Section */}
                            <div className="flex justify-between items-center border-b pb-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-2xl font-bold">
                                        {selectedInvoice.amount.toLocaleString()} {selectedInvoice.baseCurrency}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    {getStatusBadge(selectedInvoice.status)}
                                </div>
                            </div>

                            {/* Transaction Details Card */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Currency Pair</p>
                                        <p className="font-medium">{selectedInvoice.baseCurrency}/{selectedInvoice.quoteCurrency}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Exchange Rate</p>
                                        <p className="font-medium">{selectedInvoice.exchangeRate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Created Date</p>
                                        <p className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium">{selectedInvoice.customer.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            {selectedInvoice.bankDetails && (
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
                                    <div className="grid grid-cols-2 gap-y-3">
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
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-500">IBAN</p>
                                                <p className="font-medium">{selectedInvoice.bankDetails.iban}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* File Upload Section */}
                            {selectedInvoice.upload && (
                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Uploaded File</h3>
                                            <div className="text-sm text-gray-500">
                                                <span>{selectedInvoice.upload.fileType}</span>
                                                <span className="mx-2">•</span>
                                                <span>{(selectedInvoice.upload.fileSize / 1024).toFixed(2)} KB</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    </>
    )
}

export default InvoiceTable