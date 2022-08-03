pipeline {
    agent any

    environment {
        SERVER_IP = credentials('VIETTEL_IP_SERVER')
    }

    stages {
        stage('Ssh and deploy') {
            steps {
                sshagent(['phu-cloud']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -l phutx $SERVER_IP -p 22129 <<EOF
                            cd /mnt/volume_nyc3_03/owallet
                            sudo git pull origin develop
                            echo "DONE pull source code"
                    '''
                }

                sshagent(['phu-cloud']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -l orai $SERVER_IP -p 22129 <<EOF
                            cd /mnt/volume_nyc3_03/owallet
                            yarn
                            yarn build:libs
                            cd packages/extension
                            yarn 
                            yarn build
                            zip -r /mnt/volume_nyc3_03/oraiscan-backend/static/prod_${env.BUILD_ID}_${env.BUILD_NUMBER}.zip prod/
                            echo "DONE build artifact"
                    '''
                }
            }
        }
    }
    post {
        success {
            discordSend description: 'Build new artifact in url: https://do2.scan.orai.io/prod_${env.BUILD_ID}_${env.BUILD_NUMBER}.zip', footer: '', image: '', link: '', result: '', thumbnail: '', title: '[extension-artifact] [viettel]', webhookURL: 'https://discord.com/api/webhooks/987298208751427584/Nu2Bc6BS5llTmcZjT80q6lpUrzmgE0aA23B7-NmqTAvbMAeBZFNsiYaRMO3kv1cERCQj'
        }
    }
}
