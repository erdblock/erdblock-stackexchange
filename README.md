# erdblock-stackexchange

## Description
Shows user statics of a StackExchange site like StackOverflow.


## Config
| Name           | Description  | Values |
| -------------- | ------------- | ----- |
| `user_id`        | The User ID, can be found in the Profile Link | `3507867` |
| `site`           | The Name of the StackExchange Site | `StackOverflow` |


## Example
````javascript
var stackexchange = require("erdblock-stackexchange")()
stackexchange.locals.config.user_id.setValue("3507867")
stackexchange.locals.config.site.setValue("stackoverflow")
erdblock.addPlugin(stackexchange);
````


## TODO
Add more Icons from http://stackexchange.com/sites
