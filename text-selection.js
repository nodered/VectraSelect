// Create shared prompts constant
const SHARED_PROMPTS = [
  "I would like to focus on the following",
  "I find the following interesting in this context"
];

// Create global state object
window.textSelectionState = {
  selectedWords: [],
  selectedSentences: [],
  currentSentences: [],
  reset: function() {
    this.selectedWords = [];
    this.selectedSentences = [];
    this.currentSentences = [];
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const textArea = document.getElementById("text-area");
  const jsonOutput = document.getElementById("json-output");

  // Remove these global arrays and use window.textSelectionState instead
  // const selectedWords = [];
  // const selectedSentences = [];
  // let currentSentences = [];

  // Detect if the device is a touch device
  const isTouchDevice = "ontouchstart" in document.documentElement;

  // text
  const text = textArea.innerText;
  // Render the text structure with nested spans

  // Add support for multiple paragraphs and sentences
  renderTextStructure(text, textArea);

  // Add event listeners
  textArea.addEventListener("click", handleTextClick);
  if (!isTouchDevice) {
    textArea.addEventListener("mouseover", handleMouseOver);
    textArea.addEventListener("mouseout", handleMouseOut);
  }
  textArea.addEventListener("dblclick", handleDoubleClick);
  textArea.addEventListener("mouseup", handleTextSelection);

  // Add event listener to the test button
  const testButton = document.getElementById("test-menu-button");
  testButton.addEventListener("click", () => {
    showFloatingMenu(100, 100); // Show the menu at a fixed position for testing
  });

  // Function to render the text structure
  function renderTextStructure(text, container) {
    // Clear existing content
    container.innerHTML = '';

    const paragraphs = text.split("\n\n");
    paragraphs.forEach((paragraph, pIndex) => {
      const paragraphElement = document.createElement("p");
      // Split sentences while preserving punctuation
      const sentences = paragraph.match(/[^.!?]+[.!?]?/g) || []; // Match sentences with punctuation
      paragraphElement.innerHTML = sentences
        .map(
          (sentence, sIndex) =>
            `<span class="sentence" data-sentence-index="${sIndex}" data-paragraph-index="${pIndex}">${sentence
              .split(" ")
              .map((word, wIndex) => `<span class="word" data-word-index="${wIndex}">${word}</span>`)
              .join(" ")}</span>`
        )
        .join(" ");
      container.appendChild(paragraphElement);
    });
  }

  // Handle click events on the text area
  function handleTextClick(event) {
    const target = event.target;
    if (target.classList.contains("sentence")) {
      handleSentenceClick(target);
      showFloatingMenu(event.pageX, event.pageY); // Show the floating menu
    } else if (target.classList.contains("word")) {
      const sentence = target.closest(".sentence");
      if (sentence && !sentence.classList.contains("style-s")) {
        handleSentenceClick(sentence);
        showFloatingMenu(event.pageX, event.pageY); // Show the floating menu
      } else if (window.textSelectionState.currentSentences.length > 0) {
        handleWordClick(target);
        showFloatingMenu(event.pageX, event.pageY); // Show the floating menu
      }
    }
    updateJSONOutput(window.textSelectionState.selectedWords, window.textSelectionState.selectedSentences, jsonOutput);
  }

  // Handle mouse over events on words
  function handleMouseOver(event) {
    const target = event.target;
    if (target.classList.contains("word")) {
      target.classList.add("hovered");
    }
  }

  // Handle mouse out events on words
  function handleMouseOut(event) {
    const target = event.target;
    if (target.classList.contains("word")) {
      target.classList.remove("hovered");
    }
  }

  // Handle double-click events to clear all selections
  function handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    window.getSelection().removeAllRanges(); // Clear the selection
    const target = event.target;
    const sentence = target.closest(".sentence");
    if (sentence) {
      clearSentenceSelection(sentence);
      updateJSONOutput(window.textSelectionState.selectedWords, window.textSelectionState.selectedSentences, jsonOutput);
    }
  }

  // Handle sentence click events
  function handleSentenceClick(sentence) {
    if (!sentence.classList.contains("style-s")) {
      sentence.classList.add("style-s");
      clearAllWords(sentence);
      addToSelection(sentence, "sentence");
      window.textSelectionState.currentSentences.push(sentence);
    }
  }

  // Handle word click events
  function handleWordClick(word) {
    const isSelected = word.classList.toggle("style-w");
    if (isSelected) {
      addToSelection(word, "word");
    } else {
      removeFromSelection(word, "word");
    }
  }

  // Add an element to the selection
  function addToSelection(element, type) {
    const text = element.innerText.trim();
    if (type === "sentence") {
      window.textSelectionState.selectedSentences.push(text);
    } else if (type === "word") {
      window.textSelectionState.selectedWords.push(text);
    }
  }

  // Clear the selection of a sentence
  function clearSentenceSelection(sentence) {
    const sentenceText = sentence.innerText.trim();
    sentence.classList.remove("style-s");
    clearAllWords(sentence);
    
    // Clear the selected words that belong to this sentence
    const wordsInSentence = Array.from(sentence.querySelectorAll('.word'))
      .map(word => word.innerText.trim());
    window.textSelectionState.selectedWords = window.textSelectionState.selectedWords
      .filter(word => !wordsInSentence.includes(word));
    
    // Clear the sentence from selected sentences
    window.textSelectionState.selectedSentences = window.textSelectionState.selectedSentences
      .filter(s => s !== sentenceText);
    
    // Clear from current sentences
    window.textSelectionState.currentSentences = window.textSelectionState.currentSentences
      .filter(s => s !== sentence);
  }

  // Clear the selection of all words in a sentence
  function clearAllWords(sentence) {
    sentence.querySelectorAll(".word").forEach((word) => word.classList.remove("style-w"));
  }

  // Remove an element from the selection
  function removeFromSelection(element, type) {
    const text = element.innerText.trim();
    if (type === "sentence") {
      const index = window.textSelectionState.selectedSentences.indexOf(text);
      if (index !== -1) window.textSelectionState.selectedSentences.splice(index, 1);
    } else if (type === "word") {
      const index = window.textSelectionState.selectedWords.indexOf(text);
      if (index !== -1) window.textSelectionState.selectedWords.splice(index, 1);
    }
  }

  // Update the JSON output
  function updateJSONOutput(words, sentences, outputElement) {
    const interestingWordsList = words.join(", ");
    const interestingSentencesList = sentences.join(", ");
    
    // Create the JSON output
    const jsonOutput = JSON.stringify({
      instruction: SHARED_PROMPTS,
      interesting_words: words,
      interesting_sentences: sentences
    }, null, 2);
    
    // Set the output element's text content to the JSON
    outputElement.textContent = jsonOutput;

    // Append the comma-separated lists outside the JSON
    const listsOutput = `Interesting Words: ${interestingWordsList}\nInteresting Sentences: ${interestingSentencesList}`;
    outputElement.textContent += `\n\n${listsOutput}`; // Append the lists to the output
  }

  // Log the schema to the console (for demonstration purposes)
  //console.log("JSON Schema:", schema);

  // Function to handle text selection
  function handleTextSelection(event) {
    const selection = window.getSelection();
    if (selection.toString().length > 0 && textArea.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      console.log("Selection range:", range);
      console.log("Selection rect:", rect);
      showFloatingMenu(rect.right + window.scrollX, rect.bottom + window.scrollY);
    } else {
      console.log("No text selected");
      hideFloatingMenu();
    }
  }
});
