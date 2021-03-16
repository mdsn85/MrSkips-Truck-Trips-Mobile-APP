pipeline {
   agent any
      environment {
        // PATH='/usr/local/bin:/usr/bin:/bin'
        PATH='C:/Users/mdsn8'
      }
   stages {

    stage('NPM Setup') {
        steps {
            sh 'npm install'
        }
    }



   stage('Android Build') {
        steps {
            sh 'ionic cordova build android --prod --release'
        }
   }

   stage('APK Sign') {
        steps {
            sh 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore platforms/android/app/build/outputs/apk/release/my-release-key.jks 
            platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias'
        }
        step{
            sh 'zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk MrSkips.apk'
        }
        step{
            sh 'apksigner verify MrSkips.apk'
        }
   }







  }
}