import CopyTextServer from "./server";

const server = new CopyTextServer();

server.listen((port) => {
	console.log(`Server is running on http://localhost:${port}`);
});
