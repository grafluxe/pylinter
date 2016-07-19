/*global define, brackets, $ */
/*jshint unused:false */

/**
 * @author Leandro Silva | Grafluxe
 */

define((require, exports, module) => {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        DocumentManager,
        EditorManager,
        Dialogs,

        fileChange,
        setup,
        definePrefs,
        createPanel,
        parseOutput,
        setClickListeners,
        onLintComplete,
        onLintFail,
        onLintMsg,
        execNode,
        clean,

        ran,
        nodeDomain,
        panel,
        parsed,
        editor,
        $panelFilename,
        $panelBody,
        $panelCloseBtn,
        lastFileWasPy,
        pythonPath,
        outputPattern;

    const DEFAULT_PYLINT_PATH = "/usr/spltal/bin/pylint",
          DEFAULT_OUTPUT_PATTERN = "{msg_id} > {msg} [{symbol} @ {line},{column}]";

    AppInit.appReady(() => {
        var MainViewManager = brackets.getModule("view/MainViewManager");

        DocumentManager = brackets.getModule("document/DocumentManager");

        MainViewManager.on("currentFileChange", fileChange);
    });

    fileChange = () => {
        var currDoc = DocumentManager.getCurrentDocument();

        if (panel) {
            panel.hide();
        }

        if (currDoc && currDoc.getLanguage().getName() === "Python") {
            if (!ran) {
                ran = true;

                setup();
                definePrefs();
                createPanel();
            }

            editor = EditorManager.getActiveEditor();

            $panelBody.find("a").off("click");

            if (!lastFileWasPy) {
                lastFileWasPy = true;

                nodeDomain.on("lintComplete", onLintComplete);
                nodeDomain.on("lintFail", onLintFail);
                nodeDomain.on("lintMsg", onLintMsg);
                DocumentManager.on("documentSaved", execNode);
            }

            execNode();
        } else {
            clean();
        }
    };

    setup = () => {
        var NodeDomain = brackets.getModule("utils/NodeDomain"),
            ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

        ExtensionUtils.loadStyleSheet(module, "view/style.css");

        EditorManager = brackets.getModule("editor/EditorManager");
        Dialogs = brackets.getModule("widgets/Dialogs");
        nodeDomain = new NodeDomain("nodeLogic", ExtensionUtils.getModulePath(module, "node-context"));
    };

    definePrefs = () => {
        var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
            prefs = PreferencesManager.getExtensionPrefs("pylinter");

        pythonPath = prefs.get("pythonPath");
        outputPattern = prefs.get("outputPattern");

        if (!pythonPath) {
            pythonPath = DEFAULT_PYLINT_PATH;
            prefs.set("pythonPath", pythonPath);
        }

        if (!outputPattern) {
            outputPattern = DEFAULT_OUTPUT_PATTERN;
            prefs.set("outputPattern", outputPattern);
        }
    };

    createPanel = () => {
        var WorkspaceManager = brackets.getModule("view/WorkspaceManager");

        panel = WorkspaceManager.createBottomPanel("pylint-panel", $(require("text!view/panel.html")), 144);

        $panelFilename = $("#pylint-filename");
        $panelBody = $("#pylint-body");
        $panelCloseBtn = $("#pylint-close-btn");

        $panelCloseBtn.click(() => panel.hide());
    };

    onLintComplete = (e, msg) => {
        var html,
            issueCount;

        console.log("Xxx");

        if (msg) {
            console.log(msg.substr(0, 200), "...");

            parsed = parseOutput(msg);
            html = "<ul>";

            parsed.out.forEach(function (el, i) {
                html += `<li><a href="#" data-pylint-el="${i}" class="pylint-err">${el.txt}</a><a href="#" data-pylint-id="${el.msgId}" class="pylint-more"><span>?</span></a></li>`;
            });

            html += "</ul>";

            issueCount = parsed.out.length;

            $panelFilename.text(parsed.name + ` (${issueCount} issue${issueCount > 1 ? "s" : ""})`);
            $panelBody.html(html);

            setClickListeners();

            panel.show();
        } else {
            $panelFilename.text("");
            $panelBody.find("a").off("click").html("No Issues");
            panel.hide();
        }
    };

    onLintFail = (e, err) => {
        Dialogs.showModalDialog(
            null,
            "Pylinter",
            "<b>Pylint can't be found!</b><br>Please confirm you have Pylint installed and that the property 'pylinter.pythonPath' in your Brackets preference file is correct. Once you edit your preference file, please restart Brackets."
        );

        console.error("[Pylinter] Node Error: ", err);
    };

    onLintMsg = (e, msg) => {
        var [, title, info, desc] = msg.match(/:(.+): \*(.+)\*([\s\S]+)/);

        Dialogs.showModalDialog(
            null,
            "Pylinter",
            `<h4>${title}</h4><p>${info}</p><p>${desc}</p>`
        );
    };

    parseOutput = (input) => {
        var name = input.match(/^\** .* (.*)$/m)[1],
            out,
            splt;

        out = input.split(/\n/);

        out.shift();
        out.pop();

        out = out.map((el, i) => {
            splt = el.match(/^(-?\d+),(-?\d+);(.+)\?/);

            return {
                txt: $("<p>" + el.substr(el.indexOf("?") + 1) + "</p>").text(),
                line: Number(splt[1]) - 1,
                col: Math.max(Number(splt[2]), 0),
                msgId: splt[3]
            };
        });

        return {
            name,
            out
        };
    };

    setClickListeners = () => {
        $panelBody.find(".pylint-err").click((e) => {
            var indx = e.currentTarget.dataset.pylintEl,
                el = parsed.out[indx];

            e.preventDefault();

            editor.setCursorPos(el.line, el.col, true);
            editor.focus();
        });

        $panelBody.find(".pylint-more").click((e) => {
            e.preventDefault();

            nodeDomain.exec("getMsg", pythonPath, e.currentTarget.dataset.pylintId);
        });
    };

    execNode = () => {
        nodeDomain.exec("lintIt", pythonPath, DocumentManager.getCurrentDocument().file.fullPath, outputPattern);
    };

    clean = () => {
        lastFileWasPy = false;

        if (nodeDomain) {
            nodeDomain.off("lintComplete", onLintComplete);
            nodeDomain.off("lintFail", onLintFail);
            nodeDomain.off("lintMsg", onLintMsg);
        }

        DocumentManager.off("documentSaved", execNode);
    };
});
