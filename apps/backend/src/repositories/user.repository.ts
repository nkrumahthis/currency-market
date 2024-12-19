import { hashPassword } from "@/lib/auth.lib";
import { prisma } from "../lib/prisma";
import { User, UserType } from "@prisma/client";

export default class UserRepository {
	async getAll() {
		const rawUsers = await prisma.user.findMany();
		// Filter out sensitive fields
		const users = rawUsers.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			type: user.type,
		}));

		return await users;
	}

	async getById(id: string): Promise<User | null> {
		return await prisma.user.findUnique({ where: { id } });
	}

	async create(
		name: string,
		email: string,
		password: string,
		type: UserType
	): Promise<User> {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			throw new Error("Email already in use");
		}

		const hashedPassword = await hashPassword(password);
		const user = await prisma.user.create({
			data: {
				id: "system",
				name,
				email,
				password: hashedPassword,
				type,
			},
		});

		return user;
	}

	async getByEmail(email: string) {
		return await prisma.user.findUnique({ where: { email } });
	}
}