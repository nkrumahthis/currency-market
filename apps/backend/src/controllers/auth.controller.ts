import { Router } from "express";
import AuthService from "../services/auth.service";

export default function AuthController(authService: AuthService): Router {
	const router = Router();

	router.post("/register", async (req, res) => {
		const { name, email, password, type } = req.body;

		try {
			const user = await authService.register(name, email, password, type);
			res.status(201).json({ name: user.name, email: user.email });
		} catch (err) {
			console.error("Error during registration:", err);
			if (err instanceof Error) {
				res.status(401).json({ error: err.message });
			} else {
				res.status(500).json({ error: "Internal Server Error" });
			}
		}
	});

	router.post("/login", async (req, res) => {
		const { email, password } = req.body;

		try {
			const user = await authService.login(email, password);
			res.status(201).json(user); // Consider sanitization
		} catch (err) {
			console.error("Error during login:", err);

			if (err instanceof Error) {
				res.status(401).json({ error: err.message });
			} else {
				res.status(500).json({ error: "Internal Server Error" });
			}
		}
	});

	return router;
}
