// TODO: add a very simple "flashMessage" to alert about save and deletion

// global variables
let links;
const HASH_REGEX = /#/;
let hashLinks;
let textContentAndHash;
const hostAndPath = `${window.location.hostname} ${window.location.pathname}`;
let savedHashesElement;
let initialContent;
const cssURL = browser.runtime.getURL("/saveHash.css");

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

(function () {
  if (window.hasRun) {
    console.log("exititng");
    return;
  }
  window.hasRun = true;

  /**
   ** Listen for messages from the background script [/popup/saveHash.js]
   ** Then call init() with the incoming message's command.
   */
  browser.runtime.onMessage.addListener((message) => {
    const { command } = message;
    command && init(command);
  });
})();

let notWrappedYet = true;

/**
 * @param {String} command
 * @description Invokes appropriate functions based on the command
 */

function init(command) {
  /**
   * get initial contents.
   * everything inside the <body>
   * and wrap them in a div
   */
  notWrappedYet &&
    (function wrapInitialContents() {
      console.log("wrapping");

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

      /**
       * injecting HTML on active tab,
       * to display saved hashes/error message.
       */
      document.body.insertAdjacentHTML(
        "afterbegin",
        `
    <div id="savedHashes" class="saveHash__saved"> </div>
  `
      );

      // assigning DOM elements

      links = Array.from(document.links);
      hashLinks = links.filter((link) => {
        if (link.href.match(HASH_REGEX)) {
          link.classList.add("saveHash__link--savable");
          return link;
        }
      });

      savedHashesElement = document.getElementById("savedHashes");
      initialContent = document.getElementById("initialContent");
      notWrappedYet = false;
    })();

  switchRespectiveCommand(command);
}

function switchRespectiveCommand(command) {
  switch (command) {
    case "getSaved":
      getSaved();
      break;

    case "startCapturing":
      startCapturing();
      break;

    case "resetCaptures":
      resetCaptures();
      break;
  }
}

function startCapturing() {
  console.log("heyy");
  hashLinks.forEach((hash) => {
    hash.addEventListener("click", (e) => {
      pushTextContentAndHash(e) && saveTextContentAndHash();
    });
  });
}

// TODO: alert success/failure with a simple flash message

function resetCaptures() {
  window.localStorage.removeItem(`savedHash_${hostAndPath}`);
  savedHashesElement.innerHTML = "";
  savedHashesElement.classList.remove("saveHash__saved--active");
  initialContent.classList.remove("saveHash__initialContent--active");
  console.log("All the captures to hash link has been cleared.");
}

function pushTextContentAndHash(e) {
  const element = e.currentTarget || e;
  const savedPreviously = window.localStorage.getItem(
    `savedHash_${hostAndPath}`
  );
  console.log("saved", savedPreviously);

  try {
    let isDuplicate = false;
    if (savedPreviously) {
      isDuplicate = JSON.parse(savedPreviously).some(
        (elem) => elem.hash === element.href
      );
      console.log(isDuplicate);
    }
    if (isDuplicate) {
      console.log("Duplicate: Cannot push to array");
      return false;
    }
    textContentAndHash = {
      textContent: getTextContent(element),
      hash: element.href,
    };
    console.log("text content", textContentAndHash);
    return textContentAndHash;
  } catch (err) {
    console.log(err);
  }
}

// TODO: alert success/failure with a simple flash message

function saveTextContentAndHash() {
  const savedPreviously = window.localStorage.getItem(
    `savedHash_${hostAndPath}`
  );
  const stringifiedData = savedPreviously
    ? JSON.stringify([...JSON.parse(savedPreviously), textContentAndHash])
    : JSON.stringify([textContentAndHash]);
  window.localStorage.setItem(`savedHash_${hostAndPath}`, stringifiedData);
  console.log("Saved Successfully.");
}

function getTextContentAndHash() {
  const dataFromLocalStorage = window.localStorage.getItem(
    `savedHash_${hostAndPath}`
  );
  console.log(dataFromLocalStorage);
  return JSON.parse(dataFromLocalStorage);
}

function getSaved() {
  const textContentAndHashArray = getTextContentAndHash();
  injectSavedHashes(textContentAndHashArray);
}

function injectSavedHashes(textContentAndHashArray) {
  savedHashesElement.innerHTML = "";
  savedHashesElement.classList.remove("saveHash__saved--active");
  savedHashesElement.classList.add("saveHash__saved--active");
  initialContent.classList.add("saveHash__initialContent--active");
  if (textContentAndHashArray && textContentAndHashArray.length) {
    const HTML = `
  		${textContentAndHashArray
        .map((textAndHash) => {
          const { textContent, hash } = textAndHash;
          return `
  					<a href="${hash}" class="saveHash__link">${textContent}</a>
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

export function getTextContent(element) {
  const textContent = element.textContent;
  if (!textContent) {
    return getTextContent(element.parentElement);
  }
  return textContent;
}
