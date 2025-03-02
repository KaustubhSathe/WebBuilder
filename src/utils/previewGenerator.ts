import type { Component } from "@/types/builder";

export const generateCSS = (component: Component): string => {
  if (!component.styles) return "";

  const cssRules = Object.entries(component.styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .filter((rule) => rule) // Remove empty rules
    .join("\n    ");

  return cssRules ? `#${component.id} {\n    ${cssRules}\n  }` : "";
};

export const getAllCSS = (component: Component): string => {
  let css = generateCSS(component);

  // Recursively get CSS for all children
  for (const child of component.children) {
    css += "\n" + getAllCSS(child);
  }

  return css;
};

export const generateHTML = (component: Component): string => {
  const tag = component.type === "text" ? "span" : component.type;

  // Handle void elements
  const voidElements = ["img", "input", "br", "hr"];
  if (voidElements.includes(tag)) {
    return `<${tag} id="${component.id}"${
      component.src ? ` src="${component.src}"` : ""
    }/>`;
  }

  const children = component.children
    .map((child) => generateHTML(child))
    .join("\n");

  const content = component.content || "";

  return `<${tag} id="${component.id}">${content}${children}</${tag}>`;
};

export const generatePreview = (
  component: Component,
  interactions: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    ${getAllCSS(component)}
  </style>
</head>
<body>
  ${generateHTML(component)}
  
  <script>
    ${interactions}
  </script>
</body>
</html>`;
};
