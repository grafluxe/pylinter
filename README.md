# Pylinter

A Python linter for Adobe Brackets. This extension lints Python code on save (with Pylint). It works like JSLint, but for Python.

![Screenshot](./screenshot.jpg)

## Features

- Automatically lints on file open and file save.
- Configurable lint message [output pattern](#configure).
- Resizable window pane.
- Closable window pane (will stay closed until the file is re-saved).
- Clicking on a lint message will take you to the related line in the code editor.
- Clicking on a lines "?" button will open a more detailed Pylint message.

## Install Pylint

Install Pylint by following instructions from <https://www.pylint.org/#install>

## Install Extension

In the Brackets Extension Manager, either:

- Search for Pylinter
- Use the "install from URL" option and paste in `https://github.com/Grafluxe/pylinter`

Restart Brackets after install.

## Configure

Pylinter comes with two preference options.

- pylinter.outputPattern:
    - The Pylint message output pattern.
    - Defaults to "{msg_id} > {msg} [{symbol} @ {line},{column}]."
    - To further customize the output pattern, use formats specified [here](https://pylint.readthedocs.io/en/latest/user_guide/output.html).
- pylinter.pylintPath:
    - The path to your Pylint install.

## Changelog

**1.3.0**

- Enable selection on panel text.

**1.2.0**

- Update logic and view to match default Brackets linter panel.
  - It now looks and feels like a native Brackets extension.
- Update screenshot to reflect redesign.
- Clean up main module.

**1.0.1**

- Check for method existence before adding listener.
  - Removes error that occurs on first run after install.

**1.0.0**

- Initial release.

## License

Copyright (c) 2016 Leandro Silva (http://grafluxe.com)

Released under the MIT License.

See LICENSE.md for entire terms.
