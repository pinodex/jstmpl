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