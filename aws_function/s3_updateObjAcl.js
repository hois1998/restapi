//set if there is an error, return 0;
//and if objs acl are updated successfully, return 1;
const AWS = require('aws-sdk');
const path = require('path');
const BUCKET = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/bucket');
const { KEY, SECRET } = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/aws_config');

AWS.config.update({
    region: 'ap-northeast-2',
    accessKeyId: KEY,
    secretAccessKey: SECRET,
});

//S3 service object connected to default account s3
let s3 = new AWS.S3({apiVersion: '2006-03-01'});

//make Params which contain key to let the object set public read
let updatePublicParams = {
	Bucket: BUCKET,
	Key: '',
	ACL: 'public-read',
};

let updatePrivateParams = {
	Bucket: BUCKET,
	Key: '',
  ACL: 'private',
};


async function updateObjAcl(pubOrPri, fileLocation) {
  let listParams = {
  	Bucket: BUCKET,
  	Prefix: '/media' + fileLocation + '/'
  };

	//console.log(listParams.Prefix);

  let keys;	//to contain object keys of specific dir in s3
	let returnVal = 0;

  let isListObjExist = await s3.listObjects(listParams).promise()
    .then((data) => {
      keys = data.Contents.map(i => i.Key);

      if(keys.length == 0) {
        throw new Error(`no there is no file on the ${listParams.Prefix}`);
      }

      return true;
    })
    .catch(err => {
      console.log(err);
      return false;
    });

  if (!isListObjExist) {
    return 0;
  }

  let params = (pubOrPri === 'public') ? updatePublicParams : (pubOrPri === 'private' ? updatePrivateParams : 'error');

  if (params === 'error') {
    console.log('invalid pubOrPri, you must choose either \'public\' or \'private\'');
    return false;
  }

  for (let key of keys) {
    params.Key = key;

    let isEachObjAclUpdated = await s3.putObjectAcl(params).promise()
      .then(date => {
        console.log(path.basename(key)+"'s ALC is successfully updated as "+pubOrPri);
        return true;
      })
      .catch(err => {
        console.log(err);
        return false;
      });

    if (!isEachObjAclUpdated) {
      return 0;
    }
  }

  return 1;

}

module.exports = updateObjAcl;
