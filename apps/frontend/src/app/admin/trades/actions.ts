'use server'

import { revalidatePath } from 'next/cache'
import { TradeStatus } from '@prisma/client'

const API_URL = 'http://localhost:5001'

export async function getTrades() {
  const response = await fetch(`${API_URL}/trades`, {
    headers: {
      'user-role': 'ADMIN'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch trades')
  }

  const data = await response.json()
  return data.data
}

export async function updateTradeStatus(tradeId: string, status: TradeStatus) {
  const response = await fetch(`${API_URL}/trades/${tradeId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user-role': 'ADMIN'
    },
    body: JSON.stringify({ status })
  })

  if (!response.ok) {
    throw new Error('Failed to update trade')
  }

  revalidatePath('/admin/trades')
  const data = await response.json()
  return data.data
}