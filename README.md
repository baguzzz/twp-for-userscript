# twp-for-userscript
Translate web pages using Google, Yandex, Bing, or local AI (Ollama/LM Studio) 

 @author  baguzzz     Inspired by FilipePS

# atur konvigurasi secara manual 


let enabled = GM_getValue('enabled', true);


//atur target bahasanya cth : i id,jp,en.
    let targetLang = GM_getValue('targetLang', 'id'); 
//atur bahasa sumber atau halaman (untuk auto cuma berkerja untuk google)  
    let sourceLang = 'auto';
    let engine = GM_getValue('engine', 'google');
    let localAIEndpoint = GM_getValue('localAIEndpoint', 'http://localhost:11434/api/generate');
    let localAIModel = GM_getValue('localAIModel', 'llama3.2');
    let localAIPrompt = GM_getValue('localAIPrompt', 'Translate the following text to {{targetLang}}: "{{text}}". Return only the translation, no extra text.');

    // Status internal
    let observer = null;
    let isTranslating = false;
