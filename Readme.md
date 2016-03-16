# cas-server-theme

This module provides a reference implementation of a [cas-server][cs] theme
plugin. It uses [Marko][marko] as the template engine. The following
configuration object may be supplied during phase 1 initialization:

```javascript
{
  marko: {
    writeToDisk: false,
    checkUpToDate: true
  }
}
```

Note: if you set `writeToDisk` to `true`, then the user running the server will
need write access to this module's `templates/{layouts,views}` directories.

[marko]: http://markojs.com/
[cs]: https://github.com/jscas/cas-server

## License

[MIT License](http://jsumners.mit-license.org/)
