"use strict";

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
    "use strict";

    (function ($) {
      var parser = require("./parser.js");

      $.NSyslog = $.NSyslog || {};
      $.NSyslog.parse = parser;
    })(window);
  }, {
    "./parser.js": 3
  }],
  2: [function (require, module, exports) {
    var FRX = /[a-zA-Z][a-zA-Z0-9]+=/;
    var CEP_FIELDS = ["version", "deviceVendor", "deviceProduct", "deviceVersion", "deviceEventClassID", "name", "severity", "extension"];

    function splitHeaders(text) {
      var arr = [],
          map = {};
      var scape = false;
      var fields = 7;
      var curr = "";
      text.split("").forEach(function (ch) {
        if (!fields) {
          curr += ch;
        } else {
          if (ch == "|") {
            if (scape) {
              scape = false;
              curr += ch;
            } else {
              arr.push(curr);
              curr = "";
              fields--;
            }
          } else if (ch == "\\") {
            curr += ch;
            scape = !scape;
          } else {
            scape = false;
            curr += ch;
          }
        }
      });
      if (curr.length) arr.push(curr);
      CEP_FIELDS.forEach(function (f, i) {
        return map[f] = arr[i];
      });
      return map;
    }

    function splitFields(msg) {
      var tokens = msg.split(" ");
      var map = {};
      var token = null;

      while (tokens.length) {
        if (!token) {
          token = tokens.shift();

          if (token.indexOf('=') >= 0) {
            var kv = token.split("=");
            token = kv[0];
            map[token] = kv[1];
          } else {
            map[token] = "";
          }
        } else {
          var val = tokens.shift();

          if (val.indexOf('=') < 0) {
            map[token] += " ".concat(val);
          } else {
            token = null;
            tokens.unshift(val);
          }
        }
      }

      return map;
    }

    module.exports = {
      parse: function parse(text) {
        var headers = splitHeaders(text);
        var fields = splitFields(headers.extension || "");
        return {
          headers: headers,
          fields: fields
        };
      }
    };
  }, {}],
  3: [function (require, module, exports) {
    var Pri = require("./pri.js"),
        CEF = require("./cef.js");

    var RXS = {
      "pri": /^<\d+>/,
      "prinmr": /^\d+ /,
      "prival": /<(\d+)>/,
      "month": /^[A-Za-z][a-z]{2} /,
      "day": /^\d{1,2} /,
      "time": /^\d+:\d+:\d+ /,
      "ts": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\S+ /,
      "invalid": /[^a-zA-Z0-9\.\$\-_#%\/\[\]\(\)]/,
      "sdata": /\[(\S+)( [^\=]+\=\"[^\"]+\")+\]/g,
      "cef": /^CEF:\d+/
    };
    var DOPS = {
      cef: true,
      fields: true,
      pid: true,
      generateTimestamp: true
    };

    function peek(arr) {
      do {
        var item = arr.shift();
        if (item === undefined) return item;else item = item.trim();
      } while (!item);

      return item;
    }

    function assign(entry, item) {
      if (!entry.host) entry.host = item.trim();else if (!entry.appName) entry.appName = item.trim();else if (!entry.pid) entry.pid = item.trim();else if (!entry.messageid) entry.messageid = item.trim();else if (!entry.structuredData) {
        entry.structuredData = item.trim();
        return false;
      } else return true;
    }

    function parse(line, opts) {
      if (opts) opts = Object.assign({}, DOPS, opts);else opts = DOPS;
      var pri = line.match(RXS.pri);
      var entry = {
        originalMessage: line
      }; // First priority

      if (pri) {
        entry.pri = pri[0];
        entry.prival = parseInt(entry.pri.match(RXS.prival)[1]);
        var prival = Pri.get(entry.prival);
        entry.facilityval = prival.facility;
        entry.levelval = prival.level;
        entry.facility = Pri.FACILITY[prival.facility].id;
        entry.level = Pri.LEVEL[prival.level].id;
      } else {
        entry.pri = "";
        entry.prival = NaN;
      } //Split message


      var items = line.substring(entry.pri.length).split(" "); // Date search

      var endparse = false;

      while (line.length && !endparse) {
        var item = peek(items) + " "; // RFC RFC5424

        if (item.match(RXS.prinmr)) {
          entry.version = parseInt(item);
          entry.type = "RFC5424";
          item = peek(items) + " ";

          if (item.match(RXS.ts)) {
            entry.ts = new Date(Date.parse(item.match(RXS.ts)[0].trim()));
          }
        } // BSD
        else if (item.match(RXS.month)) {
            entry.type = "BSD";
            var month = item.trim();
            var day = peek(items);
            var time = peek(items);
            var year = new Date().getYear() + 1900;
            entry.ts = new Date(Date.parse(year + " " + month + " " + day + " " + time));
          } else {
            entry.type = "UNKNOWN";
            items.unshift(item.trim());
          }

        endparse = true;
      } // No timestamp


      if (!entry.ts && opts.generateTimestamp) entry.ts = new Date(); // Is a standard syslog message

      if (entry.type) {
        var invalidate = function invalidate(item) {
          items.unshift(item);
          entry.message = items.join(" ");
          endparse = true;
        };

        endparse = false;

        while (line.length && !endparse) {
          var item = peek(items);

          if (!item) {
            endparse = true;
          } else if (item.endsWith(":")) {
            var eitem = item.replace(/:$/, "").trim();

            if (eitem.match(RXS.invalid)) {
              invalidate(item);
            } else {
              assign(entry, eitem);
              entry.message = items.join(" ");
              endparse = true;
            }
          } else if (!items.length) {
            invalidate(item);
          } else {
            // Invalid item (malformed message)
            if (item.match(RXS.invalid)) {
              invalidate(item);
            } else {
              var r = assign(entry, item.replace(/: $/, "").trim());

              if (r === true) {
                items.unshift(item);
                entry.message = items.join(" ");
                endparse = true;
              } else if (r === false) {
                entry.message = items.join(" ");
                endparse = true;
              }
            }
          }
        }
      } else {
        entry.message = items.join(" ");
      } // Chained hostnames


      entry.chain = (entry.host || "").split("/");
      entry.host = entry.chain.pop(); // Structured data

      if (entry.type == "RFC5424") {
        var sdata = entry.message.match(RXS.sdata) || [];
        var idx = 0;
        entry.structuredData = sdata.map(function (item) {
          var map = {},
              nokeys = [];
          var lastKey = null;
          idx = entry.message.indexOf(item) + item.length + 1;
          item.replace(/(^\[)|(\]$)/g, "").split(" ").forEach(function (t, i) {
            // Extra space
            if (!t.trim()) return; // First element (ID of data)

            if (i == 0) {
              map["$id"] = t;
            } // Key/Pair values
            else {
                var kv = t.split("="); // Correct key/value pair

                if (kv[0] && kv[1] && kv[1] != '"') {
                  lastKey = kv.shift();
                  map[lastKey] = kv.join("=").replace(/\"/g, "");
                } // Last key had values separated by spaces
                else if (kv[0] && kv[1] === undefined) {
                    map[lastKey] += " " + (kv[0] || "").replace(/\"/g, "");
                  } else if (kv[0] && (!kv[1].length || kv[1] == '"')) {
                    map[lastKey] += " " + (kv[0] || "").replace(/\"/g, "") + "=";
                  }
              }
          });
          return map;
        });
        entry.message = entry.message.substring(idx);
      } // CEF Event message


      if (opts.cef !== false && RXS.cef.test(entry.message)) {
        entry.type = "CEF";
        var cef = CEF.parse(entry.message);
        entry.cef = cef.headers;
        entry.fields = cef.fields;
      } // Default syslog message
      else if (opts.fields !== false && entry.type != "UNKNOWN") {
          // Message with fields
          var fields = [];
          entry.message.split(",").forEach(function (kv) {
            var prop = kv.split("=");
            if (prop.length == 2) fields[prop[0]] = prop[1];
          });
          entry.fields = fields;
        } // header


      entry.header = line.substring(0, line.length - entry.message.length); // PID

      if (opts.pid && entry.appName && entry.appName.endsWith("]")) {
        var _idx = entry.appName.indexOf("[");

        if (_idx >= 0) {
          entry.pid = entry.appName.substring(_idx + 1, entry.appName.length - 1);
          entry.appName = entry.appName.substring(0, _idx);
        }
      }

      return entry;
    }

    module.exports = function (line, opts) {
      try {
        return parse(line, opts);
      } catch (err) {
        return {
          err: err
        };
      }
    };
  }, {
    "./cef.js": 2,
    "./pri.js": 4
  }],
  4: [function (require, module, exports) {
    var FACILITY = [{
      id: "kern",
      label: "kernel messages"
    }, {
      id: "user",
      label: "user-level messages"
    }, {
      id: "mail",
      label: "mail system"
    }, {
      id: "daemon",
      label: "system daemons"
    }, {
      id: "auth",
      label: "security/authorization messages"
    }, {
      id: "syslog",
      label: "messages generated internally by syslogd"
    }, {
      id: "lpr",
      label: "line printer subsystem"
    }, {
      id: "news",
      label: "network news subsystem"
    }, {
      id: "uucp",
      label: "UUCP subsystem"
    }, {
      id: "cron",
      label: "clock daemon"
    }, {
      id: "authpriv",
      label: "security/authorization messages"
    }, {
      id: "ftp",
      label: "FTP daemon"
    }, {
      id: "ntp",
      label: "NTP subsystem"
    }, {
      id: "security",
      label: "log audit"
    }, {
      id: "console",
      label: "log alert"
    }, {
      id: "solaris-cron",
      label: "clock daemon"
    }, {
      id: "local0",
      label: "locally used facility 0"
    }, {
      id: "local1",
      label: "locally used facility 0"
    }, {
      id: "local2",
      label: "locally used facility 0"
    }, {
      id: "local3",
      label: "locally used facility 0"
    }, {
      id: "local4",
      label: "locally used facility 0"
    }, {
      id: "local5",
      label: "locally used facility 0"
    }, {
      id: "local6",
      label: "locally used facility 0"
    }, {
      id: "local7",
      label: "locally used facility 0"
    }];
    var LEVEL = [{
      id: "emerg",
      label: "system is unusable"
    }, {
      id: "alert",
      label: "action must be taken immediately"
    }, {
      id: "crit",
      label: "critical conditions"
    }, {
      id: "error",
      label: "error conditions"
    }, {
      id: "warn",
      label: "warning conditions"
    }, {
      id: "notice",
      label: "normal but significant condition"
    }, {
      id: "info",
      label: "informational messages"
    }, {
      id: "debug",
      label: "debug-level messages"
    }];
    var FACILITY_MAP = [];
    var LEVEL_MAP = [];
    FACILITY.forEach(function (f, i) {
      return FACILITY_MAP[f.id] = i;
    });
    LEVEL.forEach(function (l, i) {
      return LEVEL_MAP[l.id] = i;
    });
    module.exports.LEVEL = LEVEL;
    module.exports.FACILITY = FACILITY;
    module.exports.LEVELS = LEVEL_MAP;
    module.exports.FACILITIES = FACILITY_MAP;

    module.exports.get = function (val1, val2) {
      if (typeof val1 == "number" && typeof val2 == "undefined") {
        return {
          level: val1 & 0x7,
          facility: val1 >> 3
        };
      } else if (typeof val1 == "number" && typeof val2 == "number") {
        return val1 * 8 + val2;
      } else if (typeof val1 == "string" && typeof val2 == "number") {
        return (FACILITY_MAP[val1] || 0) * 8 + val2;
      } else if (typeof val1 == "number" && typeof val2 == "string") {
        return val1 * 8 + (LEVEL_MAP[val2] || 0);
      } else if (typeof val1 == "string" && typeof val2 == "string") {
        return (FACILITY_MAP[val1] || 0) * 8 + (LEVEL_MAP[val2] || 0);
      } else {
        return {
          level: 0,
          facility: 0
        };
      }
    };
  }, {}]
}, {}, [1]);
//# sourceMappingURL=nsyslog-parser.js.map
