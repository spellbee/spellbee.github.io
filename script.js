const lan = "en"

function speak() {

  var text = document.getElementById('tts').value;

  var text2 = text.replace(/\:/gi, '.');
  text2 = text2.replace(/\!/gi, '!.');
  text2 = text2.replace(/\?/gi, '?.');
  text2 = text2.replace(/\;/gi, '.');
  text2 = text2.replace(/\n/gi, '.');
  //text2 = text2.replace(/\,/gi, '.');

  text2 = text2.split('.');

  text = text2.filter(v => v != '');

  // Check Array
  // document.getElementById('text').value = text.join('#')

  // Start Playing
  //startPlaying(text);
  
  for(var i=0; i<text.length; i++) {
    var audio = document.getElementById('audio')
    audio.src = "http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lan + "&q=" + encodeURIComponent(text[i])
    audio.playbackRate = 1; // Set Speak Speed
    audio.play()
  }
}

function startPlaying(text) {
  
  var audio = document.getElementById('audio')
  var current = 0

  audio.src = "http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + lan + "&q=" + encodeURIComponent(text[current])
  
  audio.playbackRate = 1; // Set Speak Speed

  audio.play()

  audio.onended = function() {
    if (current < text.length - 1) {
      current += 1
      startPlaying(current)
    }
  };

}
