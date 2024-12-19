import { Router } from "express";
import authMiddleware from "@/middlewares/auth.middleware";
import UserService from "@/services/user.service";

export default function UserController(userService: UserService): Router {
	const router = Router();

	router.get("/", async (req, res) => {
		const users = await userService.getAll();
		res.json({ data: users });
	});

	router.post("/", async (req, res) => {
		const { name, email, password, type } = req.body;
		const user = userService.create({ name, email, password, type });
		res.status(201).json(user);
	});

	return router;
}
