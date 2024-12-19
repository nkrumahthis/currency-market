const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export function verifyToken(token: string) {
    const decodedToken = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        type: string;
        iat: number;
        exp: number;
    }

    if (!decodedToken) {
        throw new Error("Invalid or expired token");
    }

    return {
        userId: decodedToken.id,
        email: decodedToken.email,
        role: decodedToken.type,
    }
}

export function generateToken(user: { id: string; email: string; type: string }) {
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
	return token;
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}
