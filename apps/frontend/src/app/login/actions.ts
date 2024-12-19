import { cookies } from "next/headers";

const API_URL = process.env.API_URL;
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";
import jwt from "jsonwebtoken";

export async function login(user: { email: string; password: string }) {
	const cookieStore = cookies();

	try {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});

		if (!res.ok) {
			console.error(`Error logging user in: ${res.statusText}`);
			throw new Error("error logging user in");
		}

		const data = (await res.json()) as {
			token: string;
			userId: string;
			email: string;
			role: string;
		};

		cookieStore.set("token", data.token, {
			expires: new Date(Date.now() + 10 * 1000),
			httpOnly: true,
		});

		return data;
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
		throw new Error("Internal Server Error");
	}
}

export async function logout() {
	// Destroy the session
	cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
	const session = cookies().get("session")?.value;
	if (!session) return null;
	return await decrypt(session);
}

export async function decrypt(input: string): Promise<any> {
	const payload = (await jwt.verify(input, JWT_SECRET)) as {
		userId: string;
		email: string;
		role: string;
	};
	return payload;
}
