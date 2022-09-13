// socket.io instance
const socket = io();

const App = {
	el: "#app",

	data: {
		// ensure to show only devices on the same network
		connectedDevice: "",
		connectedDevices: [],
		devicesClipboard: {},
		copiedContent: "",
	},

	methods: {
		handlePasteBtn(device) {
			// copy device clipboard content
			navigator.clipboard.readText().then((text) => {
				this.sendClipboardContentToServer(device, text);
			});

			alert("Pasted text on this device!");
		},

		sendClipboardContentToServer(device, content) {
			socket.emit("save-clipboard-content", {
				owner: this.connectedDevice,
				device: device,
				content: content,
			});
		},

		updateConnectedDevicesList(devices) {
			this.connectedDevices = devices;
		},

		getAllDevices() {
			const devices = this.connectedDevices.filter(
				(device) => device.username !== this.connectedDevice
			);

			return devices;
		},
	},

	mounted() {
		socket.on("update-devices-list", (socket) => {
			console.log("New device connected");
			this.updateConnectedDevicesList(socket.activeDevices);
		});

		socket.on("connected", (socket) => {
			this.connectedDevice = this.connectedDevices.filter(
				(device) => device.id === socket.id
			)[0].username;
		});

		socket.on("saved-clipboard-content", (socket) => {
			// TODO: Add support for multiple devices
			// TODO: Show copied content only for the right device
			this.devicesClipboard[socket.owner] = {
				authorizedDevice: socket.device,
				clipboardContent: socket.content,
			};

			if (this.connectedDevice == socket.device) {
				const el = document.getElementById("clipboard-content");
				el.value = socket.content;

				this.copiedContent = socket.content;
			}
		});

		socket.on("removed-device", (socket) => {
			console.log("Device disconnected");
			this.updateConnectedDevicesList(socket.devices);
		});
	},
};

export default App;
