<template>
	<Page class="page">
		<ActionBar title="GATE" class="action-bar" />
        <StackLayout>
            <Button :text="textPicture" class="btn btn-primary" marginTop="20" @tap="takePicture"></Button>
            <Label :text="nameResult" class="h1" textWrap="true" ></Label>
            <Image :src="pictureFromCamera"></Image> 
        </StackLayout>
	</Page>
</template>

<script>
import * as camera from "../nativescript-camera";
import * as http from "http";
import * as imageSource from "image-source";
import * as  enumsModule  from 'ui/enums';
// import * as tts from 'nativescript-texttospeech';
import { TNSTextToSpeech, SpeakOptions } from 'nativescript-texttospeech';

let tts = new TNSTextToSpeech();

const format = enumsModule.ImageFormat.jpeg
const url = "https://XXXXXXXXXXX.execute-api.eu-central-1.amazonaws.com/Prod/gate/";

export default {
    data() {
        return {
            pictureFromCamera: null,
            textPicture: "Take a Picture",
            nameResult: "take a picture ... "
        };
    },
    methods: {
        takePicture() {
            // See the options at https://github.com/NativeScript/nativescript-camera#using-the-options-to-take-memory-efficient-picture
            // for more information on how to customize the pictures you take.
            camera
                .takePicture({ width: 300, height: 300, keepAspectRatio: true , cameraFacing: "front" })
                .then(imageAsset => {
                    this.pictureFromCamera = imageAsset;
                    this.nameResult =  "Authenticating ..."

                    const source = new imageSource.ImageSource();
                    console.log("fetching image ... ")
                    source.fromAsset(imageAsset).then((result) => {
                        try {
                            let base64String = result.toBase64String(format)
                            return this.sendImages1(base64String);
                        }
                        catch(err) {
                            this.nameResult =  "error: " + err.message;
                            console.error(err);
                        }
                    })

                })
                .catch(err => {
                    this.nameResult =  "error: " + err.message;
                    console.log("Error -> " + err);
                });
        }, 
        sendImages1(base64image) {
            return http.request({
                url: url,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    img: base64image
                })
            }).then((response) => {
                const result = response.content.toJSON();
                console.log("RESPONSE", result)
                this.nameResult = result.toString()
                let speakOptions = {
                    text: result.toString(), 
                    speakRate: 0.5,
                    //locale: 'en-GB', // optional - default is system locale,
                };
                // Call the `speak` method passing the SpeakOptions object
                tts.speak(speakOptions)
                    .then(() => {
                        console.log("hell yeah it worked!")
                    }).catch((err) => {
                        console.log("Just text-to-speech error, nothing serious",err)
                    });
            }).catch((err) => {
                this.nameResult =  "error: " + err.message;
                console.log(err)
            });
        },
        
    }
};
</script>
