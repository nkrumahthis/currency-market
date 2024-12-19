import { getInvoices } from "./actions"
import React, { Suspense } from 'react'
import InvoicesClient from "./invoices-client"


export default async function AdminInvoicesPage() {
    const initialInvoices = await getInvoices()

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoicesClient initialInvoices={initialInvoices} />
        </Suspense>
    )
}