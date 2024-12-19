import { Router } from "express"
import { Controllers } from "./controllers"

export default function Routes(controllers: Controllers): Router {
    const router =  Router();
    
    router.use('/auth', controllers.auth)
    router.use("/invoices", controllers.invoice)
    router.use("/trades", controllers.trade)
    router.use("/orders", controllers.order)
    router.use("/rates", controllers.rate)
    router.use('/users', controllers.user)

    return router
}


