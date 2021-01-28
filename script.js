const lan = "en"
var lastWord = ""

function speak() {

    var text = document.getElementById('tts').value;
    var audio = document.getElementById('audio')

    var word = text.replace(/\:/gi, '.');
    word = word.replace(/\!/gi, '!.');
    word = word.replace(/\?/gi, '?.');
    word = word.replace(/\;/gi, '.');
    word = word.replace(/\n/gi, '.');

    if (lastWord != word) {
        lastWord = word
        $("#wordcard").toggleClass("is-hidden")
        getWordMeaning(word)

        //audio.src = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lan + "&q=" + encodeURIComponent(word)
        //audio.playbackRate = 0.9; // Set Speak Speed
        //audio.play()
        textToSpeech(word)
    } else {
        console.log("Skipping fetch, playing same word")
        audio.play()
    }
}

function textToSpeech(word) {
    const url = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyDCUVKNJBzW6XAWg0K0mZCM9uMkE25SqDc'
    const data = {
        'input':{
            'text': word
        },
        'voice':{
            'languageCode':'en-US',
            'name':'en-US-Wavenet-C',
            'ssmlGender':'FEMALE'
        },
        'audioConfig':{
        'audioEncoding':'MP3'
        }
    }
    const otherparam={
        headers:{
            "content-type":"application/json; charset=UTF-8"
        },
        body:JSON.stringify(data),
        method:"POST"
     };
    fetch(url,otherparam)
    .then(data=>{return data.json()})
    .then(res=>{
        console.log(res.audioContent)
        var audio = document.getElementById('audio')
        audio.src = "data:audio/mp3;base64," + res.audioContent
        audio.playbackRate = 0.9;
        audio.play()
     })
    .catch(error=>{console.log(error);state.onError(error)})
}

function getWordMeaning(word) {
    var url = "https://owlbot.info/api/v4/dictionary/" + word;

    var params = {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + 'da037b8ade60b09902c70611dc9fe12fb0ad8235'
        }
    }

    fetch(url, params)
        .then((res) => res.json()
            .then((result) => {
                const obj = result

                if(typeof obj.definitions === "undefined") {
                    $("#wordcard-header").text(word)
                    $("#wordcard-meaning").text("No definitions found for : " + word)
                } else {
                    $("#wordcard-header").text(obj.word)
                    $("#wordcard-pronunciation").text('/' + obj.pronunciation + '/')
                    $("#wordcard-type").text(obj.definitions[0].type)
                    $("#wordcard-meaning").html(obj.definitions[0].definition)
                    $("#wordcard-example").html(obj.definitions[0].example)
                }
            }))
}
