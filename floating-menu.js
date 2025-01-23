// Remove global arrays since we're using window.textSelectionState now

function createFloatingMenu() {
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
    const interestingWordsList = window.textSelectionState.selectedWords.join(", ");
    const interestingSentencesList = window.textSelectionState.selectedSentences.join(", ");
    
    const jsonPayload = JSON.stringify({
      instruction: SHARED_PROMPTS,
      interesting_words: window.textSelectionState.selectedWords,
      interesting_sentences: window.textSelectionState.selectedSentences,
      interesting_words_list: interestingWordsList,
      interesting_sentences_list: interestingSentencesList
    }, null, 2);
    alert(jsonPayload); // Show the JSON payload in an alert
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
    // Clear window selection
    window.getSelection().removeAllRanges();

    // Clear all highlights
    document.querySelectorAll('.style-s').forEach(sentence => {
      sentence.classList.remove('style-s');
    });

    document.querySelectorAll('.style-w').forEach(word => {
      word.classList.remove('style-w');
    });

    // Reset global state
    window.textSelectionState.reset();

    // Update JSON output
    const jsonOutput = document.getElementById('json-output');
    updateJSONOutput(jsonOutput);

    // Hide the floating menu
    hideFloatingMenu();
  });

  // Append buttons to the menu
  menu.appendChild(button1);
  menu.appendChild(button2);
  menu.appendChild(button3);
  menu.appendChild(button4);

  // Append the menu to the document body
  document.body.appendChild(menu);
  console.log("Floating menu created");
}

// Function to show the floating menu at specified coordinates
function showFloatingMenu() {
  const menu = document.getElementById("floating-menu");
  const textArea = document.getElementById("text-area");
  const textAreaRect = textArea.getBoundingClientRect();
  
  // Set the top position relative to the text area
  menu.style.top = `${textAreaRect.bottom + window.scrollY + 10}px`; // 10px offset for spacing
  menu.classList.add("show");
  menu.style.display = "block";
  console.log(`Floating menu shown at (${menu.style.left}, ${menu.style.top})`);
}

// Function to hide the floating menu
function hideFloatingMenu() {
  const menu = document.getElementById("floating-menu");
  menu.classList.remove("show");
  menu.style.display = "none";
  console.log("Floating menu hidden");
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

// Initialize the floating menu
createFloatingMenu();

// Add this line at the end of the file
document.addEventListener('DOMContentLoaded', initializeJSONOutput);
