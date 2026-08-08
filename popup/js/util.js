const VERSION = "1.1.0";

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
    });
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
}

document.querySelectorAll(".version").forEach(element =>
   element.innerText = element.innerText.replaceAll("{VERSION}", VERSION)
);

document.querySelectorAll("a").forEach(element => {
   element.onclick = (e => {
       e.preventDefault();
       chrome.tabs.create({url: element.href});
       window.close();
   });
});