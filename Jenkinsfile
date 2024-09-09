pipeline {
    agent any
    triggers {
        githubPush()
    }

    stages {

        stage('Deliver') {
            steps {
                sh 'npm install'
            }
        }
    }

}