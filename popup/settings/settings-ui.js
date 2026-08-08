let hoveredDropdown = null;

document.querySelectorAll(".dropdown").forEach(dropdown => {
    dropdown.addEventListener('click', () => {
        if (dropdown.classList.contains("expanded"))
            dropdown.classList.remove("expanded");
        else
            dropdown.classList.add("expanded");
    });

    dropdown.addEventListener('mouseover', () => hoveredDropdown = dropdown);
    dropdown.addEventListener('mouseleave', () => hoveredDropdown = null);

    const options = dropdown.querySelector(".options");
    if (options) {
        options.childNodes.forEach(option => {
            option.addEventListener('click', () => {
                dropdown.querySelector(".value").innerText = option.innerText;
            });
        });
    }
});

document.addEventListener('click', () => {
    if (hoveredDropdown == null)
        document
            .querySelectorAll(".dropdown")
            .forEach(d => d.classList.remove("expanded"));
});

function getDropdownValue(id) {
    const dropdown = document.getElementById(id);
    if (!dropdown)
        return "";

    const value = dropdown.querySelector(".value");
    return value ? value.innerText : "";
}

function setDropdownValue(id, value) {
    const dropdown = document.getElementById(id);
    if (!dropdown)
        return;

    const valueElement = dropdown.querySelector(".value");
    if (valueElement)
        valueElement.innerHTML = value;
}

document.getElementById("reset").addEventListener('click', () => {
    for (const name in DEFAULT_SETTINGS) {
        const value = DEFAULT_SETTINGS[name];

        const checkbox = document.getElementById(name);
        if (checkbox instanceof HTMLInputElement && checkbox.type === "checkbox")
            checkbox.checked = value;
        else
            setDropdownValue(name, value);
    }
});

document.getElementById("save").addEventListener('click', () => {
    const settings = {};
    for (const name in DEFAULT_SETTINGS) {
        const checkbox = document.getElementById(name);
        if (checkbox instanceof HTMLInputElement && checkbox.type === "checkbox")
            settings[name] = checkbox.checked;
        else
            settings[name] = getDropdownValue(name);
    }

    localStorage.setItem("settings", JSON.stringify(settings));
    chrome.runtime.sendMessage({type: "update-settings"});
    window.close();
});

for (const name in settings) {
    const value = settings[name];

    const checkbox = document.getElementById(name);
    if (checkbox instanceof HTMLInputElement && checkbox.type === "checkbox")
        checkbox.checked = value;
    else
        setDropdownValue(name, value);
}