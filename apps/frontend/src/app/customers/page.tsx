"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { AlertCircle } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';

type TransactionType = {
    sourceCurrency: string;
    recipientCurrency: string;
    recipientAmount: string;
    reference: string;
    recipientName: string;
    recipientBank: string;
    recipientAccountNumber: string;
    recipientSwift: string;
    invoice: File | null; // File for invoice upload
}

const TransactionForm = () => {
    // Form state
    const [formData, setFormData] = useState<TransactionType>({
        // Source Currency Selection
        sourceCurrency: 'XOF', // Default as shown in image

        // Target Currency Selection
        recipientCurrency: 'EUR', // Default as shown in image

        // Amount Information
        recipientAmount: '', // e.g. 12,300.50 EUR

        // Transaction Details (shown in expanded view)
        reference: '', // e.g. 253

        // Recipient Details (would be needed based on "Add details" button)
        recipientName: '',
        recipientBank: '',
        recipientAccountNumber: '',
        recipientSwift: '',

        // Invoice Upload
        invoice: null,
    });

    const [calculatedValues, setCalculatedValues] = useState({
        exchangeRate: 680, // Example from image
        sourceCurrencyAmount: 0,
        capiFees: 0,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Handle form submission
    };

    const handleAmountChange = (e: any) => {
        const amount = parseFloat(e.target.value) || 0;
        // Calculate source amount based on exchange rate
        const sourceAmount = amount * calculatedValues.exchangeRate;
        setCalculatedValues(prev => ({
            ...prev,
            sourceCurrencyAmount: sourceAmount
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-4xl p-8">Customer Quote Request Form</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Request Quote</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Source Currency Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Your currency</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="sourceCurrency"
                                        value="XOF"
                                        checked={formData.sourceCurrency === 'XOF'}
                                        onChange={(e) => setFormData({ ...formData, sourceCurrency: e.target.value })}
                                        className="form-radio"
                                    />
                                    <span>XOF</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="sourceCurrency"
                                        value="XAF"
                                        checked={formData.sourceCurrency === 'XAF'}
                                        onChange={(e) => setFormData({ ...formData, sourceCurrency: e.target.value })}
                                        className="form-radio"
                                    />
                                    <span>XAF</span>
                                </label>
                            </div>
                        </div>

                        {/* Recipient Currency Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Recipient currency</label>
                            <div className="flex space-x-4">
                                {['EUR', 'USD', 'GBP'].map(currency => (
                                    <label key={currency} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="recipientCurrency"
                                            value={currency}
                                            checked={formData.recipientCurrency === currency}
                                            onChange={(e) => setFormData({ ...formData, recipientCurrency: e.target.value })}
                                            className="form-radio"
                                        />
                                        <span>{currency}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Recipient amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="e.g. 12,300.50"
                                    className="w-full p-2 border rounded"
                                    onChange={handleAmountChange}
                                    step="0.01"
                                />
                                <span className="absolute right-8 top-2 text-gray-500">
                                    {formData.recipientCurrency}
                                </span>
                            </div>
                        </div>

                        {/* Transaction Summary */}
                        {calculatedValues.sourceCurrencyAmount > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span>You send</span>
                                    <span>{calculatedValues.sourceCurrencyAmount.toLocaleString()} {formData.sourceCurrency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Exchange rate</span>
                                    <span>{calculatedValues.exchangeRate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Capi fees</span>
                                    <span>{formData.recipientCurrency} {calculatedValues.capiFees.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Bank Details Section */}
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium text-lg">Recipient Bank Details</h3>

                            {/* Recipient Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Recipient Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter recipient's full name"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                />
                            </div>

                            {/* Bank Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter bank name"
                                    value={formData.recipientBank}
                                    onChange={(e) => setFormData({ ...formData, recipientBank: e.target.value })}
                                />
                            </div>

                            {/* IBAN/Account Number */}
                            <div>
                                <label className="block text-sm font-medium mb-2">IBAN/Account Number</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter IBAN or account number"
                                    value={formData.recipientAccountNumber}
                                    onChange={(e) => setFormData({ ...formData, recipientAccountNumber: e.target.value })}
                                />
                            </div>

                            {/* SWIFT/BIC Code */}
                            <div>
                                <label className="block text-sm font-medium mb-2">SWIFT/BIC Code</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter SWIFT/BIC code"
                                    value={formData.recipientSwift}
                                    onChange={(e) => setFormData({ ...formData, recipientSwift: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Invoice Upload Section */}
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium text-lg">Invoice Upload</h3>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-2">Upload Invoice</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        id="invoice"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setFormData({ ...formData, invoice: file || null });
                                        }}
                                    />
                                    <label htmlFor="invoice" className="cursor-pointer">
                                        <div className="space-y-2">
                                            <div className="flex justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Click to upload or drag and drop
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                PDF, JPG, PNG (max. 10MB)
                                            </div>
                                        </div>
                                    </label>
                                    {formData.invoice && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Selected file: {formData.invoice.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                        >
                            Request quote
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionForm;