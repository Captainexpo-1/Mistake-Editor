// Include the Socket.IO client library
const socket = io("/");
const highligher = new SyntaxHighlighter();
const cInp = document.getElementById("code-input");
const runButton = document.getElementById("run-button");
let running = false;

socket.on("connect", function () {
	console.log("Socket.IO is connected now.");
});

socket.on("message", function (data) {
	document.getElementById("output").innerText = data.output;
});

socket.on("disconnect", function () {
	console.log("Socket.IO is disconnected now.");
});

socket.on("error", function (error) {
	console.error("Socket.IO error observed:", error);
});

document.getElementById("code-input").addEventListener("keydown", function (e) {
	if (e.key === "Tab") {
		e.preventDefault();
		const start = this.selectionStart;
		const end = this.selectionEnd;

		// Set textarea value to: text before caret + 3 spaces + text after caret
		this.value =
			this.value.substring(0, start) + "   " + this.value.substring(end);

		// Put caret at right position again
		this.selectionStart = this.selectionEnd = start + 3;

		oninp();
	}
});

runButton.addEventListener("click", function () {
	if (running) return;
	document.getElementById("output").innerText = "";
	const code = document.getElementById("code-input").value;
	socket.emit("run_code", { code: code });
	running = true;
	runButton.innerText = "Running...";
	runButton.classList.add("run_running");
	runButton.classList.remove("run_standby");
});
const oninp = function () {
	cInp.value = cInp.value.replace(/\t/g, "   ");
	const code = cInp.value;
	document.getElementById("highlighted-code").innerHTML =
		highligher.highlight(code);
};
cInp.addEventListener("input", oninp);

socket.on("output", function (out) {
	document.getElementById("output").innerHTML += out.data.replace("\n", "<br>");
});

socket.on("finished", function () {
	running = false;
	runButton.innerText = "Run";
	runButton.classList.remove("run_running");
	runButton.classList.add("run_standby");
});

cInp.addEventListener("scroll", function () {
	document.getElementById("highlighted-code").scrollTop = cInp.scrollTop;
});

document.addEventListener("DOMContentLoaded", function () {
	oninp();
});
