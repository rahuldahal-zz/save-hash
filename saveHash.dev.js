import { getFromStorage } from "./util";

// TODO: add a very simple "flashMessage" to alert about save and deletion

// global variables
let links;
const HASH_REGEX = /#/;
let hashLinks;
const hostAndPath = `${window.location.hostname} ${window.location.pathname}`;
let savedHashesElement;
let initialContent;
let hasBrowserObject = typeof browser === "object" ? true : false;
const cssURL = hasBrowserObject && browser.runtime.getURL("/saveHash.css");
let notWrappedYet = true;

(function () {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true; // make sure that the code below runs only ONCE.

  /**
   ** Listen for messages from the background script [/popup/saveHash.js]
   ** Then call init() with the incoming message's command.
   */
  hasBrowserObject &&
    browser.runtime.onMessage.addListener((message) => {
      console.log("runs");
      const { command } = message;
      command && init(command);
    });
})();

/**
 * @param {String} command
 * @description Cuts the initial content and wraps it in a <div> with <saved hashes>
 */

function init(command) {
  /**
   * get initial contents.
   * everything inside the <body>
   * and wrap them in a div
   */
  if (notWrappedYet) {
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
  }

  switchRespectiveCommand(command);
}

/**
 *
 * @param {String} command
 * @description Invokes appropriate functions based on the command
 */

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

/**
 * @description adds click listeners to links with "hash"
 * @fires setTextContentAndHash
 */

function startCapturing() {
  hashLinks.forEach((hash) => {
    hash.addEventListener("click", (e) => {
      try {
        const textContentAndHash = setTextContentAndHash(e);
        saveTextContentAndHash(textContentAndHash);
      } catch (err) {
        console.log(err);
      }
    });
  });
}

// TODO: alert success/failure with a simple flash message

/**
 * @description remove saved items from localStorage and hide the "savedHashes" sidebar from the DOM
 */

function resetCaptures() {
  window.localStorage.removeItem(`savedHash_${hostAndPath}`);
  savedHashesElement.innerHTML = "";
  savedHashesElement.classList.remove("saveHash__saved--active");
  initialContent.classList.remove("saveHash__initialContent--active");
  console.log("All the captures to hash link has been cleared.");
}
/**
 *
 * @param {Object} eventObject
 * @description checks if "hash" in question is unique and sets an object with its textContent and href.
 * @returns {Object} textContentAndHash
 */

export function setTextContentAndHash({ currentTarget }) {
  const savedPreviously = getFromStorage(hostAndPath);
  let isDuplicate = false;
  if (savedPreviously) {
    isDuplicate = JSON.parse(savedPreviously).some(
      (elem) => elem.hash === currentTarget.href
    );
  }
  if (isDuplicate) {
    console.log("Duplicate: Cannot push to array");
    return {};
  }
  const textContentAndHash = {
    textContent: getTextContent(currentTarget),
    hash: currentTarget.href,
  };
  return textContentAndHash;
}

/**
 *
 * @param {Object} textContentAndHash
 * @description stores the textContentAndHash object in localStorage, taking previous storage data to account.
 * @returns {String} null if the param is empty, data on storage otherwise.
 */

export function saveTextContentAndHash(textContentAndHash) {
  if (Object.keys(textContentAndHash).length === 0) {
    return null;
  }

  const savedPreviously = getFromStorage(hostAndPath);
  const stringifiedData = savedPreviously
    ? JSON.stringify([...JSON.parse(savedPreviously), textContentAndHash])
    : JSON.stringify([textContentAndHash]);
  window.localStorage.setItem(`savedHash_${hostAndPath}`, stringifiedData);
  return stringifiedData;
}

/**
 * @description retrieves "savedHashes" from localStorage of current host.
 * @returns {Array} JSON parsed array of "savedHashes"
 */
function getTextContentAndHash() {
  const dataFromLocalStorage = getFromStorage(hostAndPath);
  console.log(dataFromLocalStorage);
  return JSON.parse(dataFromLocalStorage);
}

function getSaved() {
  const textContentAndHashArray = getTextContentAndHash();
  injectSavedHashes(textContentAndHashArray);
}

/**
 *
 * @param {Array} textContentAndHashArray
 * @description creates anchor tags from the array elements, if exists and injects them into the DOM.
 */

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
 * @param {Object} anchorTag
 * @description returns "textContent" if found else calls itself with parent element of the argument provided.
 * @returns {String} textContent
 */

const ignoreElements = ["DIV", "MAIN", "SECTION", "HEADER", "NAV", "BODY"];

export function getTextContent(element) {
  if(ignoreElements.includes(element.tagName)){
    return "Rename This...";
  }
  
  const textContent = element.textContent;
  if (!textContent) {
    return getTextContent(element.parentElement);
  }
  return textContent;
}
