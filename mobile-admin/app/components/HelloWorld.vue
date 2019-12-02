<template>
	<Page class="page">
		<ActionBar title="ADMIN" class="action-bar" />
        <StackLayout>
            <TextField v-model="username" class="input h1 right" row="0" col="1" />
            <Button :text="textPicture" class="btn btn-primary" marginTop="20" @tap="takePicture"></Button>
            <Label :text="nameResult" class="h2" textWrap="true" ></Label>
            <Image :src="pictureFromCamera"></Image> 
        </StackLayout>
	</Page>
</template>

<script>
import * as camera from "../nativescript-camera";
import * as http from "http";
import * as imageSource from "image-source";
import * as  enumsModule  from 'ui/enums';
import * as base64 from 'base-64';

const format = enumsModule.ImageFormat.jpeg
const url = "https://XXXXXXXXXXX.execute-api.eu-central-1.amazonaws.com/Prod/admin/";

export default {
    data() {
        return {
            pictureFromCamera: null,
            textPicture: "Take a Picture",
            nameResult: "take of an employee ... ",
            username: "name"
        };
    },
    methods: {
        takePicture() {
            camera
                .takePicture({ width: 300, height: 300, keepAspectRatio: true , cameraFacing: "rear" })
                .then(imageAsset => {
                    this.pictureFromCamera = imageAsset;
                    this.nameResult =  "Creating profile ..."

                    const source = new imageSource.ImageSource();
                    console.log("fetching image ... ")
                    source.fromAsset(imageAsset).then((result) => {
                        try {
                            console.log("prepare to send image  ... ")
                            let base64String = result.toBase64String(format)
                            return this.sendImages1(base64String, this.username);
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
        sendImages1(base64image, username) {
            return http.request({
                url: url,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    username: username,
                    img: base64image
                })
            }).then((response) => {
                const result = response.content.toJSON();
                console.log("SUCCESSFULL", result)
                this.nameResult = result.toString()
            }).catch((err) => {
                this.nameResult =  "error: " + err.message;
                console.log(err)
            });
        }
    }
};
</script>
