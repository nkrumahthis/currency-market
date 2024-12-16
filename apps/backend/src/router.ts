import { Router } from "express"
import type { NewOrderRequest } from "@/types"
import MatchingEngine from "@/engine/MatchingEngine"
import authRoutes from "@/routes/auth.route"

const router =  Router()
const matchingEngine: MatchingEngine = new MatchingEngine();

router.use('/auth', authRoutes)

router.get("/trades", (_, res) => {
    // return all trades from matching engine
    const trades = matchingEngine.getRecentTrades(100)
    res.json({data: trades})
})

router.get("/", (_, res) => {
    res.json({data: "Welcome to African Currency Exchange (AfriCuRex) Market "})   
})

router.post("/orders", (req, res) => {
    // get body from request body
    const newOrderRequest = req.body as NewOrderRequest
    const order = matchingEngine.createOrder(newOrderRequest)
    // submit order to matching engine
    const submittedOrder = matchingEngine.submitOrder(order)
    res.json({data: submittedOrder})
})

router.get("/market-price", (_req, res) => {
    const marketPrice = matchingEngine.getMarketPrice();
    res.json({data: marketPrice})
})

router.get("/order-book", (_req, res) => {
    const orderBook = matchingEngine.getOrderBook(100, true);
    res.json({data: orderBook})
})

router.get("/order-book/summary", (_req, res) => {
    res.json({data: "fuck"})
})

router.get("/order-book/detailed", (_req, res) => {
    res.json({data: "fuck but with details"})
})

export default router