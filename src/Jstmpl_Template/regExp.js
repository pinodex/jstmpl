window.Jstmpl_Template.prototype.regExp = {
    variables: new RegExp('{{ ([^}]+) }}', 'gm'),
    forloops: new RegExp('{% for (.*?) in (.*?) %}((.*?|\n)+?){% endfor %}', 'gm'),
    conditionals: new RegExp('{% if (.*?) %}((.*?|\n)+?){% endif %}', 'gm')
};