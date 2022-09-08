import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";

export default class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private activeSockets: string[] = [];
	private readonly DEFAULT_PORT = 3000;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.io = new SocketIOServer(this.httpServer);

		this.configureApp();
		this.handleRoute();
		this.handleSocketConnection();
		this.handleSocketDisconnection();
	}

	private handleSocketConnection(): void {
		// handle socket connection
		this.io.on("connection", (socket) => {
			console.log("Socket connected");

			const existingSocket = this.activeSockets.find(
				(existingSocket) => existingSocket === socket.id
			);

			if (!existingSocket) {
				this.activeSockets.push(socket.id);

				socket.emit("update-devices-list", {
					devices: this.activeSockets.filter(
						(existingSocket) => existingSocket !== socket.id
					),
				});

				socket.broadcast.emit("update-devices-list", {
					devices: [socket.id],
				});
			}

			// handle message
			socket.on("send-message", (message) => {
				message = socket.id + ": " + message;
				this.io.emit("sent-message", message);
			});
		});

		// log socket connection error
		this.io.on("connect_error", (err) => {
			console.log(`Socket connect_error due to ${err.message}`);
		});
	}

	private handleSocketDisconnection(): void {
		this.io.on("disconnect", (socket) => {
			this.activeSockets = this.activeSockets.filter(
				(existingSocket) => existingSocket !== socket.id
			);
			socket.broadcast.emit("removed-device", {
				socketId: socket.id,
			});
		});
	}

	private configureApp(): void {
		this.app.use(express.static(path.join(__dirname, "../public")));
	}

	private handleRoute(): void {
		this.app.get("/", (req, res) => {
			res.send(`<h2>Server Running..</h2>`);
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () =>
			callback(this.DEFAULT_PORT)
		);
	}
}
