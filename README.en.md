# Code Printer 🖨️

[[한국어]](./README.md) | **[English]**

Print your source code beautifully and neatly on A4 paper or save it as PDF.  
Simply paste your code, customize page layout, fonts, and margins, and print right inside your browser.

---

## ✨ Key Features

- 🔒 **100% Browser-Based Privacy**: Your code is never sent to any server. Everything is processed locally inside your browser.
- 📄 **Real-time A4 Print Preview**: Preview exactly how your code will look on paper with automatic and manual page breaks (`PAGE_BREAK`).
- 📑 **Multi-Column Layout**: Supports both 1-column and 2-column layouts to save paper and present long code efficiently.
- 🎨 **Syntax Highlighting & Customization**: Adjust fonts, margins, line spacing, and letter spacing precisely.
- 🔍 **Find & Replace**: Easily search and modify code within the editor.
- 🤖 **Agent API**: Automate settings and code via URL parameters and `window.codePrinter`. See [llms.txt](./public/llms.txt).

---

## 🚀 How to Use

1. Visit the [Code Printer Website](https://code-printer.sysscalper.workers.dev/).
2. Paste your source code or drag and drop a file into the editor.
3. Use the right control panel to adjust columns, font, and margins.
4. Print or save as PDF using your browser's print feature (`Ctrl + P` / `Cmd + P`).

---

## 💻 Local Development

If you'd like to contribute or run the project locally:

### Clone and Install
```bash
git clone https://github.com/ddunddun-labs/code-printer.git
cd code-printer
npm install
```

### Run Development Server
```bash
npm start
```
Open `http://localhost:3000` in your browser.

### Test and Build
```bash
# Run tests
npm test

# Build for production
npm run build
```

---

## ☁️ Deployment

The production site is deployed with Cloudflare Workers Static Assets. Changes merged into `main` are built and deployed through Cloudflare's Git integration.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
See [GitHub Issues](https://github.com/ddunddun-labs/code-printer/issues) or the [contributing guidelines](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
