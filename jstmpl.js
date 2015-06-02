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

    window.Template = function(name) {

        this.patterns = {
            variable: new RegExp('\{\{ ([^}]+) \}\}', 'gm')
        };

        this.elements = document.querySelectorAll('[data-template="' + name + '"]');

        this.parse = function(data, value, callback) {
            data = data || {};

            if (typeof data === 'string') {
                var key = data;

                data = {};
                data[key] = value;
            }

            for (var i = this.elements.length - 1; i >= 0; i--) {
                var string = this.elements[i].innerHTML;
                var matches = string.match(this.patterns.variable);

                if (!matches) {
                    continue;
                }

                for (var ia = matches.length - 1; ia >= 0; ia--) {
                    var replacement = matches[ia].substr(3, matches[ia].length - 6);

                    if (replacement in data) {
                        string = string.replace(new RegExp(matches[ia], 'gm'), data[replacement]);
                    }
                };

                var target;

                if ((target = this.elements[i].getAttribute('data-target'))) {
                    var targets = document.querySelectorAll(target);

                    for (var i = targets.length - 1; i >= 0; i--) {
                        targets[i].innerHTML = string;
                    };

                    continue;
                }

                this.elements[i].innerHTML = string;
            };

            callback = callback || value;

            if (typeof callback === 'function') {
                callback(this.elements);
            }

            return this;
        };

    };

}());