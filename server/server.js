var Hapi = require('hapi');
var AWS = require('aws-sdk');
var inert = require('inert');
var utils = require('./utils/utils');

console.log(utils);

const server = new Hapi.Server({
    debug: {
        request: ['info', 'error', 'received', 'auth', 'handler', 'response', 'request']
    }
});

server.connection({
    port: process.env.PORT || 3000
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{path*}',
        config: {
            handler: (request, reply, err) => {
                reply.file('public/index.html');
            }
        }
    });
    server.route({
        method: 'GET',
        path: '/build.js',
        config: {
            handler: (request, reply, err) => {
                reply.file('public/build.js');
            }
        }
    })
    server.route({
        method: 'GET',
        path: '/asset_upload',
        config: {
            handler: (request, reply, err) => {
                var s3 = new AWS.S3({
                    accessKeyId: utils.credentials.accessKeyId,
                    secretAccessKey: utils.credentials.secretAccessKey,
                    signatureVersion: "v4",
                    region: utils.credentials.region
                });
                var fileId = utils.generateRandomString(42);
                //Used for putObject
                var params = {
                    Bucket: utils.credentials.bucket,
                    Key: fileId,
                    ACL: 'public-read',
                    ServerSideEncryption: 'aws:kms'
                };
                //Used for getObject
                var getParams = {
                    Bucket: utils.credentials.bucket,
                    Key: fileId
                };
                s3.getSignedUrl('putObject', params, function(err, url) {
                    console.log("The URL is", url);
                    s3.getSignedUrl('getObject', getParams, function(e, u) {
                        console.log("The get URL is", u);
                        reply({
                            signedUrl: url,
                            url: u,
                            fileId: fileId
                        });
                    });

                });
            }
        }
    });

    server.start(function() {
        console.log('Server running at:', server.info.uri);
    });
});
