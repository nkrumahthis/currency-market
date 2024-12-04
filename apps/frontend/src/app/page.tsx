"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Globe, Clock, TrendingDown, ArrowRight, CheckCircle } from 'lucide-react';
import Link from "next/link"
import Image from 'next/image';

const Home = () => {
  const [demoData, setDemoData] = useState({
    savings: 0,
    rate: 655.957,
    trades: 0
  });


  // Simulate real-time exchange rate data
  const [rateData, setRateData] = useState<{ time: string; rate: number; }[]>([]);

  useEffect(() => {
    // Generate initial rate data
    const generateRateData = () => {
      const baseRate = 655.957;
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        rate: baseRate + (Math.random() * 10 - 5)
      }));
    };

    setRateData(generateRateData());

    // Update demo metrics every 3 seconds
    const interval = setInterval(() => {
      setDemoData(prev => ({
        savings: prev.savings + 234.56,
        rate: 655.957 + (Math.random() * 2 - 1),
        trades: prev.trades + 1
      }));

      // Update rate data
      setRateData(prev => {
        const newData = [...prev.slice(1), {
          time: prev[prev.length - 1].time,
          rate: 655.957 + (Math.random() * 10 - 5)
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CurrMarket</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
                Login
              </button>
              <button className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="flex content-center">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">International Payments</span>
                    <span className="block text-blue-600">for African Importers</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Save up to 10% on your international supplier payments. Fast, secure, and reliable currency exchange at competitive rates.
                  </p>
                  <div className="flex flex-col mt-5 sm:mt-8 gap-4">
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow flex space-x-8">
                        <Link href={"/customers"} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                          Pay Your Invoice
                        </Link>
                      </div>
                    </div>
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow flex space-x-8">
                        <Link href={"/providers"} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                          Buy Forex
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <Image src="/invoice-payment-form.png" alt="" width={600} height={600} />
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Live Exchange Rate Demo
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Watch our platform in action with real-time XOF/EUR exchange rates
            </p>
          </div>

          {/* Demo Stats */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Current Rate
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {demoData.rate.toFixed(3)}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">XOF/EUR</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Savings
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          €{demoData.savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Trades Completed
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {demoData.trades}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Chart */}
          <div className="mt-10 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Exchange Rate Trend</h3>
            <div className="mt-4" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateData}>
                  <XAxis
                    dataKey="time"
                    stroke="#6B7280"
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    stroke="#6B7280"
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose CurrMarket?
            </h2>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: 'Save on Fees',
                  description: 'Reduce your international payment fees from 10% to competitive rates.',
                  icon: Wallet
                },
                {
                  name: 'Fast Settlement',
                  description: 'Complete transactions in hours instead of weeks.',
                  icon: Clock
                },
                {
                  name: 'Global Reach',
                  description: 'Pay suppliers anywhere in the world from Africa.',
                  icon: Globe
                },
                {
                  name: 'Secure & Compliant',
                  description: 'Bank-grade security with full regulatory compliance.',
                  icon: CheckCircle
                }
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Create your account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;