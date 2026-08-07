const proxy = Proxy;
const reflect = {};

for (let name of Object.getOwnPropertyNames(Reflect)) {
    reflect[name] = Reflect[name];
}

let vm;
const hook = function (o, n, h) {
    o[n] = new proxy(o[n], h);
}

hook(Function.prototype, "bind", {
    apply(f, th, args) {
        try {
            if (args[0] != null && args[0]["runtime"] != null && args[0].hasOwnProperty("editingTarget")) {
                console.log("Hooked and exposed Scratch VM");
                vm = args[0];
                Function.prototype.bind = f;
            }
        } catch (e) {
            console.warn(`An exception occurred while attempting to expose the Scratch VM: ${e}`)
        }
        return reflect.apply(f, th, args);
    }
});

const queue = [];
let injecting = false;

async function inject(spriteBuffer) {
    console.log(injecting,queue,queue[0]);
    if (injecting)
        await queue.push(new Promise(()=>{}))
    injecting = true
    try {
        const before = new WeakSet(vm.runtime.targets.filter(v => v.isOriginal));

        await vm.addSprite(new Uint8Array(spriteBuffer)); // fuck you scratch for not returning the sprite

        const sprites = vm.runtime.targets.filter(v => v.isOriginal).filter(v=>!before.has(v));
        const sprite = sprites[0]; // this shouldn't fail i think

        const blocks = sprite.blocks;
        const scripts = blocks.getScripts();

        for (let i = 0; i < scripts.length; i++) {
            const block = blocks.getBlock(scripts[i]);
            if (block.opcode == "event_whenflagclicked") {
                vm.runtime._pushThread(block.id, sprite);
            }
        }

        console.log("Sprite injected successfully");
    } catch (error) {
        console.error("Failed to inject sprite:", error);
    }
    console.log(queue);
    if (queue[0] != null) {
        Promise.resolve(queue.shift());
    }
    injecting = false;
}

document.addEventListener('ei-inject', event => {
    const data = event.detail;
    console.log(`Performing sprite injection of '${data.name}'`);
    inject(base64ToArrayBuffer(data.spriteBytes));
});

