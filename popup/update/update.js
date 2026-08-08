const versionInfo = document.querySelector("p");
versionInfo.innerText = versionInfo.innerText
    .replace("{VERSION}", VERSION)
    .replace("{UPDATE_VERSION}", new URLSearchParams(window.location.search).get("version"));

document.getElementById("ignore").addEventListener('click', () => {
    localStorage.setItem("ignored", Date.now().toString());
    window.close();
});

document.getElementById("update").addEventListener('click', () => {
    chrome.tabs.create({url: "https://github.com/shadowocto/ExtremeInjectorScratch"});
    window.close();
});