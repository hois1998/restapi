#! /bin/sh

nowDate=$(date +%Y%m%d)
name=${1}
lecture=${2}
time=${3}
supervNum=${4}
dirName="/media/${nowDate}/${lecture}/${time}/${supervNum}/${name}/"

node /home/ubuntu/awsSdk_youngho/temp_s3_upload_dir.js ${dirName} >> /var/hls/on_upload.log 2>&1

if [ -d ${dirName} ] ; then
	rm -rf ${dirName} 
	echo "rm is executed" >> /var/hls/on_upload.log 2>&1
fi

echo "all works  of on_upload.sh are finished!" >> /var/hls/on_upload.log 2>&1
