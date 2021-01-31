const lan = "en"
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key="
const API_KEY = "AIzaSyDCUVKNJBzW6XAWg0K0mZCM9uMkE25SqDc"
const OWLBOT_URL = "https://owlbot.info/api/v4/dictionary/"
const OWLBOT_API_TOKEN = "da037b8ade60b09902c70611dc9fe12fb0ad8235"
const GIHUB_TEXT_FOLDER = "https://raw.githubusercontent.com/spellbee/spellbee.github.io/main/wordlist/"

var lastWord = ""

var currentList = []
var misspelledList = []
var currentIndex = 0
var incorrectList = []
var isIncorrectListSession = false

if(typeof localStorage.incorrectList !== "undefined") {
    incorrectList = JSON.parse(localStorage.incorrectList || []);
}

if(typeof localStorage.practiceList !== "undefined") {
    currentList = JSON.parse(localStorage.practiceList || [])
}

// Auto navigate to practice
var hash = window.location.hash;
switch(hash){
    case '#practice':
        navigate("practice")
        break;
    case '#pronounce':
        navigate("pronounce")
        break;
    case '#words':
        navigate("wordlist")
        break;
    default:
        //do nothing
}

hideButtonsBasedOnState()

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

function repeat() {
    var word = $("#practice-word").text()
    if (lastWord != word) {
        lastWord = word
        practiceWordMeaning(word)
        textToSpeech(word)
    } else {
        console.log("Skipping fetch, playing same word")
        audio.play()
    }
}

function practiceWordMeaning(word) {
    var url = OWLBOT_URL + word;

    var params = {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + OWLBOT_API_TOKEN
        }
    }

    fetch(url, params)
        .then((res) => res.json()
            .then((result) => {
                const obj = result

                if(typeof obj.definitions === "undefined") {
                    $("#practice-word-meaning").text("No definitions found for : " + word)
                } else {
                    $("#practice-word-pronunciation").text('/' + obj.pronunciation + '/')
                    $("#practice-word-type").text(obj.definitions[0].type)
                    $("#practice-word-meaning").html(obj.definitions[0].definition)
                    $("#practice-word-example").html(obj.definitions[0].example)
                }
            }))
}

function textToSpeech(word) {
    const url = GOOGLE_TTS_URL + API_KEY
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
    var url = OWLBOT_URL + word;

    var params = {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + OWLBOT_API_TOKEN
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

function navigate(section) {
    switch(section) {
        case "pronounce":
            $("#nav-pronounce").addClass("is-active")
            $("#nav-practice").removeClass("is-active")
            $("#nav-wordlist").removeClass("is-active")

            $("#section-pronounce").removeClass("is-hidden")
            $("#section-practice").addClass("is-hidden")
            $("#section-wordlist").addClass("is-hidden")

            window.location.hash = "pronounce"

            break;
        case "practice":
            $("#nav-pronounce").removeClass("is-active")
            $("#nav-practice").addClass("is-active")
            $("#nav-wordlist").removeClass("is-active")

            $("#section-pronounce").addClass("is-hidden")
            $("#section-practice").removeClass("is-hidden")
            $("#section-wordlist").addClass("is-hidden")

            window.location.hash = "practice"

            break;
        case "wordlist":
            $("#nav-pronounce").removeClass("is-active")
            $("#nav-practice").removeClass("is-active")
            $("#nav-wordlist").addClass("is-active")

            $("#section-pronounce").addClass("is-hidden")
            $("#section-practice").addClass("is-hidden")
            $("#section-wordlist").removeClass("is-hidden")

            window.location.hash = "words"

            break;
        default:
            // Do nothing
    }
}

function showMessage(message, type) {
    if(type == "error"){
        $("#message-text").text(message)
        $("#message").addClass("is-danger")
    } else {
        $("#message-text").text(message)
        $("#message").addClass("is-info")
    }

    $("#message").removeClass("is-hidden")
    $(function() {
        setTimeout(function() {
            $("#message").addClass("is-hidden")
            $("#message").removeClass("is-danger")
            $("#message").removeClass("is-info")
        }, 7000);
    });
}

function loadFromWordList() {
    if(!$("#wordlist").val()) {
        currentList = []
    } else {
        currentList = $("#wordlist").val().split('\n');
        localStorage.practiceList = JSON.stringify(currentList)
    }
}

function loadFromMisspeltStorage() {
    currentList = JSON.parse(localStorage.incorrectList)
}

function hideButtonsBasedOnState() {
    if(typeof localStorage.currentItem !== "undefined") {
        if(JSON.parse(localStorage.currentItem) > 0) {
            $("#practice-resume").removeClass("is-hidden")
        } else {
            $("#practice-resume").addClass("is-hidden")
        }
    } else {
        $("#practice-resume").addClass("is-hidden")
    }
    if(incorrectList.length > 0) {
        $("#practice-miss").removeClass("is-hidden")
    } else {
        $("#practice-miss").addClass("is-hidden")
    }
}

function startNewPractice(useMisspelledWords) {
    if(useMisspelledWords) {
        loadFromMisspeltStorage()
        isIncorrectListSession = true
    } else {
        loadFromWordList()
    }
    misspelledList = []
    currentIndex = 0

    if(currentList.length < 1) {
        showMessage("Practice words list is empty! Navigate to words section and select from file.", "error")
    } else {
        resumePractice(false)
    }
}

function resumePractice(resume) {
    $("#session-selector").addClass("is-hidden")
    $("#practice-card").removeClass("is-hidden")

    if(resume) {
        currentIndex = JSON.parse(localStorage.currentItem)
        console.log("Resuming previous sesion!")
    }

    if(currentIndex < currentList.length) {
        $("#practice-word").text(currentList[currentIndex])
        repeat()
    }
}

function endPractice() {
    $("#practice-card").addClass("is-hidden")
    localStorage.currentItem = JSON.stringify(0)
    localStorage.removeItem("practiceList")
    isIncorrectListSession = false
    hideButtonsBasedOnState()
    $("#session-selector").removeClass("is-hidden")
    window.location.hash = "practice"
    window.location.reload()
}

function misspelledPractice() {
    startNewPractice(true)
}

function next(result) {
    if(result != true) {
        appendToMissedList(currentList[currentIndex])
    } else {
        removeFromMissedList(currentList[currentIndex])
    }
    currentIndex++
    if(currentIndex < currentList.length) {
        if(!isIncorrectListSession) {
            localStorage.currentItem = JSON.stringify(currentIndex)
        }
        $("#practice-word").text(currentList[currentIndex])
        repeat()
    } else {
        $("#practice-word").text("")
        $("#practice-word-pronunciation").text("")
        $("#practice-word-type").text("")
        $("#practice-word-meaning").html("End of word list! Click on End-practice to close.")
        $("#practice-word-example").html("")

        $("#repeat-button").hide()
        $("#card-pass").hide()
        $("#card-fail").hide()
    }
}

function removeFromMissedList(word) {
    incorrectList.splice($.inArray(word, incorrectList),1);
    localStorage.incorrectList = JSON.stringify(incorrectList)
    console.log(word + " removed from incorrect master list.");
}

function appendToMissedList(word) {
    if(incorrectList.indexOf(word) === -1) {
        incorrectList.push(word);
        localStorage.incorrectList = JSON.stringify(incorrectList)
        console.log(word + " added to incorrect master list.");
    }
    $("#miss-list").append("<p><i class='fas fa-times has-text-danger-dark'></i>&nbsp;&nbsp;<span>" + word + "</span></p>")
}

function fetchWordsOnline(){
    var selectedGrade = $("#grade").val()
    $.ajax({
        url : GIHUB_TEXT_FOLDER + "grade-" + selectedGrade + ".txt",
        dataType: "text",
        success : function (data) {
            $("#wordlist").text(data);
        }
    });
}