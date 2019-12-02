# BADASS
Badgeless Access - "Badass", facial recognition proof of concept. Please note, it's just a demo and is not intended for production use!

# Architecture
This project is built with AWS SAM (Serverless Application Model) with Rekognition, API Gateway, DynamoDB and Lambda, and the frontend is built with NativeScript.

# Setup
## Create Rekognition Face Index (Collection)
For this purposes you'll need AWS CLI installed and configured. As an option, Cloud9 environment can be used:
`aws rekognition create-collection --region "eu-central-1" --collection-id badass-faces`

## Deploy the backend
1. You will need the latest SAM CLI installed. If you are using Cloud9 please make sure the latest SAM CLI is installed [Random Link](https://jun711.github.io/aws/steps-to-update-aws-cloud9-sam-cli-to-latest-version/)
2. Navigate to `/backend` and build the backend `sam build`. 
Next deploy the backend `sam deploy` (optionally `sam deploy --guided` is you have a different region or different collection name), if needed type the collection ID created in the previous steps.
3. In few minutes backend should be up and running. 
3. Open AWS Console, navigate to API Gateway and find your API. Go to stages and copy the URL of Prod stage, you need to paste it into the mobile apps.

# Running mobile applications
For more information please consult with NativeScript documentation.
## Setting up NativeScript CLI
1. For the demo purposes you don't need any iOS or Android SDKs. All you need is Node (10.x or 12.x) and install the native script CLI `npm i -g nativescript`. 
2. Please navigate to AppStore or GooglePlay to install `Nativescript Playground` and `Nativescript Preview`.
## Run Admin application
1. Navigate to `mobile-admin` and locate HelloWorld.vue in app/component. Update `const url = ` with API Gateway Prod URL with tailing `/admin/`.
2. From the root of `mobile-admin` run `npm install` (needed only once) and then `tns preview`. It may take few minutes to download all the dependencies.
3. Open on your device Nativescript Playground and scan the QR code that appeared in the terminal. In a minute or less it will start Nativescript Preview app with admin application running.
4. Type the name and make the photo. Once photo is made, it will send request to the server and print the output on the same view under the button.

## Run Gate application.
1. Navigate to `mobile-gate` and locate HelloWorld.vue in app/component. Update `const url = ` with API Gateway Prod URL with tailing `/gate/`.
2. From the root of `mobile-gate` run `npm install` (needed only once). Because of the bug in the text-to-speech nativescript plugin [some details](https://github.com/bradmartin/nativescript-texttospeech/issues/18), you need to make a quick hack. Go to /node-modules/nativescript-texttospeech/texttospeech.io.js and delete the first line containing `"use strict";`.
3. Then `tns preview` from the root of `mobile-gate`. It will show the new QR code in the terminal.
4. Open on your device Nativescript Playground and scan the QR code that appeared in the terminal. In a minute or less it will start Nativescript Preview app with admin application running. IF you see the old admin app, wait for another minute or take another device.
5. Make the photo. Once photo is made, it will send request to the server and print the output on the same view under the button. It should also pronounce "Helo <name>". If it doesn't pronouce, try again ... 