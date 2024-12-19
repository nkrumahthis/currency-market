"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { revalidatePath } from 'next/cache';

interface NewOrderRequest {
    amount: number;
    baseCurrency: string;
    quoteCurrency: string;
    userId?: string;
    accountName: string;
    bankName: string;
    fileUpload?: File | null;
    accountNumber: string;
    swift: string;
};

const CurrencySelection = ({ label, name, options, selectedValue, onChange }: any) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex space-x-4">
            {options.map((currency: string) => (
                <label key={currency} className="flex items-center space-x-2">
                    <input
                        type="radio"
                        name={name}
                        value={currency}
                        checked={selectedValue === currency}
                        onChange={onChange}
                        className="form-radio"
                    />
                    <span>{currency}</span>
                </label>
            ))}
        </div>
    </div>
);

const TextInput = ({ label, placeholder, value, onChange }: any) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

const FileUpload = ({ fileUpload, onChange }: any) => (
    <div className="border-2 border-dashed rounded-lg p-4 text-center">
        <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onChange}
        />
        <label htmlFor="fileUpload" className="cursor-pointer">
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
        {fileUpload && (
            <div className="mt-2 text-sm text-gray-600">
                Selected file: {fileUpload.name}
            </div>
        )}
    </div>
);

export default function InvoiceForm() {
    const router = useRouter();

    const [formData, setFormData] = useState<NewOrderRequest>({
        baseCurrency: 'EUR',
        quoteCurrency: 'XOF',
        amount: 0,
        accountName: 'Acme Corp',
        bankName: 'Bank of Foo',
        accountNumber: '111000942',
        swift: '32410',
        fileUpload: null,
    });

    const exchangeRateRef = useRef<number | null>(null);

    const [calculatedValues, setCalculatedValues] = useState({
        exchangeRate: exchangeRateRef.current,
        baseCurrencyAmount: 0,
        capiFees: 0,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'fileUpload' && value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (key === "amount") 
                    formDataToSend.append(key, calculatedValues.baseCurrencyAmount.toString())
                else {
                    formDataToSend.append(key, value.toString());
                }
            }
        });
        formDataToSend.append('exchangeRate', exchangeRateRef.current!.toString());

        const response = await fetch("http://localhost:5001/invoices", {
            method: "POST",
            body: formDataToSend,
        });

        if (response.ok) {
            alert("Payment successful!");
            router.push('/customers/dashboard');
        } else {
            alert("Payment request failed. Please try again later.");
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        const sourceAmount = amount * (exchangeRateRef.current || 0);
        setCalculatedValues(prev => ({
            ...prev,
            baseCurrencyAmount: sourceAmount
        }));
    };

    const fetchExchangeRate = async (baseCurrency: string, quoteCurrency: string) => {
        const response = await fetch(`http://localhost:5001/rates/${baseCurrency}-${quoteCurrency}`);
        const data = await response.json();
        exchangeRateRef.current = data.data.rate;
        setCalculatedValues(prev => ({
            ...prev,
            exchangeRate: data.data.rate
        }));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'base' | 'quote') => {
        const newCurrency = e.target.value;
        const updatedFormData = { ...formData, [type === 'base' ? 'baseCurrency' : 'quoteCurrency']: newCurrency };
        setFormData(updatedFormData);
        fetchExchangeRate(updatedFormData.baseCurrency, updatedFormData.quoteCurrency);
    };

    useEffect(() => {
        fetchExchangeRate(formData.baseCurrency, formData.quoteCurrency);
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl p-8">Invoice Payment Form</h1>
                <Button variant={"outline"} onClick={() => router.back()}>
                    Invoice Dashboard
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pay Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CurrencySelection
                            label="Recipient currency"
                            name="baseCurrency"
                            options={['EUR', 'USD', 'GBP']}
                            selectedValue={formData.baseCurrency}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCurrencyChange(e, 'base')}
                        />
                        <CurrencySelection
                            label="Your currency"
                            name="quoteCurrency"
                            options={['XOF', 'XAF']}
                            selectedValue={formData.quoteCurrency}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCurrencyChange(e, 'quote')}
                        />
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
                                    {formData.baseCurrency}
                                </span>
                            </div>
                        </div>
                        {calculatedValues.baseCurrencyAmount > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span>You send</span>
                                    <span>{calculatedValues.baseCurrencyAmount.toLocaleString()} {formData.quoteCurrency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Exchange rate</span>
                                    <span>{exchangeRateRef.current}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Capi fees</span>
                                    <span>{formData.baseCurrency} {calculatedValues.capiFees.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium text-lg">Recipient Bank Details</h3>
                            <TextInput
                                label="Recipient Name"
                                placeholder="Enter recipient's full name"
                                value={formData.accountName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, accountName: e.target.value })}
                            />
                            <TextInput
                                label="Bank Name"
                                placeholder="Enter bank name"
                                value={formData.bankName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                            <TextInput
                                label="IBAN/Account Number"
                                placeholder="Enter IBAN or account number"
                                value={formData.accountNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                            <TextInput
                                label="SWIFT/BIC Code"
                                placeholder="Enter SWIFT/BIC code"
                                value={formData.swift}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, swift: e.target.value })}
                            />
                        </div>
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium text-lg">Invoice Upload</h3>
                            <FileUpload
                                fileUpload={formData.fileUpload}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    setFormData({ ...formData, fileUpload: file || null });
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                        >
                            SUBMIT
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
