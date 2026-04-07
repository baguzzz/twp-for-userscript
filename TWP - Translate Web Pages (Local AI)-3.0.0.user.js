// ==UserScript==
// @name         TWP - Translate Web Pages (Local AI)
// @namespace    https://github.com/FilipePS/Traduzir-paginas-web
// @version      3.0.0
// @description  Translate web pages using Google, Yandex, Bing, or local AI (Ollama/LM Studio)
// @author       Inspired by FilipePS
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== KONFIGURASI ==========
    let enabled = GM_getValue('enabled', true);
    let targetLang = GM_getValue('targetLang', 'id');
    let sourceLang = 'auto';
    let engine = GM_getValue('engine', 'google');
    let localAIEndpoint = GM_getValue('localAIEndpoint', 'http://localhost:11434/api/generate');
    let localAIModel = GM_getValue('localAIModel', 'llama3.2');
    let localAIPrompt = GM_getValue('localAIPrompt', 'Translate the following text to {{targetLang}}: "{{text}}". Return only the translation, no extra text.');

    // Status internal
    let observer = null;
    let isTranslating = false;

    // ========== ELEMEN UI ==========
    GM_addStyle(`
        #twp-floating-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 12px 18px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
            transition: all 0.3s ease;
        }
        #twp-floating-btn:hover {
            background-color: #3367d6;
            transform: scale(1.02);
        }
        #twp-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9998;
            display: none;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 280px;
            background-color: #fff;
            color: #333;
            max-height: 80vh;
            overflow-y: auto;
        }
        #twp-panel select, #twp-panel input, #twp-panel button {
            width: 100%;
            margin: 5px 0;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        #twp-panel button {
            background-color: #000000;
            cursor: pointer;
        }
        #twp-panel button:hover {
            background-color: #555555;
        }
        #twp-status {
            font-size: 12px;
            color: #555;
            margin-top: 8px;
            text-align: center;
        }
        .twp-collapsible {
            background-color: #f9f9f9;
            margin-top: 8px;
            padding: 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .twp-collapsible-content {
            display: none;
            padding: 5px;
        }
    `);

    // Tombol floating
    const btn = document.createElement('button');
    btn.id = 'twp-floating-btn';
    btn.textContent = '🌐 TWP';
    document.body.appendChild(btn);

    // Panel kontrol (dengan konfigurasi AI lokal)
    const panel = document.createElement('div');
    panel.id = 'twp-panel';
    panel.innerHTML = `
        <div style="font-weight:bold; margin-bottom:8px;">TWP - Translate</div>
        <label>Engine:</label>
        <select id="twp-engine-select">
            <option value="google">Google Translate</option>
            <option value="yandex">Yandex Translate</option>
            <option value="bing">Bing (MyMemory)</option>
            <option value="localai">Local AI (Ollama/LM Studio)</option>
        </select>
        <label>Target Language:</label>
        <select id="twp-lang-select">
            <option value="id">Indonesia</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh-CN">中文 (简体)</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="ar">العربية</option>
            <option value="pt">Português</option>
        </select>

        <div id="localai-config" style="display: none;">
            <div class="twp-collapsible">⚙️ Local AI Settings ▼</div>
            <div class="twp-collapsible-content">
                <label>Endpoint URL:</label>
                <input type="text" id="twp-localai-endpoint" placeholder="http://localhost:11434/api/generate">
                <label>Model Name:</label>
                <input type="text" id="twp-localai-model" placeholder="llama3.2">
                <label>Prompt Template:</label>
                <textarea id="twp-localai-prompt" rows="3" placeholder="Translate to {{targetLang}}: &quot;{{text}}&quot;"></textarea>
                <small>Use {{text}} and {{targetLang}} as placeholders.</small>
            </div>
        </div>

        <button id="twp-toggle">${enabled ? 'Disable' : 'Enable'}</button>
        <button id="twp-translate-now">Translate Now</button>
        <div id="twp-status">Ready</div>
    `;
    document.body.appendChild(panel);

    // Event listeners UI
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) {
            panel.style.display = 'none';
        }
    });

    const engineSelect = document.getElementById('twp-engine-select');
    const langSelect = document.getElementById('twp-lang-select');
    const toggleBtn = document.getElementById('twp-toggle');
    const translateNowBtn = document.getElementById('twp-translate-now');
    const statusDiv = document.getElementById('twp-status');
    const localAIConfigDiv = document.getElementById('localai-config');
    const localAIEndpointInput = document.getElementById('twp-localai-endpoint');
    const localAIModelInput = document.getElementById('twp-localai-model');
    const localAIPromptInput = document.getElementById('twp-localai-prompt');
    const collapsibleBtn = document.querySelector('.twp-collapsible');
    const collapsibleContent = document.querySelector('.twp-collapsible-content');

    // Collapsible
    if (collapsibleBtn && collapsibleContent) {
        collapsibleBtn.addEventListener('click', () => {
            const isOpen = collapsibleContent.style.display === 'block';
            collapsibleContent.style.display = isOpen ? 'none' : 'block';
            collapsibleBtn.textContent = isOpen ? '⚙️ Local AI Settings ▼' : '⚙️ Local AI Settings ▲';
        });
    }

    // Load saved values
    engineSelect.value = engine;
    localAIEndpointInput.value = localAIEndpoint;
    localAIModelInput.value = localAIModel;
    localAIPromptInput.value = localAIPrompt;
    langSelect.value = targetLang;

    function updateLocalAIConfigVisibility() {
        localAIConfigDiv.style.display = engineSelect.value === 'localai' ? 'block' : 'none';
    }
    updateLocalAIConfigVisibility();

    engineSelect.addEventListener('change', () => {
        engine = engineSelect.value;
        GM_setValue('engine', engine);
        updateLocalAIConfigVisibility();
        if (enabled) startTranslation();
        statusDiv.textContent = `Engine: ${engineSelect.options[engineSelect.selectedIndex].text}`;
    });

    localAIEndpointInput.addEventListener('change', () => {
        localAIEndpoint = localAIEndpointInput.value;
        GM_setValue('localAIEndpoint', localAIEndpoint);
    });
    localAIModelInput.addEventListener('change', () => {
        localAIModel = localAIModelInput.value;
        GM_setValue('localAIModel', localAIModel);
    });
    localAIPromptInput.addEventListener('change', () => {
        localAIPrompt = localAIPromptInput.value;
        GM_setValue('localAIPrompt', localAIPrompt);
    });

    langSelect.addEventListener('change', () => {
        targetLang = langSelect.value;
        GM_setValue('targetLang', targetLang);
        if (enabled) startTranslation();
    });

    toggleBtn.addEventListener('click', () => {
        enabled = !enabled;
        GM_setValue('enabled', enabled);
        toggleBtn.textContent = enabled ? 'Disable' : 'Enable';
        if (enabled) {
            startTranslation();
        } else {
            stopTranslation();
            restoreOriginalText();
        }
        statusDiv.textContent = enabled ? 'Enabled' : 'Disabled';
    });

    translateNowBtn.addEventListener('click', () => {
        if (!enabled) {
            enabled = true;
            GM_setValue('enabled', true);
            toggleBtn.textContent = 'Disable';
        }
        startTranslation();
    });

    // ========== FUNGSI TERJEMAHAN (DENGAN LOCAL AI) ==========
    function translateText(text, target, source, engineType, callback) {
        if (!text || text.trim() === '') {
            callback('');
            return;
        }

        if (engineType === 'google') {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
            GM_xmlhttpRequest({
                method: 'GET', url: url,
                onload: (resp) => {
                    try {
                        const data = JSON.parse(resp.responseText);
                        let translated = '';
                        if (data && data[0]) {
                            for (let i = 0; i < data[0].length; i++) {
                                if (data[0][i][0]) translated += data[0][i][0];
                            }
                        }
                        callback(translated || null);
                    } catch(e) { callback(null); }
                },
                onerror: () => callback(null)
            });
        }
        else if (engineType === 'yandex') {
            const url = `https://translate.yandex.net/api/v1/tr.json/translate?lang=${source}-${target}&text=${encodeURIComponent(text)}`;
            GM_xmlhttpRequest({
                method: 'GET', url: url,
                onload: (resp) => {
                    try {
                        const data = JSON.parse(resp.responseText);
                        let translated = data?.text?.join('') || '';
                        callback(translated || null);
                    } catch(e) { callback(null); }
                },
                onerror: () => callback(null)
            });
        }
        else if (engineType === 'bing') {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
            GM_xmlhttpRequest({
                method: 'GET', url: url,
                onload: (resp) => {
                    try {
                        const data = JSON.parse(resp.responseText);
                        let translated = data?.responseData?.translatedText || '';
                        callback(translated || null);
                    } catch(e) { callback(null); }
                },
                onerror: () => callback(null)
            });
        }
        else if (engineType === 'localai') {
            // Build prompt
            let prompt = localAIPrompt.replace('{{text}}', text).replace('{{targetLang}}', target);
            const requestBody = {
                model: localAIModel,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.1 } // untuk hasil konsisten
            };
            // Untuk LM Studio, endpoint mungkin berbeda; sesuaikan jika perlu.
            GM_xmlhttpRequest({
                method: 'POST',
                url: localAIEndpoint,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(requestBody),
                onload: (resp) => {
                    try {
                        const data = JSON.parse(resp.responseText);
                        let translated = '';
                        // Menyesuaikan dengan format respons Ollama (data.response) atau LM Studio (data.choices[0].text)
                        if (data.response) {
                            translated = data.response.trim();
                        } else if (data.choices && data.choices[0] && data.choices[0].text) {
                            translated = data.choices[0].text.trim();
                        } else {
                            translated = '';
                        }
                        // Bersihkan dari kutipan ganda yang mungkin ditambahkan model
                        translated = translated.replace(/^["']|["']$/g, '');
                        callback(translated || null);
                    } catch(e) {
                        console.error('Local AI parse error:', e);
                        callback(null);
                    }
                },
                onerror: (err) => {
                    console.error('Local AI request error:', err);
                    statusDiv.textContent = 'Error: Local AI not reachable';
                    callback(null);
                }
            });
        }
        else {
            callback(null);
        }
    }

    // Sisa kode (translateElement, translatePage, restoreOriginalText, observer, dll) sama seperti versi sebelumnya.
    // Untuk menjaga panjang respons, saya hanya menuliskan ulang fungsi-fungsi yang relevan.
    // Di sini saya akan menyalin kembali fungsi-fungsi yang sama dengan versi sebelumnya, namun pastikan memanggil translateText dengan engine yang benar.

    function translateElement(el, targetLang, engineType) {
        return new Promise((resolve) => {
            if (el.hasAttribute('data-translated') ||
                el.tagName === 'SCRIPT' ||
                el.tagName === 'STYLE' ||
                el.tagName === 'NOSCRIPT' ||
                el.tagName === 'IFRAME' ||
                el.isContentEditable) {
                resolve();
                return;
            }

            if (!el.hasAttribute('data-original-text')) {
                el.setAttribute('data-original-text', el.innerHTML);
            }

            const walker = document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (node.textContent.trim() === '') return NodeFilter.FILTER_SKIP;
                        if (node.parentElement.hasAttribute('data-translated')) return NodeFilter.FILTER_SKIP;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            if (textNodes.length === 0) {
                resolve();
                return;
            }

            let index = 0;
            function processNext() {
                if (index >= textNodes.length) {
                    resolve();
                    return;
                }
                const textNode = textNodes[index];
                const originalText = textNode.textContent;
                translateText(originalText, targetLang, sourceLang, engineType, (translated) => {
                    if (translated && translated !== originalText) {
                        textNode.textContent = translated;
                        textNode.parentElement.setAttribute('data-translated', 'true');
                    }
                    index++;
                    setTimeout(processNext, 20);
                });
            }
            processNext();
        });
    }

    async function translatePage() {
        if (isTranslating) return;
        isTranslating = true;
        statusDiv.textContent = 'Translating...';

        const elements = document.querySelectorAll('body *:not([data-translated]):not(script):not(style):not(noscript)');
        for (const el of elements) {
            if (!enabled) break;
            await translateElement(el, targetLang, engine);
        }

        document.body.setAttribute('data-twptranslated', 'true');
        isTranslating = false;
        statusDiv.textContent = 'Done';
        setTimeout(() => {
            if (statusDiv.textContent === 'Done') statusDiv.textContent = 'Ready';
        }, 60);
    }

    function restoreOriginalText() {
        const translatedElements = document.querySelectorAll('[data-original-text]');
        translatedElements.forEach(el => {
            el.innerHTML = el.getAttribute('data-original-text');
            el.removeAttribute('data-translated');
            el.removeAttribute('data-original-text');
        });
        document.body.removeAttribute('data-twptranslated');
    }

    function startTranslation() {
        if (!enabled) return;
        if (observer) observer.disconnect();
        translatePage().then(() => {
            observer = new MutationObserver((mutations) => {
                if (!enabled) return;
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('data-translated')) {
                                translateElement(node, targetLang, engine);
                            }
                        });
                    } else if (mutation.type === 'characterData' && mutation.target.parentElement) {
                        const parent = mutation.target.parentElement;
                        if (!parent.hasAttribute('data-translated')) {
                            translateElement(parent, targetLang, engine);
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
    }

    function stopTranslation() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        isTranslating = false;
    }

    // Inisialisasi
    if (enabled) {
        startTranslation();
    }
})();