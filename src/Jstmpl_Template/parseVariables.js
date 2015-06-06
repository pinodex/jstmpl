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