# Welcome to your VS Code Extension

## What's in the folder

* This folder contains all of the files necessary for your extension.
* `package.json` - this is the manifest file that defines the location of the extension's main file and the commands the extension contributes.
* `extension.js` - this is the main file where you will provide the implementation of your extension.

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `PS1:`.
* Set breakpoints in your code inside `extension.js` to debug your extension.

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `extension.js`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Explore the API

* You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Package the extension

* To package the extension for distribution:
  * Install vsce: `npm install -g vsce`
  * Package the extension: `vsce package`
  * The resulting `.vsix` file can be installed manually in VS Code.
