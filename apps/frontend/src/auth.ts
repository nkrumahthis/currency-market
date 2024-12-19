import NextAuth from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/zod";
// Your own logic for dealing with plaintext password strings; be careful!
const API_URL = process.env.API_URL;
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

async function login(user: { email: string; password: string }) {
	try {
		const res = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});

		if (!res.ok) {
			console.error(`Error registering user: ${res.statusText}`);
			throw new Error("error registering user");
		}

		const data = await res.json();

		return {
            id: data.id,
            name: data.name,
            email: data.email,
            image: data.image,
            role: data.role,
        };
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

export async function decrypt(token: string) {
	const payload = (await jwt.verify(token, JWT_SECRET)) as {
		userId: string;
		email: string;
		role: string;
	};
	return payload;
}


export const { handlers, auth } = NextAuth({
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				try {
					let user = null;

					const { email, password } =
						await signInSchema.parseAsync(credentials);

					user = await login({ email, password });

					if (!user) {
						throw new Error("Invalid credentials.");
					}

					// return JSON object with the user data
					return {
                        id: user.userId,

                    };
				} catch (error) {
					if (error instanceof ZodError) {
						// Return `null` to indicate that the credentials are invalid
						return null;
					}
				}
			},
		}),
	],
});
