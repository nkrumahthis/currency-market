import UserRepository from "../repositories/user.repository";
import { comparePasswords, generateToken } from "@/lib/auth.lib";

export default class AuthService {
	constructor(private readonly userRepository: UserRepository) {}

	async register(
		name: string,
		email: string,
		password: string,
		type: "CUSTOMER" | "PARTNER" | "ADMIN"
	) {
		const user = await this.userRepository.create(name, email, password, type);
		return {
			name: user.name,
			email: user.email,
			type: user.type,
		};
	}

	async login(email: string, password: string) {
		const user = await this.userRepository.getByEmail(email);
		if (!user) {
			throw new Error("Invalid credentials.");
		}

		const isPasswordValid = comparePasswords(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid credentials.");
		}

		// Generate and return a new JWT token
		const token = generateToken({
			id: user.id,
			email: user.email,
			type: user.type,
		});

		return { token, userId: user.id, email: user.email, role: user.type };
	}
}
