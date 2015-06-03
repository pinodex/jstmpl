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

        this.options = options || {};

        this.context = this.options.context || document;

        this.patterns = {
            variable: new RegExp('\{\{ ([^}]+) \}\}', 'gm')
        };

        this.fn = {

            raw: function(string) {
                return Jstmpl_Helpers.htmlUnescape(string);
            }

        };

        if (this.options.fn) {
            var customFunctions = Object.keys(this.options.fn);

            for (var i = customFunctions.length - 1; i >= 0; i--) {
                this.fn[customFunctions] = this.options.fn[customFunctions];
            };
        }

        this.render = function(name, vars, callback) {
            var elements = this.context.querySelectorAll('[data-template="' + name + '"]');
            vars = vars || {};

            if (!elements) {
                return new Jstmpl_Template(this, name);
            }

            for (var i = elements.length - 1; i >= 0; i--) {
                var string = elements[i].innerHTML;
                var matches = string.match(this.patterns.variable);

                if (!matches) {
                    continue;
                }

                for (var ia = matches.length - 1; ia >= 0; ia--) {
                    var replacement = matches[ia].substr(3, matches[ia].length - 6).split('|');
                    var resultString = vars[replacement[0]];

                    if (!resultString) {
                        continue;
                    }

                    matches[ia] = matches[ia].replace(/\|/g, '\\|');
                    resultString = Jstmpl_Helpers.htmlEscape(resultString);

                    if (replacement.length > 1) {
                        for (var ib = replacement.length - 1; ib >= 1; ib--) {
                            if (!replacement[ib]) {
                                continue;
                            }

                            if (replacement[ib] in this.fn) {
                                resultString = this.fn[replacement[ib]](resultString);
                                continue;
                            }

                            this.debug().warn('Jstmpl: function "%s" is not defined.', replacement[ib]);
                        };
                    }

                    string = string.replace(new RegExp(matches[ia], 'gm'), resultString);
                };

                var target;

                if ((target = elements[i].getAttribute('data-target'))) {
                    var targets = this.context.querySelectorAll(target);

                    for (var i = targets.length - 1; i >= 0; i--) {
                        targets[i].innerHTML = string;
                    };

                    continue;
                }

                elements[i].innerHTML = string;
            };

            if (typeof callback === 'function') {
                callback(elements);
            }

            return new Jstmpl_Template(this, name);
        };

        this.addFunction = function(name, fn) {
            this.fn[name] = fn;
        };

        this.debug = function() {
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
        }

    };

    window.Jstmpl_Template = function(template, name) {

        this.template = template;

        this.name = name;

        this.parse = function(vars, callback) {
            this.template.render(name, vars, callback);

            return this;
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