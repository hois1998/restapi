위 프로젝트는 서울대학교 연합전공 인공지능반도체공학에서 진행한 '원격시험감독'프로젝트이다. 2020-09월 부터 2021-02까지 원격시험감독 학부인턴을 진행하며 수행했던
"학생과 감독관 사이 실시간 멀티미디어 스트리밍을 통한 원격시험감독 플렛폼 제작: RTMP와 AWS서비스를 통해"에 대한 서버 측의 RESTapi와 rtmp 관련 code이다. 

![원격시험감독_구조도](https://user-images.githubusercontent.com/62315211/110482046-921ec900-812b-11eb-823b-2f6dfbd1d632.jpg)

그리고 해당 인턴활동을 수행하며 정리한 파일에 대해서는 아래의 공유 링크를 통해 볼 수 있다.

	https://mysnu-my.sharepoint.com/:o:/g/personal/hois1998_seoul_ac_kr/EhMdaPVLG7dIrN7SI_rrkmkBTe8Q0kbJ8qRg3fWIbfEvnA

코드 중  대해 부가적인 설명을 추가하면 다음과 같다.

기본적으로 데이터데이스에 저장되는 데이터는 크게 영상메타데이터와 유저정보관련 메타테이터가 존재한다. 
1. DynamoDB_functions
영상데이터를 prime key과 sort key를 갖고 정하는 것과 관련된 코드이다.

2. nginx_source_file_and_confFile
nginx를 활용한 rtmp서버 관련 설정파일인 nginx.conf와 nginx 소스파일 rtmp모듈 소스파일이 들어있다.

3. routes
restapi서버와 관련된 코드이다. 

4. mysql_function
유저의 메타데이터를 저장하는 mysql와 서버를 연결하는 것과 관련된 코드이다.

5. s3Function
s3의 정책을 업데이트에 감독관의 영상 정보 접속을 허용/거부를 조정하는 것과 관련된 코드이다. 
