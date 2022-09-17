// socket.io instance
const socket = io();

const App = {
	el: "#app",

	data: {
		// show dynamic icons for different devices
		activeDevice: "",
		activeDeviceIp: "",
		activeDevices: [],
		devicesClipboard: {},
		copiedContent: "",
	},

	methods: {
		handlePasteBtn(receiver) {
			if (
				this.clipboardApiAvailable() &&
				this.clipboardApiAvailableOnFirefox()
			) {
				navigator.clipboard.readText().then((text) => {
					this.sendPastedTextsToServer(receiver, text);
				});
			} else {
				const textToSend = document.getElementById("content-to-copy");

				if (textToSend.value !== "") {
					this.sendPastedTextsToServer(receiver, textToSend.value);
				} else {
					alert("No text to share!");
				}
			}
		},

		// emits an event that sends the pasted texts to the server
		sendPastedTextsToServer(receiver, content) {
			socket.emit("send-clipboard-content", {
				sender: this.activeDevice,
				receiver: receiver,
				content: content,
			});

			// TODO: Display nicer alerts
			alert("Pasted text on this device!");
		},

		clipboardApiAvailableOnFirefox() {
			return typeof navigator.clipboard.readText !== "undefined";
		},

		clipboardApiAvailable() {
			return typeof navigator.clipboard !== "undefined";
		},

		getAllDevices() {
			// get all active devices currently connected to the same network
			// (The devices needs to have the same ip address to confirm they're on
			// the same network) - TODO: Improve this later?
			return this.activeDevices.filter(
				(device) =>
					device.username !== this.activeDevice &&
					device.clientIp == this.activeDeviceIp
			);
		},

		// render active devices list grid correctly & nicely
		getDevicesColClasses() {
			if (this.getAllDevices().length > 0) {
				if (this.getAllDevices().length < 3) {
					return "align-self-center col-12 col-md-6 col-lg-6";
				}
			}

			return "align-self-center col-12 col-md-4 col-lg-4";
		},

		// show recieved texts to the receiver
		showReceivedTexts(socket) {
			if (this.activeDevice == socket.receiver) {
				const el = document.getElementById("clipboard-content");
				el.value = socket.content;

				this.copiedContent = socket.content;
			}
		},

		updateactiveDevicesList(devices) {
			this.activeDevices = devices;
		},
	},

	mounted() {
		// update device list when a new device is connected
		socket.on("updated-devices-list", (socket) => {
			console.log("Device connected successfully");
			this.updateactiveDevicesList(socket.activeDevices);
		});

		// store connected device username and ip address
		socket.on("connected", (socket) => {
			const activeDeviceInfo = this.activeDevices.filter(
				(device) => device.id === socket.id
			)[0];

			this.activeDevice = activeDeviceInfo.username;
			this.activeDeviceIp = activeDeviceInfo.clientIp;
		});

		// save device clipboard information whenever it's updated
		socket.on("sent-clipboard-content", (socket) => {
			this.devicesClipboard[socket.sender] = {
				authorizedDevice: socket.receiver,
				clipboardContent: socket.content,
			};

			this.showReceivedTexts(socket);
		});

		// handles device disconnection event
		socket.on("disconnected-device", (socket) => {
			this.updateactiveDevicesList(socket.devices);
		});
	},
};

export default App;
