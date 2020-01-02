define("ace/mode/runtime_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var runtimeHighlightRules = function() {

    this.$rules = { start: 
      [ { token: 'keyword.control.runtime',
           regex: '\\b(?:let|jmp|slp|tim|add|sub|mul|mod|div|psh|pop|pol|put|get|int|str|typ|a2i|i2a|drw|drt|pxl|clr|prt|inp|rnd|j(?:eq|ne|lt|gt)|ife|ifg|els|fin|def|ret|end|cal)\\b',
           caseInsensitive: true },

         { token: 'variable',
           regex: '\\$[^\\s]+'},

         { token: 'constant.character.decimal.runtime',
           regex: '[+-\\s][0-9]+\\b' },
         { token: 'constant.character.hexadecimal.runtime',
           regex: '\\b0x[A-F0-9]+\\b',
           caseInsensitive: true },
         { token: 'constant.character.hexadecimal.runtime',
           regex: '\\b[A-F0-9]+h\\b',
           caseInsensitive: true },
         { token: 'string.runtime', regex: /'([^\\']|\\.)*'/ },
         { token: 'string.runtime', regex: /"([^\\"]|\\.)*"/ },
         { token: 'entity.name.function.runtime', regex:  '#.*$' },
         { token: 'comment.runtime', regex: '/.*$' } ]
      };
    
    this.normalizeRules();
};

runtimeHighlightRules.metaData = { fileTypes: [ 'runtime', 'rt' ],
      keyEquivalent: '^~F',
      name: 'runtime',
      scopeName: 'source.runtime' };


oop.inherits(runtimeHighlightRules, TextHighlightRules);

exports.runtimeHighlightRules = runtimeHighlightRules;
});

define("ace/mode/runtime",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/runtime_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var runtimeHighlightRules = require("./runtime_highlight_rules").runtimeHighlightRules;

var Mode = function() {
    this.HighlightRules = runtimeHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "/";
    this.blockComment = null;
    this.$id = "ace/mode/runtime";
}).call(Mode.prototype);

exports.Mode = Mode;
});                (function() {
                    window.require(["ace/mode/runtime"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
