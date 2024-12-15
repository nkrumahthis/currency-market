const API_URL = process.env.API_URL;

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const res = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			console.error(`Error registering user: ${res.statusText}`);
			return Response.json({"error": "error registering user"}, { status: res.status });
		}

		const data = await res.json();

		return Response.json(data);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
