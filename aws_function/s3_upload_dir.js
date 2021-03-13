const fs = require('fs');
const path = require('path');
const async = require('async');
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');

const BUCKET = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/bucket');
const { KEY, SECRET } = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/aws_config');
const rootFolder = path.resolve(__dirname, './');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  accessKeyId: KEY,
  secretAccessKey: SECRET,
});

function getFiles(dirPath) {
  //although readdir is Promise instance and [] is not, it is okay for using await syntax in fornt of non Promise instance. see line 34
  return fs.existsSync(dirPath) ? readdir(dirPath) : [];
}

async function s3_upload_dir(uploadFolder) {
  if (!BUCKET || !KEY || !SECRET) {
    throw new Error('s3_upload_dir.js\n you must provide env. variables: [BUCKET, KEY, SECRET]');
  }

  console.log('\n\n\nuploadFolder is ', uploadFolder);
  //console.log(__dirname);	// /home/ubuntu/awsSdk_youngho
  // upload == uploadFolder == /media/20210109/aaa
  //console.log(path.resolve(upload));

  const filesToUpload = await getFiles(uploadFolder);
  //console.log(filesToUpload);
  if (filesToUpload.length === 0) {
    throw new Error('s3_upload_dir.js\n wrong uploadFolder or no video recorded')
  }

  return new Promise((resolve, reject) => {
    //second arg. of async.eachOfLimit is limit. I change limit from 10 to 1 cause number of students taking exam may 30~200 which mean 200 async at a time and cpu usage may be overloaded
    async.eachOfLimit(filesToUpload, 2, async.asyncify(async (file) => {
	    const Key = file; 
      console.log(`uploading: [${Key}]`);

      return new Promise((res, rej) => {
        s3.upload({
          Key: Key,
          Bucket: BUCKET,
          Body: fs.readFileSync(file), //
        }, (err) => {
          if (err) {
            return rej(new Error(err));
          }
          res({ result: true });
        });
      });
    }), (err) => {
      if (err) {
        return reject(new Error(err));
      }
      resolve({ result: true });
    });
  }).catch(err => err);
}


module.exports = s3_upload_dir;
