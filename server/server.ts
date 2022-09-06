import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";

export default class Server {
	private httpServer: HTTPServer;
	private app;
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
	}

	private handleSocketConnection(): void {
		this.io.on("connection", (socket) => {
			console.log("Socket connected");

			const existingSocket = this.activeSockets.find(
				(existingSocket) => existingSocket === socket.id
			);

			if (!existingSocket) {
				this.activeSockets.push(socket.id);

				socket.emit("update-user-list", {
					users: this.activeSockets.filter(
						(existingSocket) => existingSocket !== socket.id
					),
				});

				socket.broadcast.emit("update-user-list", {
					users: [socket.id],
				});
			}

			socket.on("disconnect", () => {
				this.activeSockets = this.activeSockets.filter(
					(existingSocket) => existingSocket !== socket.id
				);
				socket.broadcast.emit("remove-user", {
					socketId: socket.id,
				});
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
