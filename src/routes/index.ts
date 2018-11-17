import { Router } from "express";
import confirmEmail from "./confirmEmail";

const routes = Router();

routes.use(confirmEmail);

export { routes };
