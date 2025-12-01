import './styles.css';
import { App } from './app';
import { UI } from './ui';
import { Audio, Piano } from './audio';
import { PHYSICAL_MAP, DB } from './data';

declare global {
    interface Window {
        App: typeof App;
        UI: typeof UI;
        Piano: typeof Piano;
        AudioEngine: typeof Audio;
    }
}

// Global assignments for HTML event listeners (onclick="window.App...")
window.App = App;
window.UI = UI;
window.Piano = Piano;
window.AudioEngine = Audio;

// Keyboard Event Listeners
document.addEventListener('keydown', e => {
    if(e.code === 'Escape') UI.closeModals();
    if(e.code === 'Space') { 
        e.preventDefault(); 
        const valBtn = document.getElementById('valBtn') as HTMLButtonElement;
        if(valBtn && !valBtn.disabled && valBtn.classList.contains('next')) {
            App.handleMain();
        }
        else if(!App.session.chord) App.playNew(); 
        else if(!App.session.done) App.replay(); 
        return;
    }
    if(e.code === 'Enter' || e.code === 'NumpadEnter') { 
        e.preventDefault(); 
        App.handleMain(); 
        return;
    }
    if(e.code === 'KeyH') {
        App.hint();
        return;
    }
    if((PHYSICAL_MAP as any)[e.code] !== undefined) {
        const idx = (PHYSICAL_MAP as any)[e.code];
        if(App.session.mode === 'inverse') {
            if(idx < App.session.quizOptions.length) {
                if(!App.session.done) App.selectQuiz(idx);
            }
        } else {
            const isDigit = e.code.startsWith('Digit') || e.code.startsWith('Numpad');
            if(isDigit) {
                const ac = DB.chords.filter(c => App.data.settings.activeC.includes(c.id));
                if(ac[idx]) { 
                    if(!App.session.done) App.select('c', ac[idx].id);
                    else App.preview('c', ac[idx].id);
                }
            } else {
                const ai = DB.currentInvs.filter(i => App.data.settings.activeI.includes(i.id));
                if(ai[idx]) {
                    if(!App.session.done) App.select('i', ai[idx].id);
                    else App.preview('i', ai[idx].id);
                }
            }
        }
    }
});

// Initialization
window.onload = () => {
    App.init();
};