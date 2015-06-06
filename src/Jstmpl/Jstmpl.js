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