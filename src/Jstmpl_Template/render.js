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