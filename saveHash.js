(function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */

  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // TODO: add a very simple "flashMessage" to alert about save and deletion

  /**
   * get initial contents.
   * everything inside the <body>
   * and wrap them in a div
   */
  (function wrapInitialContents() {
    const initialContents = document.body.innerHTML;
    document.body.innerHTML = "";
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="initialContent" class="saveHash__initialContent">
        ${initialContents}
      </div>
    `
    );
  })();

  /**
   * injecting HTML on active tab,
   * to display saved hashes/error message.
   * TODO: refactor this HTML and CSS to make it "pretty".
   */
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <div id="savedHashes" class="saveHash__saved"> </div>
  `
  );

  // global variables
  const links = Array.from(document.links);
  const HASH_REGEX = /#/;
  const hashLinks = links.filter((link) => link.href.match(HASH_REGEX));
  const textContentAndHashArray = [];
  const hostName = window.location.hostname;
  const savedHashesElement = document.getElementById("savedHashes");
  const initialContent = document.getElementById("initialContent");
  const cssURL = browser.extension.getURL("/saveHash.css");

  /**
   * inject link to "/saveHash.css" file in the <head>
   * specified as "web_accessible_resources" in manifest.json
   */
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <link rel="stylesheet" type="text/css" href="${cssURL}">
  `
  );

  /**
   ** Listen for messages from the background script [/popup/saveHash.js]
   ** Then call init() with the incoming message's command.
   */
  browser.runtime.onMessage.addListener((message) => {
    const { command } = message;
    init(command);
  });

  /**
   * @param {String} command
   * @description Invokes appropriate functions based on the command
   */

  function init(command) {
    switch (command) {
      case "getSaved":
        getSaved();
        break;

      case "captureAll":
        captureAll();
        break;

      case "startCapturing":
        startCapturing();
        break;

      case "finishCapturing":
        finishCapturing();
        break;

      case "resetCaptures":
        resetCaptures();
        break;
    }
  }

  function startCapturing() {
    hashLinks.forEach((hash) =>
      hash.addEventListener("click", (e) => {
        pushTextContentAndHash(e);
      })
    );
  }

  function finishCapturing() {
    saveTextContentAndHash();
  }

  function captureAll() {
    console.log(hashLinks);
    hashLinks.forEach((hashLink) => pushTextContentAndHash(hashLink));
    saveTextContentAndHash();
  }

  // TODO: alert success/failure with a simple flash message

  function resetCaptures() {
    window.localStorage.removeItem(`savedHash_${hostName}`);
    savedHashesElement.innerHTML = "";
    savedHashesElement.classList.remove("saveHash__saved--active");
    initialContent.classList.remove("saveHash__initialContent--active");
    console.log("All the captures to hash link has been cleared.");
  }

  function pushTextContentAndHash(e) {
    const element = e.currentTarget || e;
    const textContentAndHash = {
      textContent: getTextContent(element),
      hash: element.href,
    };
    textContentAndHashArray.push(textContentAndHash);
  }

  // TODO: alert success/failure with a simple flash message

  function saveTextContentAndHash() {
    const stringifiedData = JSON.stringify(textContentAndHashArray);
    window.localStorage.setItem(`savedHash_${hostName}`, stringifiedData);
    console.log("Saved Successfully.");
  }

  function getTextContentAndHash() {
    const dataFromLocalStorage = window.localStorage.getItem(
      `savedHash_${hostName}`
    );
    return JSON.parse(dataFromLocalStorage);
  }

  function getSaved() {
    const textContentAndHashArray = getTextContentAndHash();
    injectSavedHashes(textContentAndHashArray);
  }

  function injectSavedHashes(textContentAndHashArray) {
    savedHashesElement.innerHTML = "";
    savedHashesElement.classList.add("saveHash__saved--active");
    initialContent.classList.add("saveHash__initialContent--active");
    if (textContentAndHashArray && textContentAndHashArray.length) {
      const HTML = `
  		${textContentAndHashArray
        .map((textAndHash) => {
          const { textContent, hash } = textAndHash;
          return `
  				<p>
  					<a href="${hash}" class="saveHash__link">${textContent}</a>
  				</p>
  			`;
        })
        .join("")}
      `;
      savedHashesElement.insertAdjacentHTML("beforeend", HTML);
    } else {
      savedHashesElement.innerHTML = `
        <h3 class="errorMessage">There are no saved hashes yet.</h3>
        <p>Click <em>Start Capturing</em> button to start saving the hashes.</p>
      `;
    }
  }

  /**
   * @param {Object} element
   * @description with an "anchor tag" element as the argument, if found, returns its "textContent" else calls itself with argument's parent element.
   */

  function getTextContent(element) {
    const textContent = element.textContent;
    if (!textContent) {
      return getTextContent(element.parentElement);
    }
    return textContent;
  }
})();
