/**
 * jstmpl
 * Simple JavaScript Templating Engine
 *
 * @author    Raphael Marco <pinodex@outlook.ph>
 * @link      http://pinodex.github.io
 * @license   MIT
 */

(function() {

    "use strict";

    window.Jstmpl = function Jstmpl(options) {

        if (!String.prototype.trim) {
            String.prototype.trim = function() {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        }

        this.options = options || {};

        this.context = this.options.context || document;

        this.fn = {

            raw: function(string) {
                return Jstmpl_Helpers.htmlUnescape(string);
            }

        };

        if (window.jstmpl_defaults) {
            var defaultOptions = Object.keys(window.jstmpl_defaults);

            for (var i = defaultOptions.length - 1; i >= 0; i--) {
                this.options[defaultOptions[i]] = window.jstmpl_defaults[defaultOptions[i]];
            };
        }

        if (this.options.fn) {
            var customFunctions = Object.keys(this.options.fn);

            for (var i = customFunctions.length - 1; i >= 0; i--) {
                this.fn[customFunctions[i]] = this.options.fn[customFunctions[i]];
            };
        }

    };

    window.Jstmpl.prototype.template = function(name) {
        return new Jstmpl_Template(this, name);
    }

    window.Jstmpl.prototype.addFunction = function(name, fn) {
        this.fn[name] = fn;
    };

    window.Jstmpl.prototype.debug = function() {
        if (!this.options.debug) {
            return {
                log: function() {},
                warn: function() {},
                error: function() {}
            };
        }

        return {
            log: function() {
                console.log.apply(console, arguments);
            },
            warn: function() {
                console.warn.apply(console, arguments);
            },
            error: function() {
                console.error.apply(console, arguments);
            }
        };
    };

    window.Jstmpl_Template = function Jstmpl_Template(jstmpl, name) {

        this.jstmpl = jstmpl;

        this.elements = jstmpl.context.querySelectorAll('[data-template="' + name + '"]');

    };

    window.Jstmpl_Template.prototype.regExp = {
        variables: new RegExp('{{ ([^}]+) }}', 'gm'),
        forloops: new RegExp('{% for (.*?) in (.*?) %}((.*?|\n)+?){% endfor %}', 'gm'),
        conditionals: new RegExp('{% if (.*?) %}((.*?|\n)+?){% endif %}', 'gm')
    };

    window.Jstmpl_Template.prototype.render = function(vars) {
        vars = vars || {};

        var output = this.parse(vars);

        for (var i = this.elements.length - 1; i >= 0; i--) {
            var target;

            if ((target = this.elements[i].getAttribute('data-target'))) {
                var targets = this.jstmpl.context.querySelectorAll(target);

                for (var i = targets.length - 1; i >= 0; i--) {
                    targets[i].innerHTML = output;
                };

                continue;
            }

            this.elements[i].innerHTML = output;
        };

        return this;
    };

    window.Jstmpl_Template.prototype.parse = function(vars, contents) {
        vars = vars || {};

        var contents = contents || this.elements[0].innerHTML;

        if (!contents) {
            return null;
        }

        contents = this.parseConditionals(contents, vars);
        contents = this.parseForloops(contents, vars);
        contents = this.parseVariables(contents, vars);

        return contents.trim();
    };

    window.Jstmpl_Template.prototype.callback = function(cb) {
        cb(this.elements);
    };

    window.Jstmpl_Template.prototype.parseVariables = function(contents, vars) {
        var matches = contents.match(this.regExp.variables) || [];

        for (var ia = matches.length - 1; ia >= 0; ia--) {
            var replacement = matches[ia].substr(3, matches[ia].length - 6).split('|');
            replacement[0] = replacement[0].split('.');
                    
            var result = vars[replacement[0][0]];

            if (!result) {
                this.jstmpl.debug().error('Jstmpl: Undefined variable "%s".', replacement[0].join('.'));
                continue;
            }

            if (replacement[0].length > 1) {
                for (var iaa = 1; iaa < replacement[0].length; iaa++) {
                    if (!result) {
                        this.jstmpl.debug().error('Jstmpl: Undefined variable "%s" from "%s".', replacement[0][iaa], replacement[0].join('.'));
                        continue;
                    }

                    result = result[replacement[0][iaa]];
                };
            }

            matches[ia] = matches[ia].replace(/\|/g, '\\|');
            result = Jstmpl_Helpers.htmlEscape(result);

            if (replacement.length > 1) {
                for (var ib = replacement.length - 1; ib >= 1; ib--) {
                    if (!replacement[ib]) {
                        continue;
                    }

                    if (replacement[ib] in this.fn) {
                        result = this.fn[replacement[ib]](result);
                        continue;
                    }

                    this.jstmpl.debug().error('Jstmpl: Undefined function "%s".', replacement[ib]);
                };
            }

            contents = contents.replace(new RegExp(matches[ia], 'gm'), result);
        };

        return contents;
    };


    window.Jstmpl_Template.prototype.parseForloops = function(contents, vars) {
        var matches;

        while ((matches = this.regExp.forloops.exec(contents)) != null) {
            var data = vars[matches[2]];
            var newContent = '';

            matches[1] = matches[1].replace(/ +/g, ' ').trim().split(',');

            if (matches[1].length != 1 && matches[1].length != 2) {
                this.jstmpl.debug().error('Jstmpl: Invalid variable count for "%s" for loop.', matches[2]);
                continue;
            }

            if (!data) {
                this.jstmpl.debug().error('Jstmpl: Undefined variable "%s".', matches[2]);
                continue;
            }

            var dataKeys = Object.keys(data);
            var subVars = {};

            for (var i = 0; i < dataKeys.length; i++) {
                var dataType = Object.prototype.toString.call(data);

                if (dataType == '[object Array]') {
                    subVars[matches[1][0]] = String(data[i]);
                }

                if (dataType == '[object Object]') {
                    subVars[matches[1][0]] = String(dataKeys[i]);
                }

                if (matches[1].length == 2) {
                    subVars[matches[1][1]] = String(data[dataKeys[i]]);
                }

                newContent += this.parse(subVars, matches[3]);
            };

            matches[0] = matches[0].replace(/\|/g, '\\|');
            contents = contents.replace(new RegExp(matches[0], 'gm'), newContent);
        }

        return contents;
    };

    window.Jstmpl_Template.prototype.parseConditionals = function(contents, vars) {
        var matches;

        while ((matches = this.regExp.conditionals.exec(contents)) != null) {
            var statement = matches[1].replace(/ +/g, ' ').trim().split(' ');
            var condition = statement[0];
            var negate = false;

            if (condition == 'not') {
                statement = statement.splice(1);
                condition = statement[0];
                negate = true;
            }

            if (condition.charAt(0) == '!') {
                condition = condition.substr(1);
                negate = true;
            }

            if (!(condition in vars)) {
                this.jstmpl.debug().warn('Jstmpl: Undefined variable "%s".', condition);
            }

            var result = vars[condition];
            matches[0] = new RegExp(matches[0].replace(/\|/g, '\\|'), 'gm');

            if (!negate && statement.length == 1 && result) {
                contents = contents.replace(matches[0], this.parse(vars, matches[2]));
                continue;
            }

            if (statement[1]) {
                var stringLiteral = /["'](.*?)["']/.test(arguments[2]);
                var booleanLiteral = /(true|false)/i.test(arguments[2]);

                if (stringLiteral) {
                    statement[2] = statement[2].replace(/["'](.*?)["']/, '$1');
                }

                if (!stringLiteral && vars[statement[2]]) {
                    statement[2] = vars[statement[2]];
                }

                if (booleanLiteral) {
                    statement[2] = statement[2].toLowerCase() === 'true';
                }

                var test;

                if (test = this.conditionTests[statement[1]]) {
                    result = test(vars[condition], statement[2]);
                }

                if (!test) {
                    this.jstmpl.debug().warn('Jstmpl: Undefined test function "%s".', statement[1]);

                    result = false;
                    negate = false;
                }
            }

            if (negate) {
                result = !result;
            }

            if (result) {
                contents = contents.replace(matches[0], this.parse(vars, matches[2]));
                continue;
            }

            contents = contents.replace(matches[0], '');
        }

        return contents;
    };

    window.Jstmpl_Template.prototype.conditionTests = {

        'equals': function () {
            return arguments[0] == arguments[1];
        },

        '==': function () {
            return this.equals(arguments[0], arguments[1]);
        },

        'startsWith': function () {
            return arguments[0].indexOf(arguments[1]) == 0;
        },

        'startswith': function () {
            return this.startsWith(arguments[0], arguments[1]);
        },

        'contains': function() {
            return arguments[0].indexOf(arguments[1]) >= 0;
        },

        'is': function() {
            if (arguments[1] == 'empty') {
                return !arguments[0];
            }

            return false;
        }

    };

    window.Jstmpl_Helpers = {

        htmlEscape: function(string) {
            return String(string)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },

        htmlUnescape: function(string) {
            return String(string)
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
        }

    };

}());