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

        this.regExp = {
            forloops: new RegExp('{% for (.*?) in (.*?) %}((.*?|\n)+?){% endfor %}', 'gm'),
            variables: new RegExp('{{ ([^}]+) }}', 'gm')
        };

        this.template = function(name) {
            return new Jstmpl_Template(this, name);
        };

        this.parseVariables = function(contents, vars) {
            var matches = contents.match(this.regExp.variables) || [];

            for (var ia = matches.length - 1; ia >= 0; ia--) {
                var replacement = matches[ia].substr(3, matches[ia].length - 6).split('|');
                replacement[0] = replacement[0].split('.');
                    
                var result = vars[replacement[0][0]];

                if (!result) {
                    this.debug().error('Jstmpl: Variable %s is not defined.', replacement[0].join('.'));
                    continue;
                }

                if (replacement[0].length > 1) {
                    for (var iaa = 1; iaa < replacement[0].length; iaa++) {
                        if (!result) {
                            this.debug().error('Jstmpl: Variable %s from %s is not defined.',
                                replacement[0][iaa], replacement[0].join('.'));

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

                        this.debug().error('Jstmpl: Function "%s" is not defined.', replacement[ib]);
                    };
                }

                contents = contents.replace(new RegExp(matches[ia], 'gm'), result);
            };

            return contents;
        };

        this.parseForloops = function(contents, vars) {
            var matches;

            while ((matches = this.regExp.forloops.exec(contents)) != null) {
                var data = vars[matches[2]];
                var newContent = '';

                matches[1] = matches[1].split(',');

                if (matches[1].length != 1 && matches[1].length != 2) {
                    this.debug().error('Jstmpl: Invalid variable count for "%s" for loop.', matches[2]);
                    continue;
                }

                if (!data) {
                    this.debug().error('Jstmpl: Variable %s is not defined.', matches[2]);
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

                    newContent += this.parseVariables(matches[3], subVars);
                };

                matches[0] = matches[0].replace(/\|/g, '\\|');
                contents = contents.replace(new RegExp(matches[0], 'gm'), newContent);
            }

            return contents;
        }

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

    window.Jstmpl_Template = function(jstmpl, name) {

        this.jstmpl = jstmpl;

        this.elements = this.jstmpl.context.querySelectorAll('[data-template="' + name + '"]');

        this.render = function(vars) {
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

        this.parse = function(vars) {
            vars = vars || {};
            var parsed = {};

            if (!this.elements.length) {
                return null;
            }

            var contents = this.elements[0].innerHTML;
            contents = this.jstmpl.parseForloops(contents, vars);
            contents = this.jstmpl.parseVariables(contents, vars);

            return contents.trim();
        };

        this.callback = function(cb) {
            cb(this.elements);
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