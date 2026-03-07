const serverInput = document.getElementById("serverUrl");
const saveBtn = document.getElementById("saveBtn");
const savedMsg = document.getElementById("savedMsg");

chrome.storage.sync.get(["serverUrl"], (result) => {
  serverInput.value = result.serverUrl || "http://localhost";
});

saveBtn.addEventListener("click", () => {
  const url = serverInput.value.trim().replace(/\/+$/, "");
  chrome.storage.sync.set({ serverUrl: url || "http://localhost" }, () => {
    savedMsg.style.display = "block";
    setTimeout(() => { savedMsg.style.display = "none"; }, 2000);
  });
});
