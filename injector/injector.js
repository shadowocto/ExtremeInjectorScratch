const proxy = Proxy;
const reflect = {};

for (let name of Object.getOwnPropertyNames(Reflect)) {
    reflect[name] = Reflect[name];
}

let vm;
const hook = function(o,n,h) {
    o[n] = new proxy(o[n], h);
}

hook(Function.prototype,"bind",{
    apply(f, th, args) {
        try {
            if (args[0] != null && args[0]["runtime"] != null && args[0].hasOwnProperty("editingTarget")) {
                console.log("Hooked and exposed Scratch VM");
                vm = args[0];
                Function.prototype.bind = f;
            }
        } catch(e) {
            console.warn(`An exception occurred while attempting to expose the Scratch VM: ${e}`)
        }
        return reflect.apply(f, th, args);
    }
});

function inject(spriteBuffer) {
    try {
        vm.addSprite(new Uint8Array(spriteBuffer));

        // TODO: Make option in settings
        // Hopefully sprite injection doesn't take more than 500ms or this will break
        // (we should probably find a way to actually wait until it's fully loaded)
        setTimeout(
            () => vm.runtime.startHats("event_whenbroadcastreceived", {BROADCAST_OPTION: "ExternalInjectSignal"}),
            500
        )

        console.log("Sprite injected successfully");
    } catch (error) {
        console.error("Failed to inject sprite:", error);
    }
}

document.addEventListener('ei-inject', event => {
    const data = event.detail;
    console.log(`Performing sprite injection of '${data.name}'`);
    inject(base64ToArrayBuffer(data.spriteBytes));
});

