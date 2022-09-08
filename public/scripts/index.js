// // get device audio and video stream
// navigator.getUserMedia(
// 	{ video: true, audio: true },
// 	(stream) => {
// 		const localVideo = document.getElementById("local-video");
// 		if (localVideo) {
// 			localVideo.srcObject = stream;
// 		}
// 	},
// 	(error) => {
// 		console.warn(error.message);
// 	}
// );

// socket instance
var socket = io();

// handle new device connection
const updateConnectedDevicesList = (device) => {
	const connectedDevicesListEl = document.getElementById("active-devices");
	connectedDevicesListEl.innerText = device;
};

socket.on("update-devices-list", (socket) => {
	console.log("New device connected");

	updateConnectedDevicesList(socket.devices.toString());
});

// handle message
const sendMessageBtnEl = document.getElementById("sendMessage");

const sendMessage = () => {
	const message = document.getElementById("message");

	if (message.value) {
		socket.emit("send-message", message.value);
	}

	message.value = "";
};

sendMessageBtnEl.addEventListener("click", sendMessage);

const updateMessage = (message) => {
	const messages = document.getElementById("messagesList");
	messages.innerText = `${messages.innerText}  \n  ${message}`;
};

socket.on("sent-message", (message) => {
	console.log(message);
	updateMessage(message);
});
