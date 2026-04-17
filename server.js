const net = require("net");
const fs = require("fs/promises");

const server = net.createServer(async (socket) => {
	let fh = null;
	let fhStream = null;
	let fileName = null;
	let fileSize = null;
	let headerData = "";
	let uploadedBytes = 0;

	socket.on("data", async (data) => {
		if (!fh) {
			headerData += data.toString();
			const separatorIndex = headerData.indexOf("-----");

			if (separatorIndex !== -1) {
				socket.pause();
				const [name, size] = headerData
					.slice(0, separatorIndex)
					.split("|");

				fileName = name;
				fileSize = parseInt(size, 10);

				fh = await fs.open(`./storage/${fileName}`, "w");
				fhStream = fh.createWriteStream();

				const actualFileData = Buffer.from(
					headerData.slice(separatorIndex + 5),
					"utf-8",
				);

				if (actualFileData.length > 0) {
					fhStream.write(actualFileData);
				}

				const progress = ((uploadedBytes / fileSize) * 100).toFixed(
					2,
				);
				socket.write(`Progress: ${progress}%\n`);

				fhStream.on("drain", () => {
					socket.resume();
				});

				socket.resume();
			}
		} else {
			const canContinue = fhStream.write(data);
			uploadedBytes += data.length;
			const progress = ((uploadedBytes / fileSize) * 100).toFixed(2);
			socket.write(`Progress: ${progress}%\n`);

			if (uploadedBytes === fileSize) {
				socket.write("File sucessfully uploaded");
			}

			if (!canContinue) {
				socket.pause();
			}
		}
	});

	socket.on("end", () => {
		if (fhStream) {
			fhStream.end();
		}
	});
});

server.listen(5050, "172.31.29.201", () => console.log("Server is running..."));
