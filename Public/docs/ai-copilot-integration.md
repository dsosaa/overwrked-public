# AI Copilot Integration Guide

## Overview

The AI Copilot is a Material Design-themed AI assistant integrated into your MkDocs site, inspired by the Obsidian Copilot plugin. It provides intelligent writing assistance, code generation, and content improvement directly within your documentation pages.

## Features

### Core Capabilities
- **Multi-Provider Support**: OpenAI (GPT-4), Anthropic (Claude), Google (Gemini), Ollama (local)
- **Material Design Integration**: Seamlessly matches your MkDocs Material theme
- **Editor Integration**: Works with CodeMirror 6, Monaco Editor, and standard textareas
- **Context-Aware**: Understands your current document content
- **Quick Actions**: One-click commands for common tasks
- **Chat History**: Maintains conversation context
- **Mobile Responsive**: Optimized for all devices

### Quick Actions
- **Explain**: Simplify complex concepts
- **Improve**: Enhance writing clarity and style
- **Summarize**: Create concise summaries
- **Translate**: Convert between languages
- **Generate Code**: Create code examples
- **Fix Grammar**: Correct spelling and grammar

## Setup Instructions

### 1. Frontend Integration

The AI Copilot files are already included in your project:
- `assets/ai-copilot.js` - Core functionality
- `assets/ai-copilot.css` - Material Design styling

These are automatically loaded via your `mkdocs.yml` configuration.

### 2. Backend Setup

Choose one of these deployment options:

#### Option A: Vercel Functions
```javascript
// api/ai-copilot.js
export default async function handler(req, res) {
  // Use the provided backend code
}
```

#### Option B: Netlify Functions
```javascript
// netlify/functions/ai-copilot.js
exports.handler = async (event, context) => {
  // Use the provided backend code
}
```

#### Option C: Self-Hosted Node.js
```bash
# Install dependencies
npm install express cors axios

# Set environment variables
export OPENAI_API_KEY=your-api-key
export PORT=3001

# Run the server
node api/ai-copilot-backend.js
```

### 3. API Configuration

Set your API keys as environment variables:
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

### 4. Frontend Configuration

Update the API endpoint in `ai-copilot.js`:
```javascript
this.settings = {
  apiEndpoint: 'https://your-domain.com/api/ai-copilot',
  // or for local development:
  // apiEndpoint: 'http://localhost:3001/api/ai-copilot',
};
```

## Usage

### Keyboard Shortcuts
- **Ctrl/Cmd + Shift + A**: Toggle AI Copilot panel
- **Enter**: Send message (in input field)
- **Shift + Enter**: New line in input

### Basic Workflow
1. Click the floating action button (bottom-right) or use keyboard shortcut
2. Select text in your editor for context-aware assistance
3. Choose a quick action or type a custom prompt
4. Apply AI suggestions directly to your editor

### Advanced Features

#### Custom Prompts
Type specific requests in the chat input:
- "Write a Python function that..."
- "Explain this concept to a beginner..."
- "Create a markdown table for..."

#### Context Selection
- Select text before requesting help for targeted assistance
- The AI will use selected text as primary context
- Without selection, it uses the entire document

## Customization

### Theming
The AI Copilot automatically adapts to your MkDocs theme:
- Light/dark mode auto-detection
- Material Design color scheme inheritance
- Custom CSS variables for fine-tuning

### Modify Quick Actions
Edit the quick actions in `ai-copilot.js`:
```javascript
const prompts = {
  yourAction: 'Your custom prompt template',
  // Add more actions...
};
```

### Adjust UI Elements
Customize the appearance in `ai-copilot.css`:
```css
:root {
  --copilot-width: 420px;
  --copilot-height: 600px;
  --copilot-border-radius: 8px;
  /* Add your customizations */
}
```

## Security Considerations

### API Key Management
- Never expose API keys in frontend code
- Use environment variables on the backend
- Implement rate limiting and usage quotas
- Consider user authentication for production

### CORS Configuration
Configure appropriate CORS headers:
```javascript
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

### Content Filtering
Implement content moderation:
- Filter inappropriate requests
- Validate response content
- Log usage for monitoring

## Troubleshooting

### Common Issues

#### AI Copilot not appearing
- Check browser console for errors
- Verify JavaScript files are loading
- Ensure CSS is properly linked

#### API calls failing
- Verify backend is running
- Check API key configuration
- Review CORS settings
- Test with browser DevTools

#### Editor integration issues
- Ensure editor is initialized before Copilot
- Check for conflicting JavaScript
- Verify editor detection in `detectEditors()`

### Debug Mode
Enable debug logging:
```javascript
// In ai-copilot.js
const DEBUG = true;
if (DEBUG) console.log('AI Copilot:', ...);
```

## Performance Optimization

### Caching Strategies
- Cache API responses for repeated queries
- Store chat history in localStorage
- Implement response debouncing

### Bundle Size Reduction
- Use dynamic imports for large dependencies
- Minify JavaScript and CSS for production
- Enable gzip compression

## Future Enhancements

### Planned Features
- Voice input/output support
- File attachment handling
- Multi-language UI support
- Collaborative editing features
- Custom model fine-tuning
- Offline mode with local models

### Integration Possibilities
- GitHub integration for code suggestions
- Documentation search enhancement
- Auto-completion in editors
- Smart markdown formatting
- Citation management

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the troubleshooting section
3. Open an issue on GitHub
4. Contact support@overwrked.ai

## License

This AI Copilot integration is provided as-is for use with your MkDocs site. Ensure compliance with your chosen AI provider's terms of service.