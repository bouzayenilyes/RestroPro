/**
 * @param {String} text - pass string text to convert to speak
 *  */ 
export function textToSpeech(text) {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[0];

    synth.speak(utterance);
}