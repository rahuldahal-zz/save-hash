function listenForClicks() {
  const buttons = document.querySelectorAll(".saveHash__btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      buttons.forEach((btn) => btn.classList.remove("saveHash__btn--active"));
      btn.classList.add("saveHash__btn--active");
      const buttonId = e.currentTarget.id;
      getCurrentTabAndSendMessage(buttonId);
    });
  });
}
/**
 * Get the active tab,
 * then send message to content-script(/saveHash.js) or throw an error as appropriate.
 */

function getCurrentTabAndSendMessage(buttonId) {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: buttonId,
      });
    })
    .catch((err) => console.error(err));
}

function reportExecuteScriptError(err) {
  document.getElementById("saveHash").style.display = "hidden";
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.style.display = "block";
  errorContainer.innerHTML = err;
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/saveHash.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
