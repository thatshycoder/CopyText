// socket.io instance
const socket = io();

const App = {
	el: "#app",

	data: {
		display: "uus33",
		// ensure to show only devices on the same network
		connectedDevices: [],
	},

	methods: {
		handlePasteBtn(device) {
			alert(device);

			// get device clipboard content
		},

		handleCopyBtn(device) {
			alert(device);
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

		socket.on("sent-message", (message) => {
			console.log(message);
			this.updateMessage(message);
		});
	},
};

export default App;
