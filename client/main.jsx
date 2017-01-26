var React = require('react');
var ReactDOM = require('react-dom');
var ReactS3Uploader = require('react-s3-uploader');

ReactDOM.render(
  <ReactS3Uploader
    signingUrl="/asset_upload"
    signingUrlMethod="GET"
    contentDisposition="auto"
    scrubFilename={(filename) => filename.replace(/[^\w\d_\-\.]+/ig, '')} />,
  document.getElementById('app')
);
