'use server'

import { revalidatePath } from 'next/cache'
import { InvoiceStatus } from '@prisma/client'

const API_URL = 'http://localhost:5001'

export async function getInvoices(status?: InvoiceStatus, search?: string) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (search) params.append('search', search)

  const response = await fetch(`${API_URL}/invoices?${params}`, {
    headers: {
      'user-role': 'ADMIN'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch invoices')
  }

  const data = await response.json()
  return data.data
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user-role': 'ADMIN'
    },
    body: JSON.stringify({ status })
  })

  if (!response.ok) {
    throw new Error('Failed to update invoice')
  }

  revalidatePath('/admin/invoices')
  const data = await response.json()
  return data.data
}