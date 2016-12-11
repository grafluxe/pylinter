/**
 * @author Leandro Silva | Grafluxe, 2016
 */

(function() {
  "use strict";

  var init,
      lintIt,
      getMsg,

      spawn = require("child_process").spawn,
      domainMgr;

  init = function(domainManager) {
    domainMgr = domainManager;

    if (!domainMgr.hasDomain("nodeLogic")) {
      domainMgr.registerDomain("nodeLogic", {
        major: 0,
        minor: 1
      });
    }

    domainMgr.registerCommand(
      "nodeLogic", //domain name
      "lintIt",    //command name
      lintIt,      //command handler function
      false        //this command is synchronous in Node
    );

    domainMgr.registerCommand(
      "nodeLogic",
      "getMsg",
      getMsg,
      false
    );

    domainMgr.registerEvent("nodeLogic", "lintComplete");
    domainMgr.registerEvent("nodeLogic", "lintFail");
    domainMgr.registerEvent("nodeLogic", "lintMsg");
  };

  lintIt = function(pylintPath, filePath, pattern) {
    var cmd = spawn(pylintPath, ["-rn", "--msg-template='{line},{column};{msg_id}?" + pattern + "'", filePath]),
        out;

    cmd.once("error", function(err) {
      domainMgr.emitEvent("nodeLogic", "lintFail", err);
    });

    cmd.stdout.once("data", function(data) {
      out = data.toString();
    });

    cmd.once("close", function() {
      domainMgr.emitEvent("nodeLogic", "lintComplete", out);
    });
  };

  getMsg = function(pylintPath, id) {
    var cmd = spawn(pylintPath, ["--help-msg=" + id]);

    cmd.once("error", function(err) {
      domainMgr.emitEvent("nodeLogic", "lintFail", err);
    });

    cmd.stdout.once("data", function(data) {
      domainMgr.emitEvent("nodeLogic", "lintMsg", data.toString());
    });
  };

  //
  exports.init = init;
}());
