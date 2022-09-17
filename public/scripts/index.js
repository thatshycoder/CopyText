import App from "./app.js";
import { isMobile, isTablet } from "mobile-device-detect";

const vueApp = new Vue(App);

const clipboard = new ClipboardJS('#clipboard-copy-btn');

clipboard.on('success', function(e) {

    // TODO: Show nicer alerts
    alert("Texts copied!");
});