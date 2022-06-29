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
                        ssh -o StrictHostKeyChecking=no -l root $SERVER_IP -p 22129 <<EOF
                            cd /home/orai/owallet
                            git pull origin develop
                    '''
                }
            }
        }
    }
    post {
        success {
            mail bcc: '', body: 'Build successfully!', cc: '', from: '', replyTo: '', subject: '[Ci/cd] Owallet build bundle file', to: 'phu.tx@orai.io'
        }
    }
}
