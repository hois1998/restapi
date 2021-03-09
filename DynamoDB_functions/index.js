'use strict';

const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const httpsRequest = require('request');
const config = require('./lib/config');
const multipart = require('parse-multipart');
const awsFFmpeg = require('ffmpeg-aws-lambda');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const downloader = require('s3-download-stream');
const mz = require('moment-timezone');
const envs = require('envs');

// Create S3 and dynamodb service object
AWS.config.update({ region: config.smtp_region });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const dynamodb = new AWS.DynamoDB({
	apiVersion: '2012-08-10',
});

let dynamodbDoc = new AWS.DynamoDB.DocumentClient({
	service: dynamodb
});

let DBPrefix = config.vss_prefix;
let APIAddress = `${config.vss_web_server}`;
let username = 'admin@xxxx.net';
let password = 'xxxxx1234';
let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

// video download_method : 0 => local download, 1 => url based
let download_method = 0;

/* Utils */
function mkdirRecursive(directory) {
    var dirname = path.dirname(directory);

    if (!fs.existsSync(dirname)) {
        mkdirRecursive(dirname);
    }

    if (!fs.existsSync(directory)) {
        debugError(directory);
        fs.mkdirSync(directory);
    }
}

function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function debugLog(data) {
	let envValue = envs('DEBUG_STATUS');

	if (envValue === 'ENABLE') {
		console.log(data);
	}
}

function debugError(data) {
	console.error(data);
}
/* Define functin to find and replace specified term with replacement string */
function replaceAll(str, term, replacement) {
	return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

/* File handle Library */
function storeFile (request, videoData) {
	return new Promise(function (resolve, reject) {
		debugLog('Start storeFile');
		let errMsg = '';
		if (videoData === undefined) {
			errMsg = 'Invalid param: param is null';
			debugLog(errMsg);
			reject(errMsg);
			return;
		}

		let buffer = new Buffer(videoData);

		fs.writeFile(request.localPath, buffer, function (err) {
			if (err) {
				debugLog('Failed the writing file');
				reject(err);
				return;
			}

			debugLog('Success the writing file');
			resolve(request);
		});
	})
}

function postProcessResource (resource, fn) {
    let ret = null;
    if (resource) {
        if (fn) {
            ret = fn(resource);
        }

        try {
            fs.unlinkSync(resource);
        } catch (err) {
			debugError("postProcessResource: " + err);
		}
    }

    return ret;
}

function createUUID () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16 % 16 | 0);
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    })

    debugLog(uuid);
    return uuid;
}

/* Extracting thumbnail Library */
function extractImage (thumbnailInfo, callback) {
	if (thumbnailInfo === undefined || thumbnailInfo === null || thumbnailInfo.length <= 0) {
		callback("Invalid parameter");
		return;
	}

	awsFFmpeg.ffmpeg()
	.then(function (ffmpegPath) {
		var cmd = '';
		var common_cmd = `${ffmpegPath} -i "${thumbnailInfo[0].filepath}" -y `;
		var variable_cmd = ' ';

		for (var ii in thumbnailInfo) {
			variable_cmd += `-s ${thumbnailInfo[0].resolution} -ss ${thumbnailInfo[ii].seconds} -vf "select='eq(pict_type,I)'" -vframes 1 -f image2 ${thumbnailInfo[ii].filename} `	
		}

		cmd = common_cmd + variable_cmd;
		debugLog('cmd: ' + cmd);
		return exec(cmd, function (err, stdout, stderr) {
			if (err) {
				debugLog('Failed to execute ffmpeg' + JSON.stringify(err));
				if (callback) {
					callback(err);
				}
			} else {
				callback(null);
			}
		});
	})
	.catch(function (err) {
		debugError('Failed to get ffmpeg path: ' + JSON.stringify(err));
		if (callback) {
			callback(err);
		}
	});	
}

function extractThumbnail (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start extractThumbnail');
		var errString = '';
		if (request === undefined || request === null || request.length <= 0) {
			errString = 'Invalid parameter';
			debugError(errString);
			reject(errString);
			return;
		}

		let thumbnailInfo = [];

		var tmpThumbRegular = {
			"filepath": request[0].video.localPath,
			"resolution": "320x240",
			"filename": request[0].thumbnail.localPath,
			"seconds": '0'
		};

		thumbnailInfo.push(tmpThumbRegular);
		mkdirRecursive(path.dirname(request[0].thumbnail.localPath));
		if (request[0].eventStatus) {
			var tmpThumbEvent = {
				"filename": request[0].eventThumbnail.localPath,
				"seconds": '5'
			}

			thumbnailInfo.push(tmpThumbEvent);
			mkdirRecursive(path.dirname(request[0].eventThumbnail.localPath));
		} 

		debugLog(thumbnailInfo);
		extractImage(thumbnailInfo, function (err) {
			if (err) {
				debugLog('Failed the extracting thumbnail: ' + JSON.stringify(thumbnailInfo));
				var ls = spawn('ls', ['-al', '/tmp']);
				ls.stdout.on('data', (data) => {
					debugLog(`stdout: ${data}`);
				});
				reject(err);
				return;
			} 

			request[0].thumbnail.fileSize = fs.statSync(request[0].thumbnail.localPath).size;
			if (request[0].eventStatus)
				request[0].eventThumbnail.fileSize = fs.statSync(request[0].eventThumbnail.localPath).size;

			resolve(request[0]);
		});
	});
}

function extractThumbnail2 (request, thumbnailType) {
	debugLog('Start extractThumbnail2');
	return new Promise(function (resolve, reject) {
		var errString = '';
		if (request === undefined || request === null || request.length <= 0) {
			errString = 'Invalid parameter';
			debugError(errString);
			reject(errString);
			return;
		}

		let thumbnailInfo = [];
		let tmpThumbRegular = {};
		let tmpThumbEvent = {};

		if (thumbnailType === 'regular') {
			tmpThumbRegular = {
				"filepath": request[0].video.localPath,
				"resolution": "320x240",
				"filename": request[0].thumbnail.localPath,
				"seconds": '0'
			};

			thumbnailInfo.push(tmpThumbRegular);
			mkdirRecursive(path.dirname(request[0].thumbnail.localPath));
		} else {
			tmpThumbRegular = {
				"filepath": request[0].video.localPath,
				"resolution": "320x240",
				"filename": request[0].eventThumbnail.localPath,
				"seconds": '5'
			};

			thumbnailInfo.push(tmpThumbRegular);
			mkdirRecursive(path.dirname(request[0].eventThumbnail.localPath));
		}

		debugLog(thumbnailInfo);

		extractImage(thumbnailInfo, function (err) {
			if (err) {
				debugLog('Failed the extracting thumbnail: ' + JSON.stringify(thumbnailInfo));
				var ls = spawn('ls', ['-al', '/tmp']);
				ls.stdout.on('data', (data) => {
					debugLog(`stdout: ${data}`);
				});
				reject(err);
				return;
			} 

			request[0].thumbnail.fileSize = fs.statSync(request[0].thumbnail.localPath).size;
			if (thumbnailType !== 'regular')
				request[0].eventThumbnail.fileSize = fs.statSync(request[0].eventThumbnail.localPath).size;

			resolve(request[0]);
		});
	});
}


/* S3 Library */
function getHeaderObject (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start getHeaderObject');
		let params = {
			'Bucket': request.bucket,
			'Key': request.video.s3Location
		};

		s3.headObject(params, function (err, data) {
			if (err) {
				debugError(err);
				reject(err);
				return;
			}

			debugLog(JSON.stringify(data));
			request['camID'] = JSON.parse(data.Metadata['cam-id']);
			request['recordType'] = JSON.parse(data.Metadata['record-type']);
			request['eventType'] = JSON.parse(data.Metadata['evt-type']);
			request['eventOption'] = JSON.parse(data.Metadata['evt-option']);
			request['recordedStartTime'] = JSON.parse(data.Metadata['start-timestamp']);
			request['recordedEndTime'] = JSON.parse(data.Metadata['end-timestamp']);
			request['recordedEvtTime'] = JSON.parse(data.Metadata['evt-timestamp']);
			request['expiredTime'] = Math.floor((parseInt(JSON.parse(data.Metadata['start-timestamp'])) + 30000) / 1000).toString();
			let num_recordedStartTime = parseInt(request['recordedStartTime']);
			let num_recordedEndTime = parseInt(request['recordedEndTime']);
			let num_recordedEvtTime = parseInt(request['recordedEvtTime']);

			let result = num_recordedEndTime - num_recordedStartTime;
			if (result > 30000) {
				debugLog('end time(' + num_recordedEndTime + ') - start time(' + num_recordedStartTime + ') = ' + result);
			}

			result = num_recordedEvtTime - num_recordedStartTime;
			if (result > 5000) {
				debugLog('event time(' + num_recordedEvtTime + ') - start time(' + num_recordedStartTime + ') = ' + result);
			}

			request['recordedEndTime'] = (num_recordedStartTime + 30000).toString();
			request['recordedEvtTime'] = (num_recordedStartTime + 5000).toString();

			debugLog(request['recordedEndTime'] + ' ' + request['recordedEvtTime']);

			// ET_MOTION_DETECTED
			// ET_SOUND_DETECTED
			// ET_TEMPER_DETECTED
			if (request['eventType'].toUpperCase().indexOf('_DETECTED') > 0) {
				request['eventStatus'] = true;
				request['eventThumbnail'].localPath = 
					`${request['eventThumbnail'].localPath}/${request['camID']}_${request['recordedEvtTime']}.jpg`;
				request['eventThumbnail'].s3Location = 
					`${request['eventThumbnail'].s3Location}/${request['camID']}_${request['recordedEvtTime']}.jpg`;
			}

			resolve(request);
		});	
	});
}

function getDownloadSignedUrl(request) {
	download_method = 1;
	return new Promise(function (resolve, reject) {
		debugLog('Start getDownloadSignedUrl');
		let errString = '';

		if (request === undefined) {
			errString = 'Invalid parameters: ' + JSON.stringify(request);
			debugError(errString);
			reject(errString);
			return;
		}

		let params = {
			'Bucket': request.bucket,
			'Key': request.video.s3Location
		};

		debugLog(params);
		s3.getSignedUrl('getObject', params, function (err, url) {
			if (err) {
				debugError(err);
				reject(err);
				return;
			}

			debugLog(url);
			request.video.localPath = url.replace('https', 'http');
			resolve(request);
		});
	});
}

function getVideoToS3 (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start getVideoToS3');
		let errString = '';
		if (request === undefined) {
			errString = 'Invalid parameters: ' + JSON.stringify(request);
			debugError(errString);
			reject(errString);
			return;
		}

		let stream = fs.createWriteStream(request.video.localPath);
		stream.on('close', function () {
			debugLog('Streaming is closed');
			resolve(request);
		});
/*
		s3.getObject({
			'Bucket': request.bucket,
			'Key': request.video.s3Location
		}).createReadStream().on('error', function (err) {
			debugLog('Failed the create Read Stream');
			reject(err);
		}).pipe(stream);
		*/
		let config = {
			client: s3,
			concurrency: 6,
			params: {
				'Bucket': request.bucket,
				'Key': request.video.s3Location
			}
		};

		downloader(config)
		.on('data', function (chunk) {
			debugLog('chunk size: ' + chunk.length);
		})
		.on('error', function (err) {
			debugLog('Failed the create Read Stream');
			reject(err);
		})
		.pipe(stream);
	});
}

function putVideoToS3 (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start putVideoToS3');
		fs.readFile(request.video.localPath, (err, fileStream) => {
			if (err) {
				debugLog('Failed to read file: ' + JSON.stringify(err));
				reject(err);
				return;
			}

			let binaryData = new Buffer(fileStream, 'binary');
			let params = {
				"Bucket": request.bucket,
				"Key": request.video.s3Location,
				"ServerSideEncryption": "AES256",
				"Body": binaryData
			};

			s3.putObject(params, (err, fileStream) => {
				if (err) {
					debugLog('Failed to put object in S3: ' + JSON.stringify(err));
					reject(err);
					return;
				}	

				debugLog('Success: putObject[' + request.video.s3Location + ']');
				resolve(request[0]);
			});
		});
	});
}

function putImageToS3 (request, eventType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start putImageToS3');
		let localFilepath = '';
		let s3Location = '';
	
		if (eventType === 'regular') {
			s3Location = request[0].thumbnail.s3Location;
			localFilepath = request[0].thumbnail.localPath;
		} else {
			s3Location = request[0].eventThumbnail.s3Location;
			localFilepath = request[0].eventThumbnail.localPath;
		}

		fs.readFile(localFilepath, (err, fileStream) => {
			if (err) {
				debugLog('Failed to read file: ' + JSON.stringify(err));
				reject(err);
			}

			let binaryData = new Buffer(fileStream, 'binary');
			let params = {
				"Bucket": request[0].bucket,
				"Key": s3Location,
				"ServerSideEncryption": "AES256",
				"Body": binaryData
			};

			s3.putObject(params, (err, fileStream) => {
				if (err) {
					debugLog('Failed to put object in S3: ' + JSON.stringify(err));
					reject(err);
					return;
				}

				debugLog('Success: putObject[' + s3Location + ']');
				resolve(request[0]);
			});
		});
	});
}

/* Dynamodb Library */
function putVideoRegularDynamodb (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start putVideoRegularDynamodb');
		let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
		let tablename = DBPrefix + 'recorded-regular-' + startName.toString();
		let params = {
			TableName: tablename,
			Item: {
				"camid": request[0].camID,
				"recordedstarttime": request[0].recordedStartTime,
				"recordedendtime": request[0].recordedEndTime,
				"expired_time": request[0].expiredTime,
				"file_size": request[0].video.fileSize,
				"mediatype": request[0].video.mediaType,
				"s3_location": request[0].video.s3Location
			}
		};

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put data in dynamodb: ' + JSON.stringify(params));
				reject(err);
				return;
			}

			debugLog('Success: put data in Dynamodb');
			resolve(request[0]);
		});
	});
}

function postVideoDynamodb (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start postRegularDynamodb');
		debugLog(request[0]);
		let params = {
			TableName: DBPrefix + 'regulars',
			Item: {
				'camid_type': `${request[0].camID}:${request[0].video.mediaType}`,
				'recorded_start_time': parseInt(request[0].recordedStartTime || 0),
				'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],			// 60 days
				'media_type': request[0].video.mediaType,
				'recorded_end_time': parseInt(request[0].recordedEndTime || 0),
				's3_location': request[0].video.s3Location,
				'expired_time': parseInt(request[0].expiredTime || 0),
				'file_size': parseInt(request[0].video.fileSize || 0)
			}
		};

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put video data in new dynamodb');
				reject(err);
				return;
			}

			debugLog('Success: put data in new Dynamodb');
			resolve(request[0]);
		});
	});
}

function putThumbnailRegularDynamodb (request, eventType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start putThumbnailRegularDynamodb');
		let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
		let tablename = DBPrefix + 'recorded-regular-' + startName.toString();
		let params = {};
		if (eventType === "regular") {
			params = {
				TableName: tablename,
				Item: {
					"camid": request[0].camID,
					"recordedstarttime": (parseInt(request[0].recordedStartTime || 0) - 1).toString(),
					"recordedendtime": (parseInt(request[0].recordedStartTime || 0) - 1).toString(),
					"expired_time": request[0].expiredTime,
					"file_size": request[0].thumbnail.fileSize,
					"mediatype": request[0].thumbnail.mediaType,
					"s3_location": request[0].thumbnail.s3Location
				}
			};
		} else {
			params = {
				TableName: tablename,
				Item: {
					"camid": request[0].camID,
					"recordedstarttime": request[0].recordedEvtTime,
					"recordedendtime": request[0].recordedEvtTime,
					"expired_time": request[0].expiredTime,
					"file_size": request[0].eventThumbnail.fileSize,
					"mediatype": request[0].eventThumbnail.mediaType,
					"s3_location": request[0].eventThumbnail.s3Location
				}
			};
		}

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put data in regular dynamodb: ' + JSON.stringify(params));
				reject(err);
				return;
			}

			debugLog('Success to put data in regular dynamodb: ' + eventType);
			resolve(request[0]);
		});
	});
}

function postThumbnailDynamodb (request, eventType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start postRegularDynamodb');
		let params = {
			TableName: DBPrefix + 'regulars'
		};

		if (eventType === "regular") {
			params['Item'] = {
				'camid_type': `${request[0].camID}:ET_REGULAR_THUMBNAIL`,
				'recorded_start_time': parseInt(request[0].recordedStartTime || 0),
				'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],			// 60 days
				'media_type': request[0].thumbnail.mediaType,
				'recored_end_time': parseInt(request[0].recordedStartTime || 0),
				's3_location': request[0].thumbnail.s3Location,
				'expired_time': parseInt(request[0].expiredTime || 0),
				'file_size': parseInt(request[0].thumbnail.fileSize || 0)
			};
		} else {
			params['Item'] = {
				'camid_type': `${request[0].camID}:${request[0].eventThumbnail.mediaType}`,
				'recorded_start_time': parseInt(request[0].recordedEvtTime || 0),
				'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],			// 60 days
				'media_type': request[0].eventThumbnail.mediaType,
				'recored_end_time': parseInt(request[0].recordedEvtTime || 0),
				's3_location': request[0].eventThumbnail.s3Location,
				'expired_time': parseInt(request[0].expiredTime || 0),
				'file_size': parseInt(request[0].eventThumbnail.fileSize || 0)
			};
		}

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put thumbnail data in new dynamodb');
				reject(err);
				return;
			}

			debugLog('Success: post data in new ' + eventType  + ' Dynamodb');
			resolve(request[0]);
		});
	});
}

function putEventDynamodb (request, eventType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start putEventDynamodb');
		let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
		let tablename = DBPrefix + 'recorded-event-' + startName.toString();
		let params = {};
		if (eventType === 'regular') {
			params = {
				TableName: tablename,
				Item: {
					"camid": request[0].camID,
					"recordedstarttime": (parseInt(request[0].recordedStartTime || 0) - 1).toString(),
					"recordedendtime": (parseInt(request[0].recordedStartTime || 0) - 1).toString(),
					"expired_time": request[0].expiredTime,
					"s3_thumbnail_location": request[0].thumbnail.s3Location,
					"evttype": "ET_REGULAR_THUMNAIL", 										//request[0].eventType,
					"evtdesc": request[0].eventOption === '' ? 'NULL' : request[0].eventOption,
					"event_priority": '0'
				}
			};
		} else {
			params = {
				TableName: tablename,
				Item: {
					"camid": request[0].camID,
					"recordedstarttime": request[0].recordedEvtTime,
					"recordedendtime": request[0].recordedEvtTime,
					"expired_time": request[0].expiredTime,
					"s3_thumbnail_location": request[0].eventThumbnail.s3Location,
					"evttype": request[0].eventType,
					"evtdesc": request[0].eventOption === '' ? 'NULL' : request[0].eventOption,
					"event_priority": '0'
				}
			};
		}

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put data in event dynamodb: ' + JSON.stringify(params));
				reject(err);
				return;
			}

			debugLog('Success to put data in event dynamodb: ' + eventType);
			resolve(request[0]);
		});
	});
}

function postEventDynamodb (request, eventType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start postEventDynamodb');
		let params = {
			TableName: DBPrefix + 'events'
		};

		var recordedEndTime = request[0].recordedEndTime;
		if (!recordedEndTime || recordedEndTime === 'NULL') 
			recordedEndTime = parseInt(request[0].recordedStartTime);

		var eventPriority = 0;

		if (eventType === "regular") {
			params['Item'] = {
				'camid_type': `${request[0].camID}:ET_REGULAR_THUMBNAIL`,
				'recorded_start_time': parseInt(request[0].recordedStartTime || 0),
				'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],			// 60 days
				'evt_desc': request[0].eventOption === '' ? 'NULL' : request[0].eventOption,
				'evt_type': "ET_REGULAR_THUMNAIL",
				'recored_end_time': recordedEndTime,
				's3_thumbnail_location': request[0].thumbnail.s3Location,
				'expired_time': parseInt(request[0].expiredTime || 0),
				'event_priority': eventPriority
			};
		} else {
			params['Item'] = {
				'camid_type': `${request[0].camID}:${request[0].eventType}`,
				'recorded_start_time': parseInt(request[0].recordedEvtTime || 0),
				'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],			// 60 days
				'evt_desc': request[0].eventOption === '' ? 'NULL' : request[0].eventOption,
				'evt_type': request[0].eventType,
				'recored_end_time': recordedEndTime,
				's3_thumbnail_location': request[0].eventThumbnail.s3Location,
				'expired_time': parseInt(request[0].expiredTime || 0),
				'event_priority': eventPriority
			};
		}

		debugLog(params);
		dynamodbDoc.put(params, function (err, data) {
			if (err) {
				debugLog('Failed to put thumbnail data in new dynamodb');
				reject(err);
				return;
			}

			debugLog('Success: post data in new ' + eventType + ' Event Dynamodb');
			resolve(request[0]);
		});
	});
}

function insertTimeline (request, type, uuid, mark_sec) {
	debugLog('Start insertTimeline');
	let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
	let params = {
		TableName: `${DBPrefix}timeline-info-${startName.toString()}`,
		Key: {
			'camid': request[0].camID,
			'uuid': uuid
		},
		UpdateExpression: 'set mark_sec = :mark_sec',
		ExpressionAttributeValues: {
			':mark_sec': mark_sec
		},
		ReturnValues: 'UPDATED_NEW'
	};


	dynamodbDoc.update(params, function (err, data) {
		if (err) {
			debugError('insertTimeline is failed: ' + err);
			return;
		}

		debugLog('Success insertTimeline');
	});
}

function updateTimeline (request, type, timestamp, mark_sec) {
	debugLog('Start updateTimeline');
	let params = {
		TableName: `${DBPrefix}timelines`,
		Key: {
			'camid_type': `${request[0].camID}:${type}`,
			'record_time': parseInt(timestamp)
		},
		UpdateExpression: 'set mark_sec = :mark_sec',
		ExpressionAttributeValues: {
			':mark_sec': mark_sec
		},
		ReturnValues: 'UPDATED_NEW'
	};

	debugLog(params);

	dynamodbDoc.update(params, function (err, data) {
		if (err) {
			debugError('updateTimeline is failed: ' + err);
			return;
		}

		debugLog('Success updateTimeline');
	});
}

function putTimeline (request, timestamp, type, uuid, mark_sec) {
	debugLog('Start putTimeline');
	let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
	let params = {
		TableName: `${DBPrefix}timeline-info-${startName.toString()}`,
		Item: {
			'camid': request[0].camID,
			'record_timestamp': timestamp.toString(),
			'record_type': type,
			'mark': '1',
			'mark_sec': mark_sec,
			'uuid': uuid,
			'expired_time': request[0].expiredTime
		}
	};

	debugLog(params);
	dynamodbDoc.put(params, function (err, data) {
		if (err) {
			debugLog('putTimeline is failed: ' + err);
			return;
		}

		debugLog('Success putTimeline');
	});
}

function postTimeline (request, timestamp, type, uuid, mark_sec) {
	debugLog('Start postTimeline');
	let params = {
		TableName: DBPrefix + 'timelines',
		Item: {
			'camid_type': `${request[0].camID}:${type}`,
			'record_time': timestamp,
			'ttl': Math.round(new Date().getTime() / 1000) + request[0]['TTL'],
			'record_type': type,
			'mark': '1',
			'uuid': uuid,
			'expired_time': parseInt(request[0].expired_time || 0)
		}
	};

	if (mark_sec) 
		params.Item.mark_sec = mark_sec;

	debugLog(params);
	dynamodbDoc.put(params, function (err, data) {
		if (err) {
			debugError('postTimeline is failed: ' + err);
			return;
		}

		debugLog('Success postTimeline');
	});
}

function setTimeline (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start setTimeline info');
		let errString = '';
		if (request === undefined || request === null || request.length <= 0) {
			errString = 'Invalid parameter';
			debugError(errString);
			reject(errString);
			return;
		}

		let uuid = createUUID();
		let currentTime = Math.floor((parseInt(request[0].recordedStartTime) + 0) / 1000);
		let reminder = currentTime % 60;
		let timestamp = currentTime - reminder;
		let startName = parseInt(request[0].recordedStartTime / 86400000) * 86400000;
		let expiredTime = request[0].expiredTime;
		let type = '1min';
		let markSec1 = [];
		let markSec2 = [];
		let count = 31;
		let markSec1Flag = false;
		let markSec2Flag = false;

		for (let i = 0; i < 60; i++) {
			markSec1[i] = '0';
			markSec2[i] = '0';
		}

		let params = {
			TableName: `${DBPrefix}timeline-info-${startName.toString()}`,
			KeyConditionExpression: 'camid = :id',
			FilterExpression: 'record_type = :type AND record_timestamp = :tstamp',
			ExpressionAttributeValues: {
				':id': request[0].camID,
				':tstamp': timestamp.toString(),
				':type': type
			}
		};

		debugLog(params);
		dynamodbDoc.query(params, function (err, data) {
			if (err) {
				debugLog(err);
				reject(err);
				return;
			}

			if (data.Count <= 0) {
				for (let i = reminder; i < 60; i++) {
					if (count == 0)
						break;

					markSec1Flag = true;
					markSec1[i] = '1';
					count--;
				}

				if (count > 0) {
					for (let i = 0; i < 60; i++) {
						if (count == 0)
							break;

						markSec2Flag = true;
						markSec2[i] = '1';
						count--;
					}
				}

				if (markSec1Flag) {
					markSec1 = parseInt(replaceAll(markSec1.toString(), ',', ''), 2).toString(16);
					if (markSec1.length < 15) {
						var padding = '';
						for (let i = 0; i < 15 - markSec1.length; i++) {
							padding += '0';
						}

						markSec1 = padding + markSec1;
					}
					debugLog('new data1 => ' + timestamp + ': ' + markSec1);
					putTimeline(request, timestamp, type, uuid, markSec1);
					postTimeline(request, timestamp, type, uuid, markSec1);
				}

				if (markSec2Flag) {
					timestamp = parseInt(timestamp) + 60;
					uuid = createUUID();
					markSec2 = parseInt(replaceAll(markSec2.toString(), ',', ''), 2).toString(16);
					debugLog('new data2 => ' + timestamp + ': ' + markSec2);
					putTimeline(request, timestamp, type, uuid, markSec2);
					postTimeline(request, timestamp, type, uuid, markSec2);
				}
			} else {
				let markSecHigh = '';
				let markSecLow = '';
				let markSecMargin = '';

				uuid = data.Items[0].uuid;
				timestamp = data.Items[0].record_timestamp;
				var tmpMarkSec1 = data.Items[0].mark_sec;

				markSecHigh = tmpMarkSec1.slice(0, 7);
				markSecLow = tmpMarkSec1.slice(7, 14);
				markSecMargin = tmpMarkSec1.slice(14,15);

				markSecHigh = parseInt(markSecHigh, 16).toString(2).split('');
				markSecLow = parseInt(markSecLow, 16).toString(2).split('');
				markSecMargin = parseInt(markSecMargin, 16).toString(2).split('');

				// zero padding
				for (let i = 0; i < 28; i++) {
					if (i >= 28 - markSecHigh.length)
						markSec1[i] = markSecHigh[i];
					else
						markSec1[i] = '0';
				}

				for (let i = 0; i < 28; i++) {
					if (i >= 28 - markSecLow.length) {
						markSec1[i + 28] = markSecLow[i - (28 - markSecLow.length)];
					}
					else
						markSec1[i + 28] = '0';
				}
		
				for (let i = 0; i < 4; i++) {
					if (i >= 4 - markSecMargin.length)
						markSec1[i + 56] = markSecMargin[i - (4 - markSecMargin.length)];
					else
						markSec1[i + 56] = '0';
				}
		
				for (let i = reminder; i < 60; i++) {
					if (count == 0)
						break;

					markSec1Flag = true;
					markSec1[i] = '1';
					count--;
				}

				if (count > 0) {
					for (let i = 0; i < 60; i++) {
						if (count == 0)
							break;

						markSec2Flag = true;
						markSec2[i] = '1';
						count--;
					}
				}

				if (markSec1Flag) {
					for (let i = 0; i < 60; i++) {
						if (i < 28) {
							markSecHigh[i] = markSec1[i];
						} else if (i >= 28 && i < 56){
							markSecLow[i - 28] = markSec1[i];
						} else {
							markSecMargin[i - 56] = markSec1[i];
						}
					}

					markSec1 = parseInt(replaceAll(markSecHigh.toString(), ',', ''), 2).toString(16) + 
						parseInt(replaceAll(markSecLow.toString(), ',', ''), 2).toString(16) + 
						parseInt(replaceAll(markSecMargin.toString(), ',',''), 2).toString(16);
					if (markSec1.length < 15) {
						var padding = '';
						for (let i = 0; i < 15 - markSec1.length; i++) {
							padding += '0';
						}

						markSec1 = padding + markSec1;
					}

					debugLog('updated data1 => ' + timestamp + ': ' + markSec1);
					insertTimeline(request, type, uuid, markSec1);
					updateTimeline(request, type, timestamp, markSec1);
				}

				if (markSec2Flag) {
					timestamp = parseInt(timestamp) + 60;
					uuid = createUUID();
					markSec2 = parseInt(replaceAll(markSec2.toString(), ',', ''), 2).toString(16);
					debugLog('updated data2 => ' + timestamp + ': ' + markSec2);
					putTimeline(request, timestamp, type, uuid, markSec2);
					postTimeline(request, timestamp, type, uuid, markSec2);
				}
			}

			debugLog('End set timeline info');
			resolve(request[0]);
		});
	});
}

function putEventPushInfo (request, currentTimestamp) {
	debugLog('start putEventPushInfo');
	let params = {
		TableName: DBPrefix + 'infos',
		Item: {
			'camid_info': `${request.camID}:push_info`,
			'event_timestamp': parseInt(request.recordedEvtTime),
			'noti_update_timestamp': currentTimestamp,
			'email_update_timestamp': currentTimestamp
		}
	};

	debugLog(params);
	dynamodbDoc.put(params, function (err, data) {
		if (err) {
			debugError('putEventPushInfo is failed' + err);
			return;
		}

		debugLog(data);
	})
}

function updateEventPushInfo (request, currentTimestamp, noti_type) {
	debugLog('start updateEventPushInfo');
	let params = {
		TableName: DBPrefix + 'infos',
		Key: {
			'camid_info': `${request.camID}:push_info`
		},
		UpdateExpression: 'set #fieldName = :currentTimestamp',
		ExpressionAttributeNames: {
			'#fieldName': `${noti_type}_update_timestamp`
		},
		ExpressionAttributeValues: {
			':currentTimestamp': currentTimestamp
		}
	};

	debugLog(params);
	dynamodbDoc.update(params, function (err, data) {
		if (err) {
			debugError('putEventPushInfo is failed' + err);
			return;
		}

		debugLog(data);
	})

}

function sendEventPush (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start sendEventPush');
		let params = {
			'event': request[0].eventType,
			'extra_info': request[0].eventOption,
			'badge': '0',
			'timestamp': request[0].recordedEvtTime
		};
		let data = JSON.stringify(params);

		// struct curl_slist *headers = NULL;
		// headers = curl_slist_append(headers, "Accept: application/json");
		// headers = curl_slist_append(headers, "Content-Type: application/json");
		// headers = curl_slist_append(headers, "charset: utf-8");
		// headers = curl_slist_append(headers, "Connection : close");

		let options = {
			url: `https://${APIAddress}/cameras/${request[0].camID}@${config.vss_control_server}/sns`,
			method: 'PUT',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'charset': 'utf-8',
				'Connection': 'close',
				'Content-Length': data.length
			},
			body: data
		};

		debugLog(options);

		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}
			
			debugLog(body);	
			resolve(request[0]);
		});
	});
}

function sendPushEvent (request, noti_type) {
	debugLog('Start sendPushEvent');
	let params = {
		'event': request.eventType,
		'extra_info': request.eventOption,
		'badge': '0',
		'timestamp': request.recordedEvtTime
	};

	if (noti_type === 'email') {
		params.bucket = request.bucket;
		params.thumbnail_loc = request.eventThumbnail.s3Location;
		params.gmt = mz.tz(request.timeZone).utcOffset() * 60;
	}

	let data = JSON.stringify(params);

	// struct curl_slist *headers = NULL;
	// headers = curl_slist_append(headers, "Accept: application/json");
	// headers = curl_slist_append(headers, "Content-Type: application/json");
	// headers = curl_slist_append(headers, "charset: utf-8");
	// headers = curl_slist_append(headers, "Connection : close");
	let options = {
		url: '',
		method: 'PUT',
		headers: {
			'Authorization': auth,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'charset': 'utf-8',
			'Connection': 'close',
			'Content-Length': data.length
		},
		body: data
	};

	if (noti_type === 'noti') {
		options.url = `https://${APIAddress}/cameras/${request.camID}@${config.vss_control_server}/sns`;
	} else {
		options.url = `https://${APIAddress}/cameras/${request.camID}@${config.vss_control_server}/sns/email`;
	}

	debugLog(options);
	httpsRequest(options, function (error, response, body) {
		if (error) {
			console.erro('sendPushEvent is failed: ' + error);
			return;
		}
		
		debugLog(body);	
	});
}

function checkEventPush (request, noti_type) {
	debugLog('Start checkEventPush');
	let currentTimestamp = new Date() / 1000 | 0;
	let searchTimestamp = 0;
	let params = {
		TableName: DBPrefix + 'infos',
		KeyConditionExpression: 'camid_info = :id_info',
		ExpressionAttributeValues: {
			':id_info': `${request.camID}:push_info`,
		}	
	};

	if (noti_type === 'noti') {
		searchTimestamp = currentTimestamp - (15 * 60);	// 15 minutes
	} else {
		searchTimestamp = currentTimestamp - (15 * 60 * 2);	// 30 minutes
	}

	debugLog(params);
	dynamodbDoc.query(params, function (err, data) {
		if (err) {
			debugLog('error: ' + err);
			return;
		}

		if (data.Count <= 0) {
			sendPushEvent(request, noti_type);
			putEventPushInfo(request, currentTimestamp, noti_type);
		} else {
			if (data.Items[0][`${noti_type}_update_timestamp`] === undefined) {
				putEventPushInfo(request, currentTimestamp, noti_type);
			} else if (data.Items[0][`${noti_type}_update_timestamp`] <= searchTimestamp) {
				sendPushEvent(request, noti_type);
				updateEventPushInfo(request, currentTimestamp, noti_type);
			} else {
				debugLog(data.Items[0][`${noti_type}_update_timestamp`]);
			}
		}
	})
}

function getLicenseV2 (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start getLicenseV2');
		let options = {
			url: `https://${APIAddress}/cameras/${request[0].camID}/v2`,
			method: 'GET',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
			}
		}

		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}
	
			if (body)  {
				let jsonBody = JSON.parse(body);
				if (jsonBody.license_status === 'Y') {
					var plan_value = jsonBody.license.plan.value;
					request[0]['TTL'] = parseInt(plan_value) * 24 * 60 * 60;
				}
				request[0]['timeZone'] = jsonBody.time_zone;
			}

			resolve(request[0]);
		});
	});
}

function updateEventThumbnail (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start updateEventThumbnail');
		let params = {
			'thumbnail_s3_location': request[0].eventThumbnail.s3Location
		};

		let data = JSON.stringify(params);
		let options = {
			url: `https://${APIAddress}/cameras/${request[0].camID}/configurations`,
			method: 'PUT',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'charset': 'utf-8',
				'Connection': 'close',
				'Accept': 'application/json',
				'Content-Length': data.length
			},
			body: data
		};
		
		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}
	
			debugLog('thumbnail_update: ' + body);
			resolve(request[0]);
		});
	});
}

function getRecordStatus (request, camID) {
	return new Promise(function (resolve, reject) {
		debugLog('Start getRecordStatus');
		let options = {
			url: `https://${APIAddress}/cameras/${camID}/recording-status`,
			method: 'GET',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'user-agent': 'lambda'
			}
		};

		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}

			if (response && response.statusCode != 200) {
				debugError('Response is error: ' + response);
				reject(response);
				return;
			}

			if (body) {
				let parseBody = JSON.parse(body);
				if (parseBody.result.status === 'N') {
					debugLog('Recording is OFF');
					reject('Normal record OFF');
					return;
				}
			}
			resolve(request);
		});
	});
}

function postTrafficInfo (request) {
	return new Promise(function (resolve, reject) {
		debugLog('Start postTrafficInfo');
		let params = {
			'camera_id': request[0].camID,
			'connect_type': 'streaming',
			'traffic': request[0].video.fileSize
		};

		let data = JSON.stringify(params);
		let options = {
			url: `https://${APIAddress}/api/streaming/camera/usage`,
			method: 'POST',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'charset': 'utf-8',
				'Connection': 'close',
				'Accept': 'application/json',
				'Content-Length': data.length
			},
			body: data
		};
		
		debugLog(options);
		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}
	
			debugLog(body);
			resolve(request[0]);
		});
	});
}

function postRecordedMedia (request, eventType, mediaType) {
	return new Promise(function (resolve, reject) {
		debugLog('Start postRecordedMedia');
		let etValue = '';
		let mlValue = '';
		let msValue = 0;

		if (mediaType === 'jpeg') {
			// media type is jpeg
			if (eventType === 'regular') {
				// event type is regular
				etValue = 'ET_REGULAR_THUMBNAIL';
				mlValue = request[0].thumbnail.s3Location;
				msValue = request[0].thumbnail.fileSize;
			} else {
				// event type is event
				etValue = request[0].eventType;
				mlValue = request[0].eventThumbnail.s3Location;
				msValue = request[0].eventThumbnail.fileSize;
			}
		} else {
			// media type is video and regular
			if (eventType === 'regular') {
				etValue = 'ET_REGULAR_VIDEO';
				mlValue = request[0].video.s3Location;
				msValue = request[0].video.fileSize;
			}
		}

		let params = {
			'event_type': etValue,
			'recorded_start_dtm': parseInt(request[0].recordedStartTime || 0),
			'recorded_end_dtm': parseInt(request[0].recordedEndTime || 0),
			'expired_dtm': parseInt(request[0].expiredTime || 0),
			'media_type': mediaType,
			'media_location': mlValue,
			'media_size': msValue
		};

		let data = JSON.stringify(params);
		let options = {
			url: `https://${APIAddress}/cameras/${request[0].camID}/medias`,
			method: 'POST',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'charset': 'utf-8',
				'Connection': 'close',
				'Accept': 'application/json',
				'Content-Length': data.length
			},
			body: data
		};
		
		debugLog(options);
		httpsRequest(options, function (error, response, body) {
			if (error) {
				reject(error);
				return;
			}
	
			debugLog(body);
			resolve(request[0]);
		});
	});
}

function ret (request) {
	return new Promise(function (resolve, reject) {
		resolve(request[0]);
	});
}

/*
 * event parameters:
 * camID,
 * videoData,
 * eventType,
 * recordedStartTime,
 * recordedEndTime,
 * expiredTime,
 * filesize,
 * filename
 */
exports.handler = (event, context, callback) => {
	var msg = '';
	debugLog(JSON.stringify(event));
	if (event === undefined || event.Records[0] === undefined) {
		msg = 'Invalid param: Param is null';
		debugError(msg);
		callback(msg, null);
		return;
	}

	let messages = '';
	if (event.Records[0].Sns !== undefined) {
		debugLog("This is Sns message");
		try {
			messages = JSON.parse(event.Records[0].Sns.Message);
		} catch (err) {
			debugError(err);
			callback(err, null);
			return;
		}
	} else if (event.Records[0].s3 !== undefined) {
		debugLog("This is s3 message");
		messages = event;
	} else {
		msg = 'Invalid param: Param is null';
		debugError(msg);
		callback(msg, null);
		return;
	}

	let objectData = messages.Records[0].s3.object;
	let bucketData = messages.Records[0].s3.bucket;
	
	let videoFilenameWithExt = path.basename(objectData.key);
	if (videoFilenameWithExt.indexOf('.mp4') < 0) {
		debugError('This is not mp4 file: ' + videoFilenameWithExt);
		callback(null, 'This is not mp4 file');
		return;
	}

	let videoFilename = path.basename(objectData.key, '.mp4');
	let localVideoPath = '/tmp/download/' + path.dirname(objectData.key);
	let localThumbPath = '/tmp/upload/' + path.dirname(objectData.key);
	let camID = 'dh_'+ videoFilename.split('_')[1];

	let req = {
		'camID': '',				// JID
		'recordType': '',			// regular, event
		'recordType2': '',			// 1min, 10min, 1day
		'eventType': '',			// ET_MOTION_DETECT / ET_SOUND_DETECT / etc ....
		'eventStatus': false,
		'eventOption': '',
		'recordedStartTime': '',
		'recordedEndTime': '',
		'recordedEvtTime': '',		// Event time: When continue recording, event time.
		'expiredTime': '',
		'TTL': 1 * 24 * 60 * 60,	// 1 day (default: free service)
		'bucket': bucketData.name,
		'video': {
			'fileSize': objectData.size,
			'mediaType': 'video',
			's3Location': objectData.key,
			'localPath': `${localVideoPath}/${videoFilenameWithExt}`
		},
		'thumbnail': {
			'fileSize': 0,
			'mediaType': 'jpeg',
			's3Location': path.dirname(objectData.key) + '/' + videoFilename + '.jpg',
			'localPath': `${localThumbPath}/${videoFilename}.jpg`,
		},
		'eventThumbnail': {
			'fileSize': 0,
			'mediaType': 'jpeg',
			's3Location': path.dirname(objectData.key),
			'localPath': localThumbPath
		}
	};

	mkdirRecursive(path.dirname(req.video.localPath));
	getRecordStatus(req, camID)
	.then((request) => Promise.all([
		getDownloadSignedUrl(request),
//		getVideoToS3(request),
		getHeaderObject(request)
	])).then((request) => Promise.all([
		getLicenseV2(request),
		extractThumbnail2(request, 'regular'),
		putVideoRegularDynamodb(request),
		postVideoDynamodb(request),
		postRecordedMedia(request, 'regular', request[0].video.mediaType)
//		postTrafficInfo(request)
	])).then((request) => Promise.all([
		setTimeline(request),
		putImageToS3(request, 'regular'),
		putThumbnailRegularDynamodb(request, 'regular'),
		postThumbnailDynamodb(request, 'regular'),
		putEventDynamodb(request, 'regular'),
		postEventDynamodb(request, 'regular'),
		postRecordedMedia(request, 'regular', request[0].thumbnail.mediaType),
		request[0].eventStatus ? extractThumbnail2(request, 'event') : ret(request)
	])).then((request) => Promise.all([
		request[0].eventStatus ? putImageToS3(request, 'event') : ret(request),
		request[0].eventStatus ? putThumbnailRegularDynamodb(request, 'event') : ret(request),
		request[0].eventStatus ? postThumbnailDynamodb(request, 'event') : ret(request),
		request[0].eventStatus ? putEventDynamodb(request, 'event') : ret(request),
		request[0].eventStatus ? postEventDynamodb(request, 'event') : ret(request),
//		request[0].eventStatus ? checkEventPush(request) : ret(request),
		request[0].eventStatus ? updateEventThumbnail(request) : ret(request),
		request[0].eventStatus ? postRecordedMedia(request, 'event', request[0].eventThumbnail.mediaType) : ret(request)
	])).then((request) => {
		debugLog(request[0]);
		if (request[0].eventStatus) {
			checkEventPush(request[0], 'noti');
			checkEventPush(request[0], 'email');
			postProcessResource(request[0].thumbnail.eventLocalPath, null);
		}
		debugLog('Test1');
		if (download_method === 0) postProcessResource(request[0].video.localPath, null);
		debugLog('Test2');
		postProcessResource(request[0].thumbnail.localPath, null);
		debugLog('Test3');
		callback(null, request[0]);	
		return;
	}).catch(function (err) {
		debugLog(err); 
		callback(err, null);	
		return;
	});
};

/* For test */
/*
let testRequest = {
	'camID': '',
	'eventType': '',
	'recordedStartTime': '',
	'recordedEndTime': '',
	'expiredTime': '',
	'bucket': 'deploy.xxxure.net',
	'video': {
		'fileSize': 1948464,
		'mediaType': 'video',
		's3Location': 'test/dh_1m01dc5paa00024_1509430786407.mp4',
		'localPath': '/tmp/download/dh_1m01dc5paa00024_1509430786407.mp4'
	},
	'thumbnail': {
		'fileSize': 0,
		'mediaType': 'jpeg',
		's3Location': 'test/dh_1m01dc5paa00024_1509430786407.jpg',
		'localPath': '/tmp/upload/dh_1m01dc5paa00024_1509430786407.jpg'
	}
};

getHeaderObject(testRequest)
.then((request) => getVideoToS3 (request))
.then((request) => extractThumbnail(request))
.then((request) => putImageToS3(request))
.then((request) => Promise.all([putVideoRegularDynamodb (request), 
	putThumbnailRegularDynamodb (request)]))
.then((request) => {
	postProcessResource(request.video.locaPath);
	postProcessResource(request.thumbnail.localPath);
})
.catch(function (err) {
	debugLog(err);
});
*/
