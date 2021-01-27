const lan = "en"
var lastWord = ""

function speak() {

    var text = document.getElementById('tts').value;

    var word = text.replace(/\:/gi, '.');
    word = word.replace(/\!/gi, '!.');
    word = word.replace(/\?/gi, '?.');
    word = word.replace(/\;/gi, '.');
    word = word.replace(/\n/gi, '.');

    if (lastWord != word) {
        lastWord = word
        $("#wordcard").toggleClass("is-hidden")
        getWordMeaning(word)
    } else {
        console.log("Skipping fetch, playing same word")
        var audio = document.getElementById('audio')
        audio.src = "http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lan + "&q=" + encodeURIComponent(word)
        audio.playbackRate = 0.9; // Set Speak Speed
        audio.play()
    }
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
