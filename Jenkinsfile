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
                            cd /home/orai/owallet
                            sudo git pull origin feat/refactor-theme
                            echo "DONE pull source code"
                    '''
                }

                sshagent(['phu-cloud']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -l orai $SERVER_IP -p 22129 <<EOF
                            cd /home/orai/owallet
                            pm2 restart owallet
                            echo "DONE restart process owallet"
                    '''
                }
            }
        }
    }
    post {
        success {
            discordSend description: 'Deployed owallet feat/refactor-theme', footer: '', image: '', link: '', result: '', thumbnail: '', title: '[owallet] [viettel]', webhookURL: 'https://discord.com/api/webhooks/987298208751427584/Nu2Bc6BS5llTmcZjT80q6lpUrzmgE0aA23B7-NmqTAvbMAeBZFNsiYaRMO3kv1cERCQj'
        }
    }
}
