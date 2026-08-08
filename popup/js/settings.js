const DEFAULT_SETTINGS = {
    "theme": "Classic (Blue)",
    "greenFlag": true,
    "editorBypass": false
}

let settings;

function updateSettings() {
    const savedSettings = localStorage.getItem("settings") ?
        localStorage.getItem("settings") :
        DEFAULT_SETTINGS;

    settings = JSON.parse(savedSettings);
}

updateSettings();