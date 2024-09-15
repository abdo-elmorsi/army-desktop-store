import { ipcRenderer, contextBridge, type IpcRendererEvent } from "electron";

const validChannels = [
    "get-users",
    "add-users",
    "update-users",
    "delete-users",
    "get-products",
    "get-products-by-id",
    "add-products",
    "update-products",
    "delete-products",
    "get-transactions",
    "get-first-date-in-transactions",
    "delete-all-transactions",
    "get-transactions-by-id",
    "add-transactions",
    "update-transactions",
    "delete-transactions",
    "get-stores",
    "add-stores",
    "update-stores",
    "delete-stores",
    "get-units",
    "add-units",
    "update-units",
    "delete-units",
];

// Expose ipcRenderer methods to the renderer process
contextBridge.exposeInMainWorld("ipcRenderer", {
    on: (
        channel: string,
        listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on(channel, listener),
    off: (
        channel: string,
        listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.off(channel, listener),
    send: (channel: string, ...args: any[]) =>
        ipcRenderer.send(channel, ...args),
    invoke: <T>(channel: string, ...args: any[]): Promise<T> => {
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error("Invalid channel");
    },

    showPrompt: (message: any, defaultValue: any) =>
        ipcRenderer.invoke("show-prompt", message, defaultValue),

    // Additional methods as needed
});

// DOM Ready utility function
function domReady(
    condition: DocumentReadyState[] = ["complete", "interactive"]
): Promise<boolean> {
    return new Promise((resolve) => {
        if (condition.includes(document.readyState)) {
            resolve(true);
        } else {
            document.addEventListener("readystatechange", () => {
                if (condition.includes(document.readyState)) {
                    resolve(true);
                }
            });
        }
    });
}

// Safe DOM manipulation utilities
const safeDOM = {
    append(parent: HTMLElement, child: HTMLElement) {
        if (!Array.from(parent.children).includes(child)) {
            parent.appendChild(child);
        }
    },
    remove(parent: HTMLElement, child: HTMLElement) {
        if (Array.from(parent.children).includes(child)) {
            parent.removeChild(child);
        }
    },
};

// Loading animation utility
function useLoading() {
    const className = `loaders-css__square-spin`;
    const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
    const oStyle = document.createElement("style");
    const oDiv = document.createElement("div");

    oStyle.id = "app-loading-style";
    oStyle.innerHTML = styleContent;
    oDiv.className = "app-loading-wrap";
    oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

    return {
        appendLoading() {
            safeDOM.append(document.head, oStyle);
            safeDOM.append(document.body, oDiv);
        },
        removeLoading() {
            safeDOM.remove(document.head, oStyle);
            safeDOM.remove(document.body, oDiv);
        },
    };
}

// Execute the loading sequence
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev: MessageEvent) => {
    if (ev.data.payload === "removeLoading") {
        removeLoading();
    }
};

// Remove the loading animation after 5 seconds
setTimeout(removeLoading, 4999);
