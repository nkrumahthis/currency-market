"use client"

import React, { useEffect, useState } from 'react'
import { getRates } from './actions';
import Link from 'next/link';

interface Invoice {
    id: string;
    amount: number;
    currencyPair: {
        baseCurrency: string;
        quoteCurrency: string;
    };
    exchangeRate: number;
    status: string;
    bankDetails: {
        bankName: string;
        accountName: string;
        accountNumber: string;
    };
    createdAt: string;
}
function page() {
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState<Invoice[]>([])

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true)

            try {
                const data = await getRates();
                setInvoices(data);
            } catch (err) {
                console.error("Error fetching invoices", err)
            } finally {
                setLoading(false);
            }
        }

        fetchInvoices();
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Customer Dashboard</h1>
            <div className="flex flex-col space-y-4">
                <Link
                    href="/invoice"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg w-40 hover:bg-blue-700 my-1 font-medium"
                >Pay New Invoice</Link>
                <p className="mt-2 text-gray-500">View and manage your invoice payments.</p>
                <div className="mt-8">
                    {loading ? (
                        <p className="text-gray-500">Loading invoices...</p>
                    ) : invoices.length > 0 ? (
                        <div className="overflow-hidden shadow rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Currency Pair</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Exchange Rate</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Bank Details</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.currencyPair.baseCurrency}/{invoice.currencyPair.quoteCurrency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.exchangeRate.toFixed(4)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.status.toUpperCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.bankDetails.bankName} - {invoice.bankDetails.accountName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(invoice.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No invoices found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default page