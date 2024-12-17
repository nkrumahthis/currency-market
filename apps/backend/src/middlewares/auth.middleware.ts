import * as authLib from "@/lib/auth.lib";
import express from "express";

interface User {
	userId: string;
	role: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

const authMiddleware = (requiredRoles: string[]) => {
	return (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({ error: "Unauthorized: Missing token" });
		}

		const token = authHeader.split(" ")[1];

		try {
			const decodedToken = authLib.verifyToken(token);
			console.log(decodedToken)
			const user = {
				userId: decodedToken.userId,
				role: decodedToken.role,
			};

			console.log(requiredRoles, user)

			if (!requiredRoles.includes(user.role)) {
				return res
					.status(403)
					.json({ error: "Forbidden: Insufficient permissions" });
			}

			req.user = user;
			next();
		} catch (error) {
			console.error("Error verifying token:", error);
			return res
				.status(401)
				.json({ error: "Unauthorized: Invalid or expired token" });
		}
	};
};

export default authMiddleware;
