const fs = require('fs');

let content = fs.readFileSync('src/components/ConceptExplanation.jsx', 'utf8');

// C1
content = content.replace(
    "  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);",
    "  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);\n  const [isListening, setIsListening] = useState(false);"
);

// C2
content = content.replace(
    "      setIsSpeakingPhase(false);",
    "      setIsSpeakingPhase(false);\n      setIsListening(false);"
);

// C3
content = content.replace(
    "  const handleAudioPlay = () => {\n    console.log(\"Playing audio for current text...\");\n  };\n\n  return (",
    `  const handleAudioPlay = () => {
    console.log("Playing audio for current text...");
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. We will simulate a successful speech.");
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setIsChecked(true);
      }, 1500);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log("Speech recognized: ", event.results[0][0].transcript);
      setIsListening(false);
      setIsChecked(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone access.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch(e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (`
);

// C4
const oldMicStr = `              {/* Mic Button Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', color: '#10b981', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                  Tap and speak
                </div>
                <button
                  onClick={() => setIsChecked(true)}
                  style={{ background: '#8b5cf6', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Mic size={32} color="#fff" strokeWidth={2.5} />
                </button>
              </div>`;

const newMicStr = `              {/* Mic Button Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
                <div style={{ background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', border: \`1px solid \${isListening ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}\`, borderRadius: '20px', padding: '6px 16px', color: isListening ? '#ef4444' : '#10b981', fontSize: '13px', fontWeight: '600', marginBottom: '12px', transition: 'all 0.3s' }}>
                  {isListening ? 'Listening...' : 'Tap and speak'}
                </div>
                <button
                  onClick={startListening}
                  disabled={isListening}
                  style={{ background: isListening ? '#ef4444' : '#8b5cf6', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: \`0 4px 20px \${isListening ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.4)'}\`, transition: 'all 0.2s', cursor: isListening ? 'default' : 'pointer', opacity: isListening ? 0.8 : 1 }}
                  onMouseDown={(e) => !isListening && (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => !isListening && (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseLeave={(e) => !isListening && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Mic size={32} color="#fff" strokeWidth={isListening ? 3 : 2.5} />
                </button>
              </div>`;

content = content.replace(oldMicStr, newMicStr);

fs.writeFileSync('src/components/ConceptExplanation.jsx', content);
console.log("Patched successfully!");
