chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    document.dispatchEvent(new CustomEvent("ei-inject",{
        detail: message
    }));
});