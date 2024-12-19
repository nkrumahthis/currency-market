import { log } from "@repo/logger";
import Routes from "./router";
import express from "express";
import cors from "cors";

import Controllers from "@/controllers"
import Repositories from "@/repositories";
import Services from "@/services";
import MatchingEngine, { IMatchingEngine } from "./domain/MatchingEngine";

const port = process.env.PORT || 5001;
const app = express();
app
	.disable("x-powered-by")
	.use(express.json())
	.use(cors())
	.get("/status", (_, res) => {
		return res.json({ ok: true });
	})
	.get("/", (_, res) => {
		res.json({
			data: "Welcome to African Currency Exchange (AfriCuRex) Market ",
		});
	});

const matchingEngine: IMatchingEngine = MatchingEngine.getInstance()
  
const repositories = Repositories()
const services = Services(repositories, matchingEngine)
const controllers = Controllers(services)

app.use(Routes(controllers));

app.listen(port, () => {
	log(`api running on http://localhost:${port}`);
});
