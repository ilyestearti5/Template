# React Template Components

React components library configured for distribution via cdn.jsdelivr.net

## CDN Usage

You can use these React components directly from CDN without needing to install React separately:

### UMD (Universal Module Definition) - Standalone

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>

    <!-- Load the standalone components library -->
    <script src="https://cdn.jsdelivr.net/gh/ilyestearti5/Template-1@latest/dist/index.umd.js"></script>

    <script>
      // Components are available as ReactTemplateComponents
      const { Button, Card, Input, React, ReactDOM } = ReactTemplateComponents;

      // Create your app
      const app = React.createElement(
        "div",
        null,
        React.createElement("h1", null, "My App"),
        React.createElement(
          Button,
          {
            variant: "primary",
            onClick: () => alert("Hello!"),
          },
          "Click Me"
        ),
        React.createElement(
          Card,
          { title: "My Card" },
          React.createElement("p", null, "Card content here")
        )
      );

      // Render the app
      ReactDOM.render(app, document.getElementById("root"));
    </script>
  </body>
</html>
```

### ES Module

```html
<script type="module">
  import {
    Button,
    Card,
    Input,
    React,
    ReactDOM,
  } from "https://cdn.jsdelivr.net/gh/ilyestearti5/Template-1@latest/dist/index.esm.js";

  // Use the components
  const app = React.createElement(
    Button,
    { variant: "primary" },
    "Hello World"
  );
  ReactDOM.render(app, document.getElementById("root"));
</script>
```

### Specific Version

```html
<script src="https://cdn.jsdelivr.net/gh/ilyestearti5/Template-1@1.0.0/dist/index.umd.js"></script>
```

## Available Components

### Button

```javascript
React.createElement(Button, {
  variant: 'primary' | 'secondary' | 'danger',
  size: 'small' | 'medium' | 'large',
  onClick: () => void,
  disabled: boolean
}, 'Button Text')
```

### Card

```javascript
React.createElement(
  Card,
  {
    title: "Card Title",
    style: {
      /* custom styles */
    },
  },
  "Card content"
);
```

### Input

```javascript
React.createElement(Input, {
  placeholder: "Enter text...",
  type: "text" | "email" | "password" | "number",
  onChange: (value) => console.log(value),
  disabled: boolean,
});
```

## Development

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Development mode with watch:

```bash
npm run dev
```

## Files Structure

- `src/` - Source files
  - `components/` - React components
  - `index.ts` - Main export file
- `dist/` - Built files (generated)
- `example.html` - Usage example
- `package.json` - Package configuration
- `rollup.config.js` - Build configuration

## Publishing

After pushing to GitHub, your files will be automatically available via cdn.jsdelivr.net using the URLs above.
