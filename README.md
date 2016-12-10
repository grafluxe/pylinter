# Pylinter

A Python linter for Brackets. This extension lints Python code on save (with Pylint). It works like JSLint, but for Python.

![Screenshot](./screenshot.jpg)

## Install Pylint

Install Pylint by following instructions from <https://www.pylint.org/#install>

## Install Extension

In the Brackets Extension Manager, either:

- Search for Pylinter
- Use the "install from URL" option and paste in `https://github.com/Grafluxe/pylinter.git`

Restart Brackets after install.

## Configure

Pylinter comes with two preference options.

- pylinter.pylintPath
    - The path to your Pylint install.
- pylinter.outputPattern
    - The Pylint message output pattern.
    - Defaults to "{msg_id} > {msg} [{symbol} @ {line},{column}]."
    - To further customize the output pattern, use formats specified [here](https://pylint.readthedocs.io/en/latest/user_guide/output.html).

## License

Released under the MIT License.

Copyright (c) 2016 Leandro Silva (http://grafluxe.com)

See LICENSE.md for entire terms.
