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