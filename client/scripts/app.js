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
		async handlePasteBtn(device) {
			if (this.clipboardApiAvailable()) {
				navigator.clipboard.readText().then((text) => {
					console.log("tex");
					this.sendClipboardContentToServer(device, text);
				});
			} else {
				const textToCopy = document.getElementById("content-to-copy");

				if (textToCopy.value !== "") {
					this.sendClipboardContentToServer(device, textToCopy.value);
				}
			}

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

		clipboardApiAvailable() {
			return navigator.clipboard !== undefined;
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
