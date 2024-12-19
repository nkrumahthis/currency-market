'use server'

import { UserType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const API_URL = 'http://localhost:5001'

export async function getInvoices(userId: string, role: UserType) {
  const response = await fetch(`${API_URL}/invoices`, {
    headers: {
      'user-role': role,
      'user-id': userId
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch invoices')
  }

  const data = await response.json()
  revalidatePath('/customers')
  return data.data
}
