import express, { Application } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import { generateUsername } from "unique-username-generator";
import DeviceDetector from "device-detector-js";
import { ActiveDevices } from "./iserver";

export default class CopyTextServer {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private activeDevices: ActiveDevices[] = [];
	private readonly DEFAULT_PORT = process.env.PORT || 8080;
	private deviceDetector: DeviceDetector;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.io = new SocketIOServer(this.httpServer);
		this.deviceDetector = new DeviceDetector();

		this.configureApp();
		this.handleSocketConnection();
	}

	private handleSocketConnection(): void {
		this.handleSocketConnectionError();

		this.io.on("connection", (socket) => {
			console.log("Socket connected");

			this.handleDeviceConnection(socket);
			this.handleSendClipboardContent(socket);
			this.handleDeviceDisconnection(socket);
		});
	}

	/**
	 * Emits an event when a device disconnects from the network
	 *
	 * @param socket
	 */
	private handleDeviceDisconnection(socket: Socket): void {
		socket.on("disconnect", () => {
			console.log("Socket disconnected");

			// update devices list
			this.activeDevices = this.activeDevices.filter(
				(existingDevice) => existingDevice.id !== socket.id
			);

			socket.broadcast.emit("disconnected-device", {
				devices: this.activeDevices,
			});
		});
	}

	/**
	 * Emits an event that sends clipboard content to connected devices
	 * on the network
	 *
	 * @param socket
	 */
	private handleSendClipboardContent(socket: Socket): void {
		socket.on("send-clipboard-content", (clipboard) => {
			socket.broadcast.emit("sent-clipboard-content", {
				sender: clipboard.sender,
				receiver: clipboard.receiver,
				content: clipboard.content,
			});
		});
	}

	/**
	 * Emits an event when a new device connects to the server
	 *
	 * @param socket
	 */
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
				userAgent: this.deviceDetector.parse(
					socket.request.headers["user-agent"] || ""
				),
				clientIp: clientIpAddress,
			};

			// save newly connected device
			this.activeDevices.push(newlyConnectedDevice);

			socket.emit("updated-devices-list", {
				activeDevices: this.activeDevices,
			});

			socket.broadcast.emit("updated-devices-list", {
				activeDevices: this.activeDevices,
			});

			socket.emit("connected", { id: socket.id });
		}
	}

	/**
	 * Logs an error message on socket connection error
	 */
	private handleSocketConnectionError(): void {
		this.io.on("connect_error", (err) => {
			console.log(`Socket connection error due to ${err.message}`);
		});
	}

	/**
	 * Configures express to serve html files in ../public directory
	 */
	private configureApp(): void {
		this.app.use(express.static(path.join(__dirname, "../public")));
	}

	public listen(callback: (port: string | number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () =>
			callback(this.DEFAULT_PORT)
		);
	}
}
