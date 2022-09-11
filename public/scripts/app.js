// socket.io instance
const socket = io();

const App = {
	el: "#app",

	data: {
		display: "uus33",
		// ensure to show only devices on the same network
		connectedDevices: [],
		devicesClipboard: {},
	},

	methods: {
		handlePasteBtn(device) {
			// copy device clipboard content
			navigator.clipboard.readText().then((text) => {
				this.devicesClipboard[device] = {
					authorizedDevices: [],
					clipboardContent: text,
				};

				console.log(JSON.stringify(this.devicesClipboard));
			});
		},

		handleCopyBtn(device) {
			// check if device is part of devices authorized to copy content
		},

		//handle new device connection
		updateConnectedDevicesList(devices) {
			this.connectedDevices = devices;
		},

		sendMessage() {
			const message = document.getElementById("message");

			// if (message.value) {
			// 	socket.emit("send-message", message.value);
			// }

			// message.value = "";
		},

		updateMessage(message) {
			const messages = document.getElementById("messagesList");
			//messages.innerText = `${messages.innerText}  \n  ${message}`;
		},
	},

	mounted() {
		socket.on("update-devices-list", (socket) => {
			console.log("New device connected");
			this.updateConnectedDevicesList(socket.devices);
		});

		socket.on("removed-device", (socket) => {
			console.log("disconnected");
			this.updateConnectedDevicesList(socket.devices);
		});
	},
};

export default App;
