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

    'contains': function () {
        return arguments[0].indexOf(arguments[1]) >= 0;
    },

    'is': function () {
        if (arguments[1] == 'empty') {
            return !arguments[0];
        }

        return false;
    }

};