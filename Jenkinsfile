#!groovy

@Library('Divorce') _

buildNode {
  checkoutRepo()

  onPR {
    enforceVersionBump()
  }

  try {
    make 'install', name: 'Install Dependencies'
    make 'test-nsp', name: 'Security'

     stage('Unit test and coverage') {
     sh 'yarn test-coverage' 
    }

    stage('Sonar scanner') {
          onPR {
            sh 'yarn sonar-scanner -Dsonar.analysis.mode=preview -Dsonar.host.url=$SONARQUBE_URL'
          }

          onMaster {
           sh 'yarn sonar-scanner -Dsonar.host.url=$SONARQUBE_URL'
          }
        }

  } finally {
    make 'clean'
  }

  onMaster {
    publishNodePackage()
  }
}
