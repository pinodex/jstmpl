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