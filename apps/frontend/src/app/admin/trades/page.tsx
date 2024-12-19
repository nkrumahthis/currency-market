import React, { Suspense } from 'react'
import { getTrades } from './actions'
import TradesClient from './trades-page'


export default async function AdminTradesPage() {
  const initialTrades = await getTrades()
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <TradesClient initialTrades={initialTrades} />
    </Suspense>)
}