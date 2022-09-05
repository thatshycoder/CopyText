import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

export default class Server {
	private httpServer: HTTPServer;
	private app;
	private io: SocketIOServer;

	private readonly DEFAULT_PORT = 3000;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.io = new SocketIOServer(this.httpServer);

		this.handleRoute;
		this.handleSocketConnection();
	}

	private handleSocketConnection(): void {
		this.io.on("connection", (socket) => {
			console.log("Socket connected");
		});
	}

	private handleRoute(): void {
		this.app.get("/", (req, res) => {
			res.send("Hello");
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () =>
			callback(this.DEFAULT_PORT)
		);
	}
}
