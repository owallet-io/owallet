pipeline {
    agent any

    environment {
        SERVER_IP = credentials('DO_SENTRY2')
    }

    stages {
        stage('Ssh and deploy') {
            steps {
                sshagent(['phu-cloud']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -l root $SERVER_IP <<EOF
                            sh /root/owallet.sh
                    '''
                }
            }
        }
    }
    post {
        success {
            mail bcc: '', body: 'Build successfully!', cc: 'son.lha@orai.io', from: '', replyTo: '', subject: '[Ci/cd] Owallet build bundle file', to: 'phu.tx@orai.io'
        }
    }
}
