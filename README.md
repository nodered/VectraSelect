# TextSelector Library

A lightweight library for implementing interactive text selection with floating menus.

## Features
- Sentence-level and word-level selection
- Floating action menu
- JSON output of selected content
- Touch device support
- Customizable prompts

## Installation

### Option 1: Direct Include
```html
<!-- Add to your HTML head -->
<link rel="stylesheet" href="text-selection.css">
<link rel="stylesheet" href="floating-menu.css">

<!-- Add just before closing body tag -->
<script src="floating-menu.js"></script>
<script src="text-selection.js"></script>
```

### Option 2: NPM (Coming Soon)
```bash
npm install text-selector-lib
```

## Setup

1. Add the required HTML elements:
```html
<!-- Container for selectable text -->
<div id="my-text-area">
    Your content here...
</div>

<!-- Container for JSON output -->
<pre id="my-output"></pre>
```

2. Initialize the selector:
```javascript
// Basic initialization
const selector = new TextSelector();

// Or with custom options
const selector = new TextSelector({
    containerId: 'my-text-area',
    outputId: 'my-output',
    prompts: [
        'Focus on this context:',
        'Consider this information:'
    ],
    onSelection: (selection) => {
        console.log('Words:', selection.words);
        console.log('Sentences:', selection.sentences);
    },
    enableFloatingMenu: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| containerId | string | 'text-area' | ID of the container element |
| outputId | string | 'json-output' | ID of the JSON output element |
| prompts | string[] | [...] | Array of prompts to use with selections |
| onSelection | function | null | Callback when selection changes |
| enableFloatingMenu | boolean | true | Show/hide floating menu |

## API Reference

### Methods
```javascript
// Get current selection
const selection = selector.getSelection();
// Returns: { words: string[], sentences: string[] }

// Clear all selections
selector.clearSelection();

// Destroy instance and clean up
selector.destroy();
```

### Events
```javascript
// Listen for selection changes
document.addEventListener('textSelection:updated', (e) => {
    console.log('Selection updated:', e.detail);
});

// Listen for selection clear
document.addEventListener('textSelection:cleared', () => {
    console.log('Selection cleared');
});
```

### Custom Styling
```css
/* Style selected words */
.word.style-w {
    background-color: yellow;
    padding: 2px;
}

/* Style selected sentences */
.sentence.style-s {
    background-color: lightblue;
    padding: 2px;
}

/* Style hover state */
.word.hovered {
    background-color: #f0f0f0;
}

/* Style floating menu */
#floating-menu {
    /* Your custom styles */
}
```

## Examples

### Basic Usage
```javascript
// Initialize with default settings
const selector = new TextSelector();
```

### Custom Configuration
```javascript
// Initialize with custom settings
const selector = new TextSelector({
    containerId: 'custom-container',
    outputId: 'custom-output',
    prompts: ['Consider this:', 'Focus on:'],
    onSelection: (selection) => {
        // Send to your API
        sendToAPI({
            words: selection.words,
            sentences: selection.sentences
        });
    }
});
```

### Integration with ChatGPT/LLM
```javascript
const selector = new TextSelector({
    onSelection: async (selection) => {
        const prompt = `
            Consider this context:
            Words of interest: ${selection.words.join(', ')}
            Key sentences: ${selection.sentences.join(' ')}
            
            Please provide analysis based on this context.
        `;
        
        // Send to your LLM API
        const response = await sendToLLM(prompt);
        displayResponse(response);
    }
});
```

## Interaction Guide
1. A single-click selects a sentence.
2. A single-click in a selected sentence will select individual words.
3. A double-click on a sentence will clear all the word selections in that sentence and the sentence itself.
4. Use the floating menu to:
   - Add selected content as context to the LLM/Chatbot
   - Clear all selections
   - Perform additional custom actions

## Global State
```javascript
window.textSelectionState = {
    selectedWords: [],
    selectedSentences: [],
    currentSentences: [],
    reset: function() { /* Resets all selections */ }
}
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
