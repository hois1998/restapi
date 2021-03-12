const AWS = require('aws-sdk');

const { BUCKET, KEY, SECRET } = {BUCKET: "...", KEY: "...", SECRET: "..."};

AWS.config.update({
	region: 'ap-northeast-2',
    accessKeyId: KEY,
    secretAccessKey: SECRET,
});

//S3 service object connected to default account s3
let s3 = new AWS.S3({apiVersion: '2006-03-01'});

//call s3 to upload specific file to specific bucket
let uploadParams = {Bucket: '...', Key: '', Body:''};

var ipPolicy = {
  Version: "2012-10-17", 
  Id: "sourceIp",
  Statement: [
	{ 
		Sid: "sourceIpStatement",
		Effect: "Deny",
		Principal: "*", 
		Action: "s3:getObject",
		Resource: "arn:aws:s3:::" + BUCKET + "/*",
		Condition: {
			NotIpAddress: {
				"aws:SourceIp": [
					""
				]
			}
		}
	}
  ]
 };

//?„ì‹œë¡??¬ìš©?˜ëŠ” ipì£¼ì†Œ 
var ip = process.argv[2];

let getBucketParams = {Bucket: BUCKET};

console.log('do');
s3.getBucketPolicy(getBucketParams, function(err, data) {
	if (err) console.log("get Error", err);
	else if (data) {
		console.log(JSON.parse(data.Policy));
		let existingNotIpAddress = JSON.parse(data.Policy).Statement[0].Condition.NotIpAddress["aws:SourceIp"];
		//console.log(existingNotIpAddress);
		existingNotIpAddress.push(ip+"/32");
		let newNotIpAddress = existingNotIpAddress;

		//console.log(newNotIpAddress);
		ipPolicy.Statement[0].Condition.NotIpAddress["aws:SourceIp"] = newNotIpAddress;
		let bucketPolicyParams = {Bucket: BUCKET, Policy: JSON.stringify(ipPolicy)};
		s3.putBucketPolicy(bucketPolicyParams, function(err, data) {
			 if (err) console.log("ERROR", err); // an error occurred
			 else     console.log("SUCCESS", data);           // successful response
		});
	}
});


