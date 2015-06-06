window.Jstmpl_Template = function Jstmpl_Template(jstmpl, name) {

    this.jstmpl = jstmpl;

    this.elements = jstmpl.context.querySelectorAll('[data-template="' + name + '"]');
    
};