import MatchingEngine from "@/backend/engine/MatchingEngine"
import express from "express"
import dotenv from "dotenv"
import { NewOrderRequest } from "@/types"
dotenv.config()

const PORT = process.env.REST_API_PORT || 3000

const app = express()

const matchingEngine = new MatchingEngine()
const router =  express.Router()
app.use(express.json())
app.use("/api", router)

router.get("/trades", (_req, res) => {
    // return all trades from matching engine
    const trades = matchingEngine.getRecentTrades(100)
    res.json({data: trades})
})

router.get("/", (_req, res) => {
    res.json({data: "Welcome to Currency Exchange Market"})   
})

router.post("/orders", (req, res) => {
    // get body from request body
    const newOrderRequest = req.body as NewOrderRequest
    const order = matchingEngine.createOrder(newOrderRequest)
    // submit order to matching engine
    console.log(order)
    const submittedOrder = matchingEngine.submitOrder(order)
    res.json({data: submittedOrder})
})

router.get("/market-price", (_req, res) => {
    const marketPrice = matchingEngine.getMarketPrice();
    res.json({data: marketPrice})
})

router.get("/order-book", (_req, res) => {
    const orderBook = matchingEngine.getOrderBookSummary();
    res.json({data: orderBook})
})

router.get("/order-book/summary", (_req, res) => {
    res.json({data: "fuck"})
})

router.get("/order-book/detailed", (_req, res) => {
    res.json({data: "fuck but with details"})
})

router.get("/")

app.listen((PORT), () => {
    console.log(`Server running on port ${PORT}`)
})