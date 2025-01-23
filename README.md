# VectraSelect
A lightweight library for interactive text selection, specifically designed for AI chatbot interaciton.

## Features
- Sentence-level and word-level selection
- Floating action menu
- JSON output of selected content
- Touch device support
- Customizable prompts

## Quick Start

1. Include the required files in your HTML:
```html
<link rel="stylesheet" href="text-selection.css">
<link rel="stylesheet" href="floating-menu.css">
<script src="floating-menu.js"></script>
<script src="text-selection.js"></script>
```

2. Add a container element with the ID "text-area":
```html
<div id="text-area">
    <!-- Your AI response text goes here -->
</div>
```

3. Add a container for the JSON output:
```html
<pre id="json-output"></pre>
```

## Usage with AI Chatbots

### Basic Implementation
```javascript
// Initialize text selection on your chat response container
document.addEventListener("DOMContentLoaded", () => {
    const chatResponse = document.querySelector('.ai-response');
    chatResponse.id = 'text-area';
    
    // Add JSON output container
    const jsonOutput = document.createElement('pre');
    jsonOutput.id = 'json-output';
    chatResponse.parentNode.appendChild(jsonOutput);
});
```

### Customizing Prompts
```javascript
// Modify the SHARED_PROMPTS constant in text-selection.js
const SHARED_PROMPTS = [
    "Use this as context for the next response",
    "Focus on this information"
];
```

## Interaction Guide
1. A single-click selects a sentence.
2. A single-click in a selected sentence will select individual words.
3. A double-click on a sentence will clear all the word selections in that sentence and the sentence itself.
4. Use the floating menu to:
   - Add selected content as context to the LLM/Chatbot
   - Clear all selections
   - Perform additional custom actions

## API Reference

### Global State
```javascript
window.textSelectionState = {
    selectedWords: [], // Array of selected words
    selectedSentences: [], // Array of selected sentences
    currentSentences: [], // Array of currently active sentence elements
    reset: function() { /* Resets all selections */ }
}
```

### Events
The library emits custom events when selections change:
- `textSelection:updated` - Fired when selections are modified
- `textSelection:cleared` - Fired when selections are cleared

## CSS Customization
Override these classes in your stylesheet:
```css
.word.style-w { /* Selected word styling */ }
.sentence.style-s { /* Selected sentence styling */ }
.word.hovered { /* Hover state styling */ }
#floating-menu { /* Floating menu styling */ }
```

## Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers with touch support

## Known Limitations
1. Text must be properly formatted with sentences ending in proper punctuation
2. Nested selections are not supported
3. Rich text formatting may affect selection behavior

