import { hashPassword } from "@/lib/auth.lib";
import { prisma } from "../lib/prisma";
import { User } from "@prisma/client";

export class UserRepository {
	async getUserById(id: string): Promise<User | null> {
		return await prisma.user.findUnique({ where: { id } });
	}

	async createUser(
		name: string,
		email: string,
		password: string,
		type: "CUSTOMER" | "PARTNER" | "ADMIN"
	): Promise<User> {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			throw new Error("Email already in use");
		}

		const hashedPassword = await hashPassword(password);
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				type,
			},
		});

		return user;
	}

	async getUserByEmail(email: string) {
		return await prisma.user.findUnique({ where: { email } });
	}
}
