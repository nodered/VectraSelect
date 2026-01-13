class FloatingMenu {
  constructor(textSelector) {
    this.textSelector = textSelector;
    this.menu = this.createMenu();
  }

  createMenu() {
    const menu = document.createElement("div");
    menu.id = "floating-menu";
    menu.style.position = "absolute";
    menu.style.display = "none";
    menu.style.backgroundColor = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "5px";
    menu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    
    // Add buttons to the menu
    const button1 = document.createElement("button");
    button1.innerText = "Add context";
    button1.addEventListener("click", () => {
      const selection = this.textSelector.getSelection();
      const jsonPayload = JSON.stringify({
        instruction: this.textSelector.options.prompts,
        interesting_words: selection.words,
        interesting_sentences: selection.sentences,
        interesting_words_list: selection.words.join(", "),
        interesting_sentences_list: selection.sentences.join(", ")
      }, null, 2);
      alert(jsonPayload);
    });

    const button2 = document.createElement("button");
    button2.innerText = "•••";
    button2.addEventListener("click", () => alert("Action 2 triggered"));

    const button3 = document.createElement("button");
    button3.innerText = "•••";
    button3.addEventListener("click", () => alert("Action 3 triggered"));

    const button4 = document.createElement("button");
    button4.innerText = "Clear All";
    button4.addEventListener("click", () => {
      this.textSelector.clearSelection();
      this.hide();
    });

    // Append buttons to the menu
    menu.appendChild(button1);
    menu.appendChild(button2);
    menu.appendChild(button3);
    menu.appendChild(button4);

    // Append the menu to the document body
    document.body.appendChild(menu);

    return menu;
  }

  show() {
    if (!this.menu) return;
    const textArea = document.getElementById(this.textSelector.options.containerId);
    const textAreaRect = textArea.getBoundingClientRect();
    
    // Set the top position relative to the text area
    this.menu.style.top = `${textAreaRect.bottom + window.scrollY + 10}px`; // 10px offset for spacing
    this.menu.classList.add("show");
    this.menu.style.display = "block";
  }

  hide() {
    if (!this.menu) return;
    this.menu.classList.remove("show");
    this.menu.style.display = "none";
  }
}

// Update updateJSONOutput to be simpler
function updateJSONOutput(outputElement) {
  const outputData = {
    instruction: SHARED_PROMPTS,
    interesting_words: window.textSelectionState.selectedWords,
    interesting_sentences: window.textSelectionState.selectedSentences
  };
  
  outputElement.textContent = JSON.stringify(outputData, null, 2);
}

// Simplified initializeJSONOutput
function initializeJSONOutput() {
  const jsonOutput = document.getElementById('json-output');
  updateJSONOutput(jsonOutput);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingMenu;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return FloatingMenu; });
} else {
  window.FloatingMenu = FloatingMenu;
}
