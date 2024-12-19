import { prisma } from "../lib/prisma";

export default class FileRepository {
	async saveFile(data: {
		filePath: string;
		invoiceId: string;
		fileSize: number;
		fileType: string;
	}) {
		await prisma.file.create({ data });
	}

	async getFileById(fileId: string) {
		return await prisma.file.findUnique({
			where: { id: fileId },
		});
	}
}
