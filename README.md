# jstmpl
Simple JavaScript Templating Engine

## Usage
```
<div data-template="hello-world">{{ hello }} {{ world }}</div>
<script>
    new Jstmpl().render('hello-world', {
        hello: 'Hello',
        world: 'World!'
    }
</script>
```

Read more [here](http://pinodex.github.io/jstmpl/)
