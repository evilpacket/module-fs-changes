/*
docker = dockerode instance
image = "node"
module = module_name or module_name@version
*/
var getChanges = function (docker, image, module, callback) {

    var command = ['npm', 'i', module];

    docker.run(image, command, false, function (err, runData, container) {

        if (err) { 
            return callback(err);
        }

        container.changes(function (err, data) {

            if (err) {
                return callback(err);
            }
           
            var results = {
                raw: data,
                modified: [],
                added: [],
                deleted: []
            }

            data.forEach(function (change) {
                //Kind 0 = Modified / Accessed?
                //Kind 1 = Add
                //Kind 2 = Delete
                if (change.Kind === 0) {
                    return results.modified.push(change.Path);
                }
                if (change.Kind === 1) {
                    return results.added.push(change.Path);
                }
                if (change.Kind === 2) {
                    return results.deleted.push(change.Path);
                }
            });

            return callback(err, {changes: results, container: container.id, statusCode: runData.StatusCode});
        });

    }).on('container', function (container) {
        var timeout = 60000 * 2;
        var dockerTimeout = function () {
            container.inspect(function (err, data) {
                if (data) {
                    if (data.State.StartedAt === '0001-01-01T00:00:00Z') {
                        return setTimeout(dockerTimeout, 1000);
                    }

                    if (data.State.Running) {
                        var startedAt = new Date(data.State.StartedAt);
                        var diff = new Date() - startedAt;
                        if (diff >= timeout) {
                            console.error('TIMEOUT: ' +  data.Config.Cmd[2]);
                            // Stop container
                            return docker.getContainer(data.Id).stop(function () {
                            });
                        }
                        setTimeout(dockerTimeout, 1000);
                    }
                } else {
                    setTimeout(dockerTimeout, 1000);
                }
            });
        }

        dockerTimeout();
    });

}

module.exports = getChanges
