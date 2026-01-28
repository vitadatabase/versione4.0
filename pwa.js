
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.log("Service Worker registrato ✅");
    } catch (e) {
      console.error("Service Worker NON registrato ❌", e);
    }
  });
}
