/*global define, brackets, $ */
/*jshint unused:false */

/**
 * @author Leandro Silva | Grafluxe
 */

define((require, exports, module) => {
    "use strict";
    
    var AppInit = brackets.getModule("utils/AppInit"),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager,
        
        init,
        definePrefs,
        createPanel,
        parseOutput,
        setClickListeners,
        onLintComplete,
        onLintFail,
        execNode,
        
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
    
    const DEFAULT_PYLINT_PATH = "/usr/local/bin/pylint",
          DEFAULT_OUTPUT_PATTERN = "{msg_id} > {msg} [{symbol} @ {line},{column}]";
    
    AppInit.appReady(() => {        
        MainViewManager.on("currentFileChange", () => {
            if (panel) {
                panel.hide();
            }
                        
            //If not a Python file, exit
            if (DocumentManager.getCurrentDocument().getLanguage().getName() !== "Python") {
                lastFileWasPy = false;
                DocumentManager.off("documentSaved", execNode);
                
                return;
            }
            
            if (!ran) {
                ran = true;
                
                init();
                definePrefs();
                createPanel();
                nodeDomain.on("lintComplete", onLintComplete);
                nodeDomain.on("lintFail", onLintFail);
            }
            
            editor = EditorManager.getActiveEditor();
            
            execNode();
            
            if (!lastFileWasPy) {
                lastFileWasPy = true;

                DocumentManager.on("documentSaved", execNode);
            }
        });
    });
    
    init = () => {
        var NodeDomain = brackets.getModule("utils/NodeDomain"),
            ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
        
        ExtensionUtils.loadStyleSheet(module, "view/style.css");
        
        EditorManager = brackets.getModule("editor/EditorManager");
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
    
    onLintComplete = (e, data) => {
        var html,
            issueCount;

        if (data) {
            parsed = parseOutput(data);
            html = "<ul>";

            parsed.out.forEach(function (el, i) {
                html += `<li><a href="#" data-pylint-el="${i}">${el.txt}</a></li>`;
            });

            html += "</ul>";
            
            issueCount = parsed.out.length;

            $panelFilename.text(parsed.name + ` (${issueCount} issue${issueCount > 1 ? "s" : ""})`);
            $panelBody.html(html);

            setClickListeners();

            panel.show();
        } else {
            $panelFilename.text("");
            $panelBody.html("No Issues");
            panel.hide();
        }
    };
    
    onLintFail = (e, data) => {
        var Dialogs = brackets.getModule("widgets/Dialogs");
        
        Dialogs.showModalDialog(
            null,
            "Pylinter",
            "<b>Pylint can't be found!</b><br>Please confirm you have Pylint installed and that the property 'pylinter.pythonPath' in your Brackets preference file is correct. Once you edit your preference file, please restart Brackets."
        );
        
        console.error("[Pylinter] Node Error: ", data);
    };
    
    parseOutput = (input) => {
        var name = input.match(/^\** .* (.*)$/m)[1],
            out,
            loc;

        out = input.split(/\n/);
        
        out.shift();
        out.pop();

        out = out.map((el, i) => {
            loc = el.match(/^(-?\d+),(-?\d+)\?/);
            
            return {
                txt: $("<p>" + el.substr(el.indexOf("?") + 1)).text(),
                line: Number(loc[1]) - 1,
                col: Math.max(Number(loc[2]), 0)
            };
        });

        return {
            name,
            out
        };
    };
    
    setClickListeners = () => {
        $panelBody.find("ul > li > a").click((e) => {
            var indx = $(e.target).data("pylint-el"),
                el = parsed.out[indx];
            
            editor.setCursorPos(el.line, el.col, true);
            editor.focus();
        });
    };
    
    execNode = () => {
        nodeDomain.exec("lintIt", pythonPath, DocumentManager.getCurrentDocument().file.fullPath, outputPattern);
    };
});