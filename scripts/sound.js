const effect_sound = new Audio("sounds/effect_sound.mp3");

let play_effect_sound = () => {
    effect_sound.currentTime = 0;
    effect_sound.play();
}