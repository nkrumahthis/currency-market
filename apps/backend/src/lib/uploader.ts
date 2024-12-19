import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs";

const bucketName = "currency-market";

export interface IFileUploader {
	uploadFile(file: Express.Multer.File, fileId: String): Promise<string>;
	downloadFile(filePath: string, destinationPath: string): Promise<void>;
}

export class S3FileUploader implements IFileUploader {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({
			region: "us-east-1",
			credentials: {
				accessKeyId: process.env.aws_access_key_id!,
				secretAccessKey: process.env.aws_secret_access_key!,
			},
		});
	}

	async uploadFile(file: Express.Multer.File, fileId: string): Promise<string> {
		const destinationPath = `currmark/uploads/${fileId}`;

		const params = {
			Bucket: bucketName,
			Key: destinationPath,
			Body: file.buffer,
			ContentType: file.mimetype,
		};
		try {
			// const command = new PutObjectCommand(params);
			// const response = await this.client.send(command);
			const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${destinationPath}`;
			// console.log(`File uploaded successfully at ${response}`);
			console.warn(`file upload did not happen, but the fileUrl is ${fileUrl}`);
			return fileUrl;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to upload file to S3");
		}
	}

	async downloadFile(filePath: string, destinationPath: string): Promise<void> {
		const params = {
			Bucket: bucketName,
			Key: filePath,
		};
		const command = new GetObjectCommand(params);
		const response = await this.client.send(command);

		// if (response.Body) {
		// 	fs.writeFileSync(destinationPath, response.);
		// } else {
		// 	throw new Error("File download failed, no data returned from S3");
		// }
	}
}
