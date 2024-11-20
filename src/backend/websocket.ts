import WebSocket from "ws";
import MatchingEngine from "@/backend/engine/MatchingEngine";
import { Order, OrderBook, Trade } from "@/types";

type Client = {
  id: string;
  subscriptions: Set<string>;
  lastSeen: number;
};

type ErrorPayload = {
  message: string;
};

type OrderResult = {
  orderId: string;
  status: "pending" | "accepted" | "rejected";
};

type OrderBookUpdate = {
  orderBook: OrderBook;
  marketPrice: number;
};

type MessagePacket = {
  type:
    | "order"
    | "trade"
    | "orderbook"
    | "orderResult"
    | "orderBookUpdate"
    | "error";
  payload:
    | Order
    | Trade
    | OrderBook
    | OrderResult
    | OrderBookUpdate
    | ErrorPayload;
  timestamp: number;
};

export class WebSocketHandler {
  private wss;
  private matchingEngine: MatchingEngine;
  private clients: Map<WebSocket, Client>;

  constructor() {
    this.wss = new WebSocket.Server();
    this.matchingEngine = new MatchingEngine();
    this.clients = new Map();
  }

  setupWebSocket() {
    this.wss.on("connection", (ws) => {
      const clientId = this.generateClientId();

      // Store client metadata
      this.clients.set(ws, {
        id: clientId,
        subscriptions: new Set(["orderbook"]),
        lastSeen: Date.now(),
      });

      ws.on("message", (message) => this.handleMessage(ws, message.toString()));
    });
  }

  generateClientId() {
    return `client-${Math.random().toString(36).substring(2, 9)}`;
  }

  handleMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(ws);

      if (!client) {
        console.error(`Client not found for WebSocket connection`);
        return;
      }

      switch (data.type) {
        case "order":
          this.handleOrderSubmission(client, ws, data.channels);
      }
    } catch (err: any) {
      console.error(`Error processing WebSocket message: ${err.message}`);
      this.sendError(ws, err.message);
    }
  }

  handleOrderSubmission(client: Client, ws: WebSocket, order: Order) {
    try {
      order.userId = client.id;
      order.timestamp = Date.now();

      const result = this.matchingEngine.submitOrder(order);

      this.send(ws, {
        type: "orderResult",
        payload: {
          orderId: result.id,
          status: "accepted",
        } as OrderResult,
        timestamp: result.timestamp,
      } as MessagePacket);

    } catch (err: any) {
      this.sendError(ws, err.message);
    }
  }

  send(ws: WebSocket, message: MessagePacket) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws: WebSocket, errorMessage: string) {
    this.send(ws, {
      type: "error",
      payload: { message: errorMessage } as ErrorPayload,
      timestamp: Date.now(),
    });
  }
}
