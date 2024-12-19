"use client"

import { useEffect } from 'react';
import { fetchExchangeRates } from './actions';
import React, { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ExchangeRate {
  id: string;
  currencyPair: {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
  };
  rate: number;
  createdAt: string;
  admin: {
    name: string;
  };
}

export default function ExchangeRatesPage() {
  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    async function loadExchangeRates() {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    }

    loadExchangeRates();
  }, []);


  const columns = [
    {
      header: 'Currency Pair',
      accessorKey: 'currencyPair',
      cell: (row: ExchangeRate) =>
        `${row.currencyPair.baseCurrency}/${row.currencyPair.quoteCurrency}`,
    },
    {
      header: 'Rate',
      accessorKey: 'rate',
      cell: (row: ExchangeRate) => row.rate.toFixed(4),
    },
    {
      header: 'Last Updated',
      accessorKey: 'createdAt',
      cell: (row: ExchangeRate) => row.createdAt,
    },
    {
      header: 'Updated By',
      accessorKey: 'admin',
      cell: (row: ExchangeRate) => row.admin.name,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exchange Rates</h1>
          <p className="text-muted-foreground">
            Manage currency exchange rates
          </p>
        </div>
        <Button onClick={() => { }}>Set New Rate</Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Rates</CardTitle>
            <CardDescription>List of all active exchange rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={exchangeRates} // Connect to your API
              columns={columns}
              onView={(rate) => setSelectedRate(rate)}
              onEdit={(rate) => { }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Trends</CardTitle>
            <CardDescription>Historical rate changes over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={exchangeRates}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedRate} onOpenChange={() => setSelectedRate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rate Details</DialogTitle>
            <DialogDescription>
              Historical data for {selectedRate?.currencyPair.baseCurrency}/{selectedRate?.currencyPair.quoteCurrency}
            </DialogDescription>
          </DialogHeader>

          {selectedRate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Rate Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Current Rate</p>
                      <p className="text-2xl font-bold">{selectedRate.rate.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {format(new Date(selectedRate.createdAt), 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Updated By</p>
                      <p className="font-medium">{selectedRate.admin.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">24h Change</p>
                      <p className="font-medium text-green-600">+0.05%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">7d High</p>
                      <p className="font-medium">{(selectedRate.rate * 1.02).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">7d Low</p>
                      <p className="font-medium">{(selectedRate.rate * 0.98).toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[]} // Add historical data here
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Trades</h3>
                <DataTable
                  data={[]} // Add related trades
                  columns={[
                    { header: 'Time', accessorKey: 'time' },
                    { header: 'Amount', accessorKey: 'amount' },
                    { header: 'Rate', accessorKey: 'rate' },
                  ]}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}