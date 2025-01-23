class TextSelector {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'text-area',
      outputId: options.outputId || 'json-output',
      prompts: options.prompts || [
        "I would like to focus on the following",
        "I find the following interesting in this context"
      ],
      onSelection: options.onSelection || null,
      enableFloatingMenu: options.enableFloatingMenu !== false
    };

    this.state = {
      selectedWords: [],
      selectedSentences: [],
      currentSentences: [],
      reset: () => {
        this.state.selectedWords = [];
        this.state.selectedSentences = [];
        this.state.currentSentences = [];
      }
    };

    this.container = null;
    this.jsonOutput = null;
    this.floatingMenu = null;
    this.init();
  }

  init() {
    this.container = document.getElementById(this.options.containerId);
    this.jsonOutput = document.getElementById(this.options.outputId);

    if (!this.container) {
      throw new Error(`Container with id '${this.options.containerId}' not found`);
    }

    const isTouchDevice = "ontouchstart" in document.documentElement;
    this.renderTextStructure(this.container.innerText);
    this.attachEventListeners(isTouchDevice);

    if (this.options.enableFloatingMenu) {
      this.floatingMenu = new FloatingMenu(this);
    }
  }

  renderTextStructure(text) {
    this.container.innerHTML = '';

    const paragraphs = text.split("\n\n");
    paragraphs.forEach((paragraph, pIndex) => {
      const paragraphElement = document.createElement("p");
      const sentences = paragraph.match(/[^.!?]+[.!?]?/g) || [];
      paragraphElement.innerHTML = sentences
        .map(
          (sentence, sIndex) =>
            `<span class="sentence" data-sentence-index="${sIndex}" data-paragraph-index="${pIndex}">${sentence
              .split(" ")
              .map((word, wIndex) => `<span class="word" data-word-index="${wIndex}">${word}</span>`)
              .join(" ")}</span>`
        )
        .join(" ");
      this.container.appendChild(paragraphElement);
    });
  }

  attachEventListeners(isTouchDevice) {
    this.container.addEventListener("click", this.handleTextClick.bind(this));
    if (!isTouchDevice) {
      this.container.addEventListener("mouseover", this.handleMouseOver.bind(this));
      this.container.addEventListener("mouseout", this.handleMouseOut.bind(this));
    }
    this.container.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    this.container.addEventListener("mouseup", this.handleTextSelection.bind(this));
  }

  handleTextClick(event) {
    const target = event.target;
    if (target.classList.contains("sentence")) {
      this.handleSentenceClick(target);
      this.showFloatingMenu(event.pageX, event.pageY);
    } else if (target.classList.contains("word")) {
      const sentence = target.closest(".sentence");
      if (sentence && !sentence.classList.contains("style-s")) {
        this.handleSentenceClick(sentence);
        this.showFloatingMenu(event.pageX, event.pageY);
      } else if (this.state.currentSentences.length > 0) {
        this.handleWordClick(target);
        this.showFloatingMenu(event.pageX, event.pageY);
      }
    }
    this.updateJSONOutput();
  }

  handleMouseOver(event) {
    const target = event.target;
    if (target.classList.contains("word")) {
      target.classList.add("hovered");
    }
  }

  handleMouseOut(event) {
    const target = event.target;
    if (target.classList.contains("word")) {
      target.classList.remove("hovered");
    }
  }

  handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    window.getSelection().removeAllRanges();
    const target = event.target;
    const sentence = target.closest(".sentence");
    if (sentence) {
      this.clearSentenceSelection(sentence);
      this.updateJSONOutput();
    }
  }

  handleSentenceClick(sentence) {
    if (!sentence.classList.contains("style-s")) {
      sentence.classList.add("style-s");
      this.clearAllWords(sentence);
      this.addToSelection(sentence, "sentence");
      this.state.currentSentences.push(sentence);
    }
  }

  handleWordClick(word) {
    const isSelected = word.classList.toggle("style-w");
    if (isSelected) {
      this.addToSelection(word, "word");
    } else {
      this.removeFromSelection(word, "word");
    }
  }

  addToSelection(element, type) {
    const text = element.innerText.trim();
    if (type === "sentence") {
      this.state.selectedSentences.push(text);
    } else if (type === "word") {
      this.state.selectedWords.push(text);
    }
  }

  clearSentenceSelection(sentence) {
    const sentenceText = sentence.innerText.trim();
    sentence.classList.remove("style-s");
    this.clearAllWords(sentence);

    const wordsInSentence = Array.from(sentence.querySelectorAll('.word'))
      .map(word => word.innerText.trim());
    this.state.selectedWords = this.state.selectedWords
      .filter(word => !wordsInSentence.includes(word));

    this.state.selectedSentences = this.state.selectedSentences
      .filter(s => s !== sentenceText);

    this.state.currentSentences = this.state.currentSentences
      .filter(s => s !== sentence);
  }

  clearAllWords(sentence) {
    sentence.querySelectorAll(".word").forEach((word) => word.classList.remove("style-w"));
  }

  removeFromSelection(element, type) {
    const text = element.innerText.trim();
    if (type === "sentence") {
      const index = this.state.selectedSentences.indexOf(text);
      if (index !== -1) this.state.selectedSentences.splice(index, 1);
    } else if (type === "word") {
      const index = this.state.selectedWords.indexOf(text);
      if (index !== -1) this.state.selectedWords.splice(index, 1);
    }
  }

  updateJSONOutput() {
    const interestingWordsList = this.state.selectedWords.join(", ");
    const interestingSentencesList = this.state.selectedSentences.join(", ");

    const jsonOutput = JSON.stringify({
      instruction: this.options.prompts,
      interesting_words: this.state.selectedWords,
      interesting_sentences: this.state.selectedSentences
    }, null, 2);

    this.jsonOutput.textContent = jsonOutput;

    const listsOutput = `Interesting Words: ${interestingWordsList}\nInteresting Sentences: ${interestingSentencesList}`;
    this.jsonOutput.textContent += `\n\n${listsOutput}`;
  }

  handleTextSelection(event) {
    const selection = window.getSelection();
    if (selection.toString().length > 0 && this.container.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      this.showFloatingMenu(rect.right + window.scrollX, rect.bottom + window.scrollY);
    } else {
      this.hideFloatingMenu();
    }
  }

  showFloatingMenu(x, y) {
    if (this.floatingMenu) {
      this.floatingMenu.show(x, y);
    }
  }

  hideFloatingMenu() {
    if (this.floatingMenu) {
      this.floatingMenu.hide();
    }
  }

  getSelection() {
    return {
      words: this.state.selectedWords,
      sentences: this.state.selectedSentences
    };
  }

  clearSelection() {
    this.state.reset();
    this.container.querySelectorAll('.style-s, .style-w').forEach(el => {
      el.classList.remove('style-s', 'style-w');
    });
    this.updateJSONOutput();
  }

  destroy() {
    this.container.removeEventListener("click", this.handleTextClick);
    if (!isTouchDevice) {
      this.container.removeEventListener("mouseover", this.handleMouseOver);
      this.container.removeEventListener("mouseout", this.handleMouseOut);
    }
    this.container.removeEventListener("dblclick", this.handleDoubleClick);
    this.container.removeEventListener("mouseup", this.handleTextSelection);
    if (this.options.enableFloatingMenu) {
      document.getElementById('floating-menu')?.remove();
    }
  }
}

// Initialize the text selector when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.textSelector = new TextSelector();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextSelector;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return TextSelector; });
} else {
  window.TextSelector = TextSelector;
}
