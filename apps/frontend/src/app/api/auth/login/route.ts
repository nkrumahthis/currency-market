const API_URL = process.env.API_URL!;

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const res = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();

		if (!res.ok) {
			return Response.json(data, { status: res.status });
		}
		return Response.json(data);
	} catch (error) {
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
