import App from "./app.js";
const vueApp = new Vue(App);

const clipboard = new ClipboardJS('#clipboard-copy-btn');

clipboard.on('success', function(e) {

    // TODO: Show nicer alerts
    alert("Texts copied!");
});