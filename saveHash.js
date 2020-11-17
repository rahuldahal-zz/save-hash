(function(){

	injectHTML();
	init();
	const links = Array.from(document.links);
	const HASH_REGEX = /#/;
	const hashLinks = links.filter(link=>link.href.match(HASH_REGEX));
	const textContentAndHashArray = [];
	const hostName = window.location.hostname;


	function injectHTML(){
		const saveHashElement = `
			<div id="saveHashElement" class="saveHash">
				<div class="saveHash__btns">
					<button class="saveHash__btn" id="getSaved">Get Saved</button>
					<button class="saveHash__btn" id="captureAll">Capture All</button>
					<button class="saveHash__btn" id="startCapturing">Start Capturing</button>
					<button class="saveHash__btn" id="finishCapturing">Finish Capturing</button>
					<button class="saveHash__btn" id="resetCaptures">Reset</button>
				</div>
				<div id="savedHashes" class="saveHash__saved">
				</div>
			</div>
		`	
		document.body.insertAdjacentHTML("beforeend", saveHashElement);
	}

	function init(){
		const buttons = document.querySelectorAll(".saveHash__btn");
		buttons.forEach(btn=>btn.addEventListener("click", (e)=>{
			const id = e.currentTarget.id;
			switch(id){
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
		}));
	}

	function startCapturing(){
		hashLinks.forEach(hash=>hash.addEventListener("click", (e)=>{
			pushTextContentAndHash(e);
		}));
	}

	function finishCapturing(){
		saveTextContentAndHash();
	}

	function captureAll(){
		console.log(hashLinks);
		hashLinks.forEach(hashLink=>pushTextContentAndHash(hashLink));
		saveTextContentAndHash();
	}

	function resetCaptures(){
		window.localStorage.removeItem(`savedHash_${hostName}`);
		console.log("All the captures to hash link has been cleared.")
	}

	function pushTextContentAndHash(e){
		const element = e.currentTarget || e;
		const textContentAndHash = {
			textContent: getTextContent(element),
			hash: element.href
		};
		textContentAndHashArray.push(textContentAndHash);
	}

	function saveTextContentAndHash(){
		const stringifiedData = JSON.stringify(textContentAndHashArray);
		window.localStorage.setItem(`savedHash_${hostName}`, stringifiedData);
		console.log("Saved Successfully.");
	}

	function getTextContentAndHash(){
		const dataFromLocalStorage = window.localStorage.getItem(`savedHash_${hostName}`);
		return JSON.parse(dataFromLocalStorage);
	}

	function getSaved(){
		const textContentAndHashArray = getTextContentAndHash();
		injectSavedHashes(textContentAndHashArray);
	}

	function injectSavedHashes(textContentAndHashArray){
		const savedHashesElement = document.getElementById("savedHashes");
		savedHashesElement.innerHTML = "";
		const HTML = `
			${textContentAndHashArray.map(textAndHash=>{
				const {textContent, hash} = textAndHash;
				return `
					<h3>
						<a href="${hash}">${textContent}</a>
					</h3>
				`
			}).join("")}
		`;
		savedHashesElement.insertAdjacentHTML("beforeend", HTML);
	}

	function getTextContent(element){
		const textContent = element.textContent;
		if(!textContent){
			return getTextContent(element.parentElement);
		}
		return textContent;
	}
})();