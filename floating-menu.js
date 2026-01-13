class FloatingMenu {
  constructor(textSelector) {
    this.textSelector = textSelector;
    this.modal = ensureVectraModal();
    this.menu = this.createMenu();
  }

  createMenu() {
    const menu = document.createElement("div");
    menu.id = "floating-menu";
    // Visual styling is handled entirely by floating-menu.css
    
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

      this.modal.open({
        title: "Add Context",
        subtitle: "Copy this payload into your LLM/chat tool.",
        content: jsonPayload
      });
    });

    const button2 = document.createElement("button");
    button2.innerText = "•••";
    button2.addEventListener("click", () => {
      this.modal.open({
        title: "Not implemented",
        subtitle: "This action is a placeholder.",
        content: "Coming soon."
      });
    });

    const button3 = document.createElement("button");
    button3.innerText = "•••";
    button3.addEventListener("click", () => {
      this.modal.open({
        title: "Not implemented",
        subtitle: "This action is a placeholder.",
        content: "Coming soon."
      });
    });

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
  }

  hide() {
    if (!this.menu) return;
    this.menu.classList.remove("show");
  }
}

function ensureVectraModal() {
  if (window.__vectraModal) return window.__vectraModal;

  const overlay = document.getElementById('vs-modal-overlay');
  const dialog = document.getElementById('vs-modal');
  const titleEl = document.getElementById('vs-modal-title');
  const subtitleEl = document.getElementById('vs-modal-subtitle');
  const contentEl = document.getElementById('vs-modal-content');
  const copyBtn = document.querySelector('[data-vs-modal-copy]');
  const closeBtns = Array.from(document.querySelectorAll('[data-vs-modal-close]'));

  if (!overlay || !dialog || !titleEl || !subtitleEl || !contentEl || !copyBtn || closeBtns.length === 0) {
    // Fail soft: if the modal markup isn't present, keep the app functional without browser dialogs.
    return {
      open: ({ content }) => {
        try {
          console.log(content);
        } catch {
          // ignore
        }
      }
    };
  }

  // Defensive: keep it closed on load.
  overlay.hidden = true;
  overlay.classList.remove('open');
  document.body.classList.remove('vs-modal-open');

  let lastActiveElement = null;
  let currentContent = '';

  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusableElements() {
    return Array.from(dialog.querySelectorAll(focusableSelector))
      .filter(el => el.offsetParent !== null);
  }

  function close() {
    overlay.hidden = true;
    overlay.classList.remove('open');
    document.body.classList.remove('vs-modal-open');
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    lastActiveElement = null;
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'fixed';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
  }

  function open({ title, subtitle, content }) {
    lastActiveElement = document.activeElement;
    currentContent = String(content ?? '');

    titleEl.textContent = title || 'Dialog';
    subtitleEl.textContent = subtitle || '';
    contentEl.textContent = currentContent;

    overlay.hidden = false;
    overlay.classList.add('open');
    document.body.classList.add('vs-modal-open');

    // Focus the first close button for keyboard users.
    const focusables = getFocusableElements();
    (focusables[0] || dialog).focus();
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  closeBtns.forEach(btn => btn.addEventListener('click', close));

  copyBtn.addEventListener('click', async () => {
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copying…';
    copyBtn.disabled = true;
    try {
      await copyToClipboard(currentContent);
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.disabled = false;
      }, 900);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.disabled = false;
      }, 1200);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusableElements();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.__vectraModal = { open, close };
  return window.__vectraModal;
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
