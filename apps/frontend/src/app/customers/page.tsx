import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { getInvoices } from './actions';
import Link from 'next/link';
import InvoiceTable from '@/components/InvoiceTable';

// Type definitions
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

const InvoiceDashboard = async () => {
    const invoices: Invoice[] = await getInvoices("customer", "CUSTOMER");

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl">Invoices</h1>
                <Link href={'/invoice'}>
                    Create Invoice
                </Link>
            </div>
            <InvoiceTable invoices={invoices} />

        </div>
    );
};

export default InvoiceDashboard;