const spriteTable = document.getElementById("sprite-table").querySelector("tbody");
let sprites = [];
let selected = null;

const fileSelector = document.createElement("input");
fileSelector.accept = ".sprite3,.zip";
fileSelector.type = "file";

const injectButton = document.getElementById("inject");

const themeStyles = document.getElementById("theme");

class Sprite {
    name = "?";
    enabled = true;
    spriteBytes = [];
    element;

    constructor(name, bytes, enabled) {
        this.name = name;
        this.spriteBytes = bytes;
        this.enabled = enabled;

        this.element = document.createElement("tr");
        this.element.addEventListener('click', () => this.select());

        const enabledToggle = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.addEventListener('change', () => {
           this.enabled = checkbox.checked;
            saveToLocalStorage();
        });
        enabledToggle.appendChild(checkbox);
        enabledToggle.style.paddingLeft = "3px";
        enabledToggle.style.maxWidth = "5px";
        this.element.appendChild(enabledToggle);
        this.updateCheckbox();

        const nameColumn = document.createElement("td");
        nameColumn.innerText = name;
        nameColumn.style.transform = "translateY(-1px)";
        this.element.appendChild(nameColumn);

        this.element.appendChild(document.createElement("td"));
    }

    updateCheckbox() {
        this.element.querySelector("input[type=checkbox]").checked = this.enabled;
    }

    toggle() {
        this.enabled = !this.enabled;
        this.updateCheckbox();
    }

    select() {
        if (selected != null)
            selected.element.classList.remove("selected");

        selected = this;
        this.element.classList.add("selected");
    }
}

function updateSpriteTable() {
    spriteTable.innerHTML = "<tr><th></th><th>Sprite Name</th><th></th></tr>";
    for (const sprite of sprites)
        spriteTable.appendChild(sprite.element);
    saveToLocalStorage();
}

function saveToLocalStorage() {
    localStorage.setItem("sprites", JSON.stringify(sprites));
}

function loadFromLocalStorage() {
    const storedData = localStorage.getItem("sprites");

    if (storedData != null) {
        for (const serializedSprite of JSON.parse(storedData)) {
            sprites.push(new Sprite(
                serializedSprite["name"],
                serializedSprite["spriteBytes"],
                serializedSprite["enabled"]
            ));
        }
    }

    updateSpriteTable();
}

document.getElementById("add").addEventListener('click',() => {
    fileSelector.click();
});

fileSelector.addEventListener('change', async () => {
    for (const file of fileSelector.files)
        sprites.push(new Sprite(file.name, arrayBufferToBase64(await readFileAsArrayBuffer(file)), true));
    updateSpriteTable();
});

document.getElementById("remove").addEventListener('click',() => {
    if (selected == null)
        return;

    const index = sprites.indexOf(selected);
    if (index > -1)
        sprites.splice(index, 1);

    updateSpriteTable();

    if (sprites[index - 1])
        sprites[index - 1].select();
    if (sprites[index])
        sprites[index].select();
    else if (sprites[index + 1])
        sprites[index + 1].select();
});

document.getElementById("toggle").addEventListener('click',() => {
    if (selected != null) {
        selected.toggle();
        saveToLocalStorage();
    }
});

document.getElementById("clear").addEventListener('click',() => {
    sprites = [];
    updateSpriteTable();
});

document.getElementById("about").addEventListener('click',() => {
    chrome.windows.create({
        url: chrome.runtime.getURL('popup/about.html'),
        type: 'popup',
        focused: true,
        width: 370,
        height: 225
    });
});

document.getElementById("settings").addEventListener('click',() => {
    chrome.windows.create({
        url: chrome.runtime.getURL('popup/settings/settings.html'),
        type: 'popup',
        focused: true,
        width: 455,
        height: 420
    });
});

loadFromLocalStorage();

(async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

    if (tab && tab.url.includes("://scratch.mit.edu/")) {
        injectButton.removeAttribute("disabled");
        injectButton.addEventListener('click',() => {
            for (const sprite of sprites) {
                if (!sprite.enabled)
                    continue;

                chrome.tabs.sendMessage(
                    tab.id, {
                        type: "ei-inject",
                        name: sprite.name,
                        spriteBytes: sprite.spriteBytes,
                        triggerFlag: settings.greenFlag
                    }
                );

                console.log(`Sent inject signal for '${sprite.name}'`);
            }
        });
    }
})();

function applySettings() {
    updateSettings();

    for (const element of document.querySelectorAll("*")) {
        const previousTransition = element.style.transition;
        element.style.transition = "none";
        setTimeout(() => element.style.transition = previousTransition, 100);
    }

    switch (settings.theme) {
        case "Classic (Blue)":
            themeStyles.href = "themes/classic.css";
            break;
        case "Modern":
            themeStyles.href = "themes/modern.css";
            break;
    }
}

chrome.runtime.onMessage.addListener((message) => {
   if (message.type === "update-settings")
       applySettings();
});

applySettings();

async function checkForUpdates() {
    const lastIgnored = localStorage.getItem("ignored");
    if (lastIgnored && (Date.now() - lastIgnored) / 1000 < 21600) // 6 hours
        return;

    const response = await fetch("https://raw.githubusercontent.com/shadowocto/ExtremeInjectorScratch/refs/heads/main/version");
    const version = await response.text();

    if (version !== VERSION) {
        chrome.windows.create({
            url: chrome.runtime.getURL(`popup/update/update.html?version=${version}`),
            type: 'popup',
            focused: true,
            width: 370,
            height: 123
        });
    }
}

setTimeout(checkForUpdates, 500);