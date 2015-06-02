# jstmpl
Simple JavaScript Templating Engine

## Usage
```
<div data-template="hello-world">{{ hello }} {{ world }}</div>
<script>
    new Template('hello-world').parse({
        hello: 'Hello',
        world: 'World!'
    }
</script>
```

Read more [here](http://pinodex.github.io/jstmpl/)
