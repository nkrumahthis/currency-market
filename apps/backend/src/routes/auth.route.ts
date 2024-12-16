import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

// helper to generate jwt
function generateToken(user: { id: string; email: string; type: string }) {
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
	return token;
}

router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ error: "Email already in use." });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				type: "CUSTOMER",
			},
		});

		res.status(201).json({ name: user.name, email: user.email });
	} catch (err: Error | unknown) {
        if (err instanceof Error)
		    console.error("Error during registration: " + err.message);
        else
            console.error("Error during registration: " + err)

		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials." });
		}
        // Replying 401 again because I don't want to give clues about the 
        // existence of the user
		const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials." });
		}

        // create and return a new JWT token
		const token = generateToken({
			id: user.id,
			email: user.email,
			type: user.type,
		});

		res.status(201).json({ token });
	} catch (err: Error | unknown) {
        if (err instanceof Error)
		    console.error("Error during registration: " + err.message);
        else
            console.error("Error during registration: " + err)

		res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router