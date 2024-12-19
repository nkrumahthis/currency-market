"use server";

import { cookies } from "next/headers";

export async function getInvoices() {
	const API_URL = process.env.API_URL;

	const cookieStore = cookies();
	const token = cookieStore.get("jwt")?.value;
	if (!token) {
	}

	try {
		const response = await fetch(`${API_URL}/rates`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching invoices: ", error);
		throw error;
	}
}
