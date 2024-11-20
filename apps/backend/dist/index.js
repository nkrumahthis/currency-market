"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MatchingEngine_1 = __importDefault(require("@/engine/MatchingEngine"));
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var PORT = process.env.REST_API_PORT || 3001;
var app = (0, express_1.default)();
var matchingEngine = new MatchingEngine_1.default();
var router = express_1.default.Router();
app.use(express_1.default.json());
app.use("/api", router);
router.get("/trades", function (_req, res) {
    // return all trades from matching engine
    var trades = matchingEngine.getRecentTrades(100);
    res.json({ data: trades });
});
app.get("/", function (_req, res) {
    res.json({ data: "Welcome to Currency Exchange Market" });
});
router.post("/orders", function (req, res) {
    // get body from request body
    var newOrderRequest = req.body;
    var order = matchingEngine.createOrder(newOrderRequest);
    // submit order to matching engine
    console.log(order);
    var submittedOrder = matchingEngine.submitOrder(order);
    res.json({ data: submittedOrder });
});
router.get("/market-price", function (_req, res) {
    var marketPrice = matchingEngine.getMarketPrice();
    res.json({ data: marketPrice });
});
router.get("/order-book", function (_req, res) {
    var orderBook = matchingEngine.getOrderBook(100, true);
    res.json({ data: orderBook });
});
router.get("/order-book/summary", function (_req, res) {
    res.json({ data: "fuck" });
});
router.get("/order-book/detailed", function (_req, res) {
    res.json({ data: "fuck but with details" });
});
router.get("/");
app.listen((PORT), function () {
    console.log("Server running on port ".concat(PORT));
});
