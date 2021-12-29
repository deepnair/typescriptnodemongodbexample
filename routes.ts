import {Express, Request, Response} from "express"
import { createProductHandler, deleteProductHandler, getProductHandler, updateProductHandler } from "./controller/product.controller";
import { createUserSessionHandler, deleteSessionsHandler, getSessionsHandler } from "./controller/session.controller";
import createUserHandler from "./controller/user.controller";
import requireUser from "./middleware/requireUser";
import validateResource from "./middleware/validateResource"
import { createProductSchema, deleteProductSchema, getProductSchema, updateProductSchema } from "./schema/product.schema";
import createSessionSchema from "./schema/session.schema";
import { createUserSchema } from "./schema/user.schema";

const routes = (app: Express) => {
    app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

    app.route("/api/v1/user").post(validateResource(createUserSchema), createUserHandler)

    app.route("/api/v1/sessions").post(validateResource(createSessionSchema), createUserSessionHandler).get(requireUser, getSessionsHandler).delete(requireUser, deleteSessionsHandler);

    app.route("/api/v1/product").post([requireUser, validateResource(createProductSchema)], createProductHandler)

    app.route("/api/v1/product/:productId").get(validateResource(getProductSchema), getProductHandler).patch([requireUser, validateResource(updateProductSchema)], updateProductHandler).delete([requireUser, validateResource(deleteProductSchema)], deleteProductHandler);
    
}

export default routes;