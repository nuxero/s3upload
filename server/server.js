var express = require('express');
var AWS = require('aws-sdk');
var utils = require('./utils/utils');

var app = express();

app.use(express.static('public'));

app.get('/asset_upload', function(req, res) {
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
            res.send({
                signedUrl: url,
                url: u,
                fileId: fileId
            });
        });

    });
});


app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
