# Taskly — Vanilla JavaScript Task Manager

Taskly is a fully interactive Task Manager Application built using HTML, CSS, and Vanilla JavaScript DOM APIs. The UI uses a custom warm editorial theme, responsive layouts, Google Fonts, and Remix Icons for icons.

> Note: No JavaScript framework is used. Remix Icons are loaded only as an icon font CDN.

## Features

- Add task dynamically using `createElement()` and `createTextNode()`
- Edit task
- Complete or undo task
- Delete task
- Search task by title
- Filter task by category
- Completed task counter
- Pending task counter
- Clear all tasks
- Dark mode / Light mode theme toggle
- Local Storage integration
- Event Delegation
- Event Bubbling and Capturing demonstration
- Browser Rendering Pipeline visual section
- Fully responsive design for desktop, tablet, and mobile

## Concepts Explained

### Parsing

Parsing is the process where the browser reads HTML or CSS code and understands its structure. For HTML, the browser reads tags like `div`, `h1`, `button`, and builds a structured representation.

### Tokenization

Tokenization is the process where the browser breaks HTML/CSS text into small meaningful units called tokens. Example: `<h1>Hello</h1>` is broken into tokens for start tag, text, and end tag.

### DOM Tree

DOM stands for Document Object Model. It is a tree-like structure created from HTML. JavaScript can access and modify this tree using DOM APIs such as `createElement`, `appendChild`, `remove`, and `querySelector`.

### CSSOM Tree

CSSOM stands for CSS Object Model. It is a tree-like structure created from CSS. It contains style rules that apply to DOM elements.

### Render Tree

The Render Tree is created by combining the DOM Tree and CSSOM Tree. It contains only visible elements with their final styles. The browser uses it to paint pixels on the screen.

### Event Bubbling

Event bubbling means the event starts from the target element and moves upward to its parents.

Example order:

1. Child
2. Parent
3. Grandparent

### Event Capturing

Event capturing means the event starts from the outermost parent and moves downward to the target element.

Example order:

1. Grandparent
2. Parent
3. Child

### Event Delegation

Event delegation means adding one event listener to a parent element instead of adding separate listeners to each child. In this project, the task list has one click listener that handles edit, complete, and delete buttons.

### Attributes vs Properties

Attributes are values written in HTML, while properties are live values available on DOM objects.

Example:

```js
input.value
```

This gives the current value typed by the user.

```js
input.getAttribute("value")
```

This gives the original HTML attribute value unless it was changed using `setAttribute()`.

## DOM Methods Used

- `createElement()`
- `createTextNode()`
- `append()`
- `appendChild()`
- `prepend()`
- `before()`
- `after()`
- `replaceWith()`
- `remove()`
- `getAttribute()`
- `setAttribute()`
- `removeAttribute()`
- `hasAttribute()`
- `dataset`
- `classList`
- `addEventListener()`
- `DocumentFragment`

## How to Run

1. Download or clone this project.
2. Open `index.html` in any modern browser.
3. Open browser console to test event bubbling and capturing.

## Deployment

You can deploy this project on:

- Netlify
- Vercel
- GitHub Pages
