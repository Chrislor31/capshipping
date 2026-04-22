// 🔐 CSRF (OBLIGATWA POU DJANGO)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
    }
    return cookieValue;
}


// 🔥 LÈ SCAN REYISI
function onScanSuccess(decodedText) {

    console.log("Scanned:", decodedText);

    fetch("/shipping/scan-package/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            barcode: decodedText
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.success) {

            document.getElementById("result").innerHTML =
                "✅ <b>Status:</b> " + data.status;

            // 🔊 SON (OPTIONAL)
            let audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-01a.mp3");
            audio.play();

        } else {

            document.getElementById("result").innerHTML =
                "❌ " + (data.error || "Not found");

        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById("result").innerHTML = "❌ Error scanning";
    });
}


// 🎥 START CAMERA
function startScanner() {

    let html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {

        if (devices.length) {

            html5QrCode.start(
                devices[0].id,
                {
                    fps: 10,
                    qrbox: 250
                },
                onScanSuccess
            );
        }
    }).catch(err => {
        console.error("Camera error:", err);
    });
}


// 🚀 LANCE AUTOMATIK
document.addEventListener("DOMContentLoaded", function () {
    startScanner();
});