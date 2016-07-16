/**
 * @author Leandro Silva | Grafluxe
 */

(function () {
    "use strict";
    
    var spawn = require("child_process").spawn,
        domainMgr,
        init,
        lintIt;
    
    init = function (domainManager) {
        domainMgr = domainManager;
        
        if (!domainMgr.hasDomain("nodeLogic")) {
            domainMgr.registerDomain("nodeLogic", {
                major: 0,
                minor: 1
            });
        }
        
        domainMgr.registerCommand(
            "nodeLogic", //domain name
            "lintIt", //command name
            lintIt //command handler function            
        );
        
        domainMgr.registerEvent("nodeLogic", "lintComplete");
        domainMgr.registerEvent("nodeLogic", "lintFail");
    };
    
    lintIt = function (pylintPath, filePath, pattern) {        
        var cmd = spawn(pylintPath, ["-rn", "--msg-template='{line},{column}?" + pattern + "'", filePath]),
            out;
        
        cmd.once("error", function (err) {
            domainMgr.emitEvent("nodeLogic", "lintFail", err);
        });
        
        cmd.stdout.once("data", function (data) {
            out = data.toString();
        });

        cmd.once("close", function () {
            domainMgr.emitEvent("nodeLogic", "lintComplete", out);
        });
    };
    
    //
    exports.init = init;
}());