# Overview
Executes npm i module_name in a docker container and returns file system changes

Example Usage
```
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var getChanges = require('./index.js');

getChanges(docker, 'node', 'helmet', function (err, changes) {
    console.log(changes);
});
```

Returned changes object includes the following keys, which are each an array of files that were added, modified or deleted.
- modified
- added
- deleted


## Options
getChanges requires the following options

docker - connection to dockerode
image - name of the image that you want to run npm i module against
module_name - can be a module_name or module_name@version
callback - function with the signature (err, changes)


## scripts
To clean up after ourselves we have a scripts/cleanup.sh that will remove images that are lingering. May or may not be useful.
