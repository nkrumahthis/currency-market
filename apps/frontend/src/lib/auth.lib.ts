const API_URL = process.env.API_URL;

export async function login(user: { email: string; password: string }) {
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
