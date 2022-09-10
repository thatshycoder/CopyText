import express, { Application } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import { generateUsername } from "unique-username-generator";

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
		this.handleSocketConnection();
		this.handleSocketDisconnection();
	}

	private handleSocketConnection(): void {
		this.handleSocketConnectionError();

		this.io.on("connection", (socket) => {
			console.log("Socket connected");

			this.handleDeviceConnection(socket);
			this.handleMessage(socket);
		});
	}

	private handleMessage(socket: Socket): void {
		socket.on("send-message", (message) => {
			this.io.emit("sent-message", message);
		});
	}

	private handleDeviceConnection(socket: Socket): void {
		//
		const deviceUsername = generateUsername("", 0, 4);

		const existingSocket = this.activeSockets.find(
			(existingSocket) => existingSocket === deviceUsername
		);

		if (!existingSocket) {
			this.activeSockets.push(deviceUsername);

			socket.emit("update-devices-list", {
				devices: this.activeSockets.filter(
					(existingSocket) => existingSocket !== deviceUsername
				),
			});

			socket.broadcast.emit("update-devices-list", {
				devices: deviceUsername,
			});
		}
	}

	private handleSocketConnectionError(): void {
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

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () =>
			callback(this.DEFAULT_PORT)
		);
	}
}
