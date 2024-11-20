"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketHandler = void 0;
var ws_1 = __importDefault(require("ws"));
var MatchingEngine_1 = __importDefault(require("@/engine/MatchingEngine"));
var WebSocketHandler = /** @class */ (function () {
    function WebSocketHandler() {
        this.wss = new ws_1.default.Server();
        this.matchingEngine = new MatchingEngine_1.default();
        this.clients = new Map();
    }
    WebSocketHandler.prototype.setupWebSocket = function () {
        var _this = this;
        this.wss.on("connection", function (ws) {
            var clientId = _this.generateClientId();
            // Store client metadata
            _this.clients.set(ws, {
                id: clientId,
                subscriptions: new Set(["orderbook"]),
                lastSeen: Date.now(),
            });
            ws.on("message", function (message) { return _this.handleMessage(ws, message.toString()); });
        });
    };
    WebSocketHandler.prototype.generateClientId = function () {
        return "client-".concat(Math.random().toString(36).substring(2, 9));
    };
    WebSocketHandler.prototype.handleMessage = function (ws, message) {
        try {
            var data = JSON.parse(message);
            var client = this.clients.get(ws);
            if (!client) {
                console.error("Client not found for WebSocket connection");
                return;
            }
            switch (data.type) {
                case "order":
                    this.handleOrderSubmission(client, ws, data.channels);
            }
        }
        catch (err) {
            console.error("Error processing WebSocket message: ".concat(err.message));
            this.sendError(ws, err.message);
        }
    };
    WebSocketHandler.prototype.handleOrderSubmission = function (client, ws, order) {
        try {
            order.userId = client.id;
            order.timestamp = Date.now();
            var result = this.matchingEngine.submitOrder(order);
            this.send(ws, {
                type: "orderResult",
                payload: {
                    orderId: result.id,
                    status: "accepted",
                },
                timestamp: result.timestamp,
            });
        }
        catch (err) {
            this.sendError(ws, err.message);
        }
    };
    WebSocketHandler.prototype.send = function (ws, message) {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };
    WebSocketHandler.prototype.sendError = function (ws, errorMessage) {
        this.send(ws, {
            type: "error",
            payload: { message: errorMessage },
            timestamp: Date.now(),
        });
    };
    return WebSocketHandler;
}());
exports.WebSocketHandler = WebSocketHandler;
