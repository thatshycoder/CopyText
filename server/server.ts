import express, { Application } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import { generateUsername } from "unique-username-generator";
import { Navigator } from "node-navigator";

export default class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private activeDevices: any[] = [];
	private readonly DEFAULT_PORT = process.env.PORT;
	private navigator: Navigator;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.io = new SocketIOServer(this.httpServer);
		this.navigator = new Navigator();

		this.configureApp();
		this.handleSocketConnection();
	}

	private handleSocketConnection(): void {
		this.handleSocketConnectionError();

		this.io.on("connection", (socket) => {
			console.log("Socket connected");

			this.handleDeviceConnection(socket);
			this.handleReceiveClipboardContent(socket);
			this.handleSocketDisconnection(socket);
		});
	}

	private handleSocketDisconnection(socket: Socket): void {
		socket.on("disconnect", () => {
			console.log("socket disconnected");

			this.activeDevices = this.activeDevices.filter(
				(existingDevice) => existingDevice.id !== socket.id
			);

			socket.broadcast.emit("removed-device", {
				devices: this.activeDevices,
			});
		});
	}

	private handleReceiveClipboardContent(socket: Socket): void {
		socket.on("save-clipboard-content", (clipboard) => {

			socket.broadcast.emit("saved-clipboard-content", {
				owner: clipboard.owner,
				device: clipboard.device,
				content: clipboard.content,
			});
		});
	}

	private handleDeviceConnection(socket: Socket): void {
		const deviceUsername = generateUsername("", 0, 4);
		const clientIpAddress =
			socket.request.headers["x-forwarded-for"] ||
			socket.request.socket.remoteAddress ||
			null;

		const existingDevice = this.activeDevices.find(
			(existingDevice) => existingDevice.username === deviceUsername
		);

		// check if connected device is unique
		if (!existingDevice) {
			const newlyConnectedDevice = {
				id: socket.id,
				username: deviceUsername,
				platform: this.navigator.userAgent,
				clientIp: clientIpAddress,
			};

			// save newly connected device
			this.activeDevices.push(newlyConnectedDevice);

			socket.emit("update-devices-list", {
				device: deviceUsername,
				activeDevices: this.activeDevices,
				platform: this.navigator.userAgent,
				clientIp: clientIpAddress,
			});

			socket.broadcast.emit("update-devices-list", {
				device: deviceUsername,
				activeDevices: this.activeDevices,
				platform: this.navigator.userAgent,
				clientIp: clientIpAddress,
			});

			socket.emit("connected", { id: socket.id });
		}
	}

	private handleSocketConnectionError(): void {
		this.io.on("connect_error", (err) => {
			console.log(`Socket connect_error due to ${err.message}`);
		});
	}

	private configureApp(): void {
		this.app.use(express.static(path.join(__dirname, "../client")));
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () =>
			callback(this.DEFAULT_PORT)
		);
	}
}
