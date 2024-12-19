import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { decrypt } from "./auth";

const SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
	const token = req.cookies.get("token")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if not authenticated
	}

	try {
		const decoded = await decrypt(token);
    console.log(decoded)

		if (decoded.role !== "CUSTOMER") {
			return NextResponse.redirect(new URL("/dashboard", req.url)); // Redirect to dashboard if not a customer
		}

		return NextResponse.next(); // Allow access
	} catch (error) {
		console.error("Invalid token:", error);
		return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if token is invalid
	}
}

export const config = {
	matcher: ["admin"],
};
