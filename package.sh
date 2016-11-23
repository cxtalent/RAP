 #!/bin/sh

build_react(){
	cd ${WORKSPACE}/framework-manage/src/main
	if [ -f node_modules.zip ]
	then
		yum install -y unzip && unzip -oq node_modules.zip && chmod +x node_modules/.bin/* && npm run deploy
	else
		npm i && npm run deploy
	fi
}

build_war(){
	cd ${WORKSPACE}
	mvn clean package -Dmaven.test.skip=true -e -U
}



build_war
