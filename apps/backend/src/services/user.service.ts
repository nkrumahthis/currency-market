import UserRepository from "@/repositories/user.repository";
import { User, UserType } from "@prisma/client";

export default class UserService {
	constructor(private readonly userRepository: UserRepository) {}
	async getAll() {
		return this.userRepository.getAll();
	}

	async create(user: {
		name: string;
		email: string;
		password: string;
		type: UserType;
	}) {
		return this.userRepository.create(
			user.name,
			user.email,
			user.password,
			user.type
		);
	}
}
