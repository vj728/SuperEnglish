import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Volume2, Info, Lightbulb, Zap, Undo, Mic } from 'lucide-react';

const arrangeQuizzes = {
  5: {
    hin: 'हम Sunday को cricket खेल रहे हैं  ',
    eng: "We are playing Cricket on sunday",
    words: ['on', 'We', 'are', 'playing', 'at', 'sunday', 'Cricket', 'in'],
    correctArr: ['We', 'are', 'playing', 'Cricket', 'on', 'sunday'],
    extraWords: ['in', 'at']
  },
  6: {
    hin: 'वे July में आ रहे हैं',
    eng: "They are coming in July",
    words: ['are', 'They', 'on', 'July', 'coming', 'in', 'at'],
    correctArr: ['They', 'are', 'coming', 'in', 'July'],
    extraWords: ['on', 'at']
  },
  7: {
    hin: 'मैं 7 PM पर सो रहा हूँ',
    eng: "I am sleeping at 7 PM",
    words: ['sleeping', 'am', 'at', 'I', 'on', 'in', '7 PM'],
    correctArr: ['I', 'am', 'sleeping', 'at', '7 PM'],
    extraWords: ['on', 'in']
  }
};

const speakQuizzes = {
  8: {
    arrangeHin: 'वह June में आ रही है',
    speakHin: 'Sentence को पढ़ें',
    eng: "She is arriving in June",
    words: ['on', 'June', 'arriving', 'in', 'She', 'is', 'at'],
    correctArr: ['She', 'is', 'arriving', 'in', 'June'],
    extraWords: ['on', 'at']
  },
  9: {
    arrangeHin: 'वे Sunday को आ रहे हैं',
    speakHin: 'Sentence को पढ़ें',
    eng: "They are coming on Sunday",
    words: ['are', 'They', 'on', 'Sunday', 'coming', 'in', 'at'],
    correctArr: ['They', 'are', 'coming', 'on', 'Sunday'],
    extraWords: ['in', 'at']
  },
  10: {
    arrangeHin: 'मैं 7 PM पर निकल रहा हूँ',
    speakHin: 'Sentence को पढ़ें',
    eng: "I am leaving at 7 PM",
    words: ['leaving', 'am', 'at', 'I', 'on', 'in', '7 PM'],
    correctArr: ['I', 'am', 'leaving', 'at', '7 PM'],
    extraWords: ['on', 'in']
  }
};

function ConceptExplanation() {
  const [language, setLanguage] = useState('Hindi');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechCorrect, setIsSpeechCorrect] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    // intentional blank space to prevent hooks re-indexing heavily if preferred, 
    // but just removing it is fine too.
  }, [isChecked, isSpeakingPhase]);

  const [arrangedWords, setArrangedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(arrangeQuizzes[5].words);

  useEffect(() => {
    const data = arrangeQuizzes[currentStep] || speakQuizzes[currentStep];
    if (data) {
      setAvailableWords(data.words);
      setArrangedWords([]);
      setIsChecked(false);
      setIsSpeakingPhase(false);
      setIsListening(false);
      setIsSpeechCorrect(null);
    }
  }, [currentStep]);

  const handleWordClick = (word, from) => {
    if (from === 'available') {
      setAvailableWords(availableWords.filter(w => w !== word));
      setArrangedWords([...arrangedWords, word]);
    } else {
      setArrangedWords(arrangedWords.filter((w, i) => i !== arrangedWords.indexOf(word)));
      setAvailableWords([...availableWords, word]);
    }
  };

  const handleResetWords = () => {
    const data = arrangeQuizzes[currentStep] || speakQuizzes[currentStep];
    if (data) {
      setAvailableWords(data.words);
      setArrangedWords([]);
    }
  };

  const handleAutoSolve = () => {
    const data = arrangeQuizzes[currentStep] || speakQuizzes[currentStep];
    if (!data) return;

    const correctArr = data.correctArr;

    let i = 0;
    while (i < arrangedWords.length && arrangedWords[i] === correctArr[i]) {
      i++;
    }

    if (i < correctArr.length) {
      const newArranged = correctArr.slice(0, i + 1);

      const allWords = [...data.words];
      newArranged.forEach(w => {
        const idx = allWords.indexOf(w);
        if (idx > -1) allWords.splice(idx, 1);
      });

      setArrangedWords(newArranged);
      setAvailableWords(allWords);
    }
  };

  const quizData = arrangeQuizzes[currentStep] || speakQuizzes[currentStep];
  const isArrangementCorrect = quizData
    ? arrangedWords.join(" ") === quizData.correctArr.join(" ")
    : false;

  // Calculate progress based on user actions (Total module is 1 section out of 10)
  const totalSubSteps = 12; // 0 to 11 + potential isChecked
  const currentProgress = currentStep + (isChecked ? 1 : 0);
  const progress = Math.min(10, (currentProgress / totalSubSteps) * 10);

  const handleAudioPlay = () => {
    console.log("Playing audio for current text...");
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. We will simulate a successful speech.");
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setIsSpeechCorrect(true);
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
      let isCorrect = false;
      
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognized: ", transcript);

        const currentQuiz = speakQuizzes[currentStep];
        if (currentQuiz && currentQuiz.eng) {
          let expectedText = currentQuiz.eng.toLowerCase();
          let spokenText = transcript.toLowerCase();
          
          const normalize = (str) => {
            return str
              .replace(/[.,?!:;]/g, '')
              .replace(/7 pm/g, 'seven pm')
              .replace(/7pm/g, 'seven pm')
              .replace(/7 p\.m\./g, 'seven pm')
              .replace(/7 p\.m/g, 'seven pm')
              .replace(/7/g, 'seven')
              .replace(/\s+/g, ' ')
              .trim();
          };

          const nSpoken = normalize(spokenText);
          const nExpected = normalize(expectedText);

          isCorrect = nSpoken === nExpected || nSpoken.includes(nExpected);
        }
      }
      
      setIsSpeechCorrect(isCorrect);
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
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const headerSection = useMemo(() => (
    <>
      <div className="top-nav flex-row">
        <button className="close-btn" aria-label="Close">
          <X size={20} strokeWidth={3} />
        </button>
        <div className="progress-track">
          <div 
             className="progress-fill" 
             style={{ 
               width: '100%', 
               transform: `scaleX(${progress / 100})`, 
               transformOrigin: 'left center' 
             }}>
          </div>
        </div>
      </div>

      <div className="flex-row justify-center">
        <div className="language-toggle">
          <button
            className={`toggle-btn ${language === 'Hindi' ? 'active' : ''}`}
            onClick={() => setLanguage('Hindi')}
          >
            हिंदी
          </button>
          <button
            className={`toggle-btn ${language === 'English' ? 'active' : ''}`}
            onClick={() => setLanguage('English')}
          >
            English
          </button>
        </div>
      </div>

      <div className="header-area">
        <h1 className="concept-title">Present Continuous Tense</h1>
      </div>
    </>
  ), [progress, language]);

  return (
    <div className="concept-screen">
      {headerSection}

      {currentStep === 0 && (
        <>
          <div className="content-card">
            <div className="visual-aid">
              <img src="/present_continuous.png" alt="Concept Illustration" className="concept-image" />
              <div className="visual-overlay">
                <span className="visual-tag">Action in progress</span>
              </div>
            </div>

            <div className="learning-section">
              {/* Main rule */}
              <div className="learning-row">
                <button className="audio-btn" onClick={handleAudioPlay}>
                  <Volume2 size={24} strokeWidth={2.5} />
                </button>
                <div className="text-content">
                  <p className="learning-text">
                    {language === 'Hindi'
                      ? <>चलिए <span className="highlight-english">Present Continuous</span> के बारे में सीखते हैं।</>
                      : <>Let's learn about the <span className="highlight-english">Present Continuous</span> tense.</>
                    }
                  </p>
                  <p className="learning-text secondary">
                    {language === 'Hindi'
                      ? <>ये tense तब use होता है जब कोई काम "अभी चल रहा है" (happening right now)।</>
                      : <>This tense is used when an action is happening right now.</>
                    }
                  </p>
                </div>
              </div>

              {/* Example */}
              <div className="learning-row" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.1)' }}>
                <div className="audio-btn" style={{ background: 'transparent', color: '#10b981', borderColor: 'transparent' }}>
                  <Info size={24} strokeWidth={2.5} />
                </div>
                <div className="text-content">
                  <p className="learning-text">
                    {language === 'Hindi'
                      ? <>जैसे <span className="highlight-english">"They are running"</span></>
                      : <>For example: <span className="highlight-english">"They are running"</span></>
                    }
                  </p>
                  <p className="learning-text secondary">
                    {language === 'Hindi'
                      ? <>इसका मतलब है कि वे अभी दौड़ रहे हैं।</>
                      : <>Which means the running action is happening at this exact moment.</>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setCurrentStep(1)}>
            LET'S LEARN
          </button>
        </>
      )}

      {/* Pop Quiz Section 1 */}
      {currentStep === 1 && (
        <div className="quiz-container">
          <div className="quiz-header">
            POP QUIZ
          </div>
          <div className="quiz-content">
            <div className="quiz-question-row">
              <button className="quiz-audio-btn" onClick={handleAudioPlay}>
                <Volume2 size={24} strokeWidth={2.5} />
              </button>
              <div className="quiz-question-text">
                {language === 'Hindi'
                  ? 'अभी हो रही actions के बारे में बात करने के लिए आप कौन सा tense use करते हैं?'
                  : 'Which tense do you use to talk about actions happening right now?'
                }
              </div>
            </div>

            <div className="quiz-options">
              <button
                className={`quiz-option-btn ${selectedOption === 'present_continuous'
                  ? (isChecked ? 'selected' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('present_continuous')}
              >
                Present Continuous Tense
              </button>
              <button
                className={`quiz-option-btn ${selectedOption === 'simple_present'
                  ? (isChecked ? 'wrong' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('simple_present')}
              >
                Simple Present Tense
              </button>
            </div>

            <button
              className="btn-primary"
              disabled={!selectedOption || isChecked}
              onClick={() => setIsChecked(true)}
              style={{ marginTop: '0' }}
            >
              CHECK
            </button>
          </div>
        </div>
      )}

      {/* Quiz 1 Result Block */}
      {currentStep === 1 && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${selectedOption === 'present_continuous' ? 'success' : 'error'} `}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {selectedOption === 'present_continuous' ? (
                language === 'Hindi'
                  ? 'सही! Present Continuous का उपयोग अभी हो रहे actions के लिए किया जाता है।'
                  : 'Correct! Present Continuous is used for actions happening right now.'
              ) : (
                language === 'Hindi'
                  ? 'गलत! Simple Present रोज़मर्रा के कामों के लिए है। अभी हो रहे काम के लिए Present Continuous का इस्तेमाल करें।'
                  : 'Oops! Simple Present is for daily routines. Use Present Continuous for actions happening right now.'
              )}
            </div>
          </div>

          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              setCurrentStep(2);
              setIsChecked(false);
              setSelectedOption(null);
            }}
          >
            NEXT
          </button>
        </div>
      )}

      {/* Pop Quiz Section 2 */}
      {currentStep === 2 && (
        <div className="quiz-container">
          <div className="quiz-header">
            POP QUIZ
          </div>
          <div className="quiz-content">

            {/* Grammar Box rendered first in Quiz 2 as per new design */}
            <div className="grammar-box" style={{ marginBottom: '20px' }}>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Present continuous tense :</span>
                <span>I</span>
                <span>am</span>
                <span className="grammar-purple-text">[verb]-ing</span>
              </div>
              <div className="grammar-row">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example :</span>
                <span>I</span>
                <span>am</span>
                <span className="grammar-purple-text">playing</span>
              </div>
            </div>

            <div className="quiz-question-row">
              <button className="quiz-audio-btn" onClick={handleAudioPlay}>
                <Volume2 size={24} strokeWidth={2.5} />
              </button>
              <div className="quiz-question-text">
                {language === 'Hindi'
                  ? '"I" के साथ present continuous tense का सही structure क्या है?'
                  : 'What is the correct present continuous tense structure with "I"?'
                }
              </div>
            </div>

            <div className="quiz-options">
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_correct'
                  ? (isChecked ? 'selected' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_correct')}
              >
                I am verbing
              </button>
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_wrong'
                  ? (isChecked ? 'wrong' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_wrong')}
              >
                I verb every day
              </button>
            </div>

            <button
              className="btn-primary"
              disabled={!selectedOption || isChecked}
              onClick={() => setIsChecked(true)}
              style={{ marginTop: '0' }}
            >
              CHECK
            </button>
          </div>
        </div>
      )}

      {/* Quiz 2 Result Block */}
      {currentStep === 2 && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${selectedOption === 'opt_correct' ? 'success' : 'error'} `}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {selectedOption === 'opt_correct' ? (
                language === 'Hindi'
                  ? "Perfect! आपने structure सही समझा है। 'I' के साथ, हम 'am' + verb+ing का use करते हैं।"
                  : "Perfect! You understood the structure. With 'I', we use 'am' + verb+ing."
              ) : (
                language === 'Hindi'
                  ? "गलत! 'I verb every day' simple present है। Present continuous 'I am verbing' होता है।"
                  : "Oops! 'I verb every day' is simple present. Present continuous is 'I am verbing'."
              )}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              setCurrentStep(3);
              setIsChecked(false);
              setSelectedOption(null);
            }}
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Pop Quiz Section 3 */}
      {currentStep === 3 && (
        <div className="quiz-container">
          <div className="quiz-header">
            POP QUIZ
          </div>
          <div className="quiz-content">

            {/* Grammar Box for He/She/It */}
            <div className="grammar-box" style={{ marginBottom: '20px' }}>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Present continuous tense :</span>
                <span>He / She / It</span>
                <span>is</span>
                <span className="grammar-purple-text">[verb]-ing</span>
              </div>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 1:</span>
                <span>He</span>
                <span>is</span>
                <span className="grammar-purple-text">playing</span>
              </div>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 2:</span>
                <span>She</span>
                <span>is</span>
                <span className="grammar-purple-text">reading</span>
              </div>
              <div className="grammar-row">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 3:</span>
                <span>It</span>
                <span>is</span>
                <span className="grammar-purple-text">raining</span>
              </div>
            </div>

            <div className="quiz-question-row">
              <button className="quiz-audio-btn" onClick={handleAudioPlay}>
                <Volume2 size={24} strokeWidth={2.5} />
              </button>
              <div className="quiz-question-text">
                {language === 'Hindi'
                  ? '"He", "She" या "It" के साथ present continuous tense का सही structure क्या है?'
                  : 'What is the correct present continuous tense structure with "He", "She" or "It"?'
                }
              </div>
            </div>

            <div className="quiz-options">
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_correct_he'
                  ? (isChecked ? 'selected' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_correct_he')}
              >
                He is playing
              </button>
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_wrong_he'
                  ? (isChecked ? 'wrong' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_wrong_he')}
              >
                He am playing
              </button>
            </div>

            <button
              className="btn-primary"
              disabled={!selectedOption || isChecked}
              onClick={() => setIsChecked(true)}
              style={{ marginTop: '0' }}
            >
              CHECK
            </button>
          </div>
        </div>
      )}

      {/* Quiz 3 Result Block */}
      {currentStep === 3 && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${selectedOption === 'opt_correct_he' ? 'success' : 'error'} `}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {selectedOption === 'opt_correct_he' ? (
                language === 'Hindi'
                  ? "बहुत बढ़िया! Singular subjects (He/She/It) के साथ हम 'is' + verb+ing का उपयोग करते हैं।"
                  : "Excellent! With singular subjects (He/She/It), we use 'is' + verb+ing."
              ) : (
                language === 'Hindi'
                  ? "गलत! 'am' सिर्फ 'I' के साथ इस्तेमाल होता है। He/She/It के साथ 'is' आता है।"
                  : "Oops! 'am' is only used with 'I'. For He/She/It, use 'is'."
              )}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              setCurrentStep(4);
              setIsChecked(false);
              setSelectedOption(null);
            }}
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Pop Quiz Section 4 */}
      {currentStep === 4 && (
        <div className="quiz-container">
          <div className="quiz-header">
            POP QUIZ
          </div>
          <div className="quiz-content">

            {/* Grammar Box for You/We/They */}
            <div className="grammar-box" style={{ marginBottom: '20px' }}>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Present continuous tense :</span>
                <span>You / We / They</span>
                <span>are</span>
                <span className="grammar-purple-text">[verb]-ing</span>
              </div>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 1:</span>
                <span>You</span>
                <span>are</span>
                <span className="grammar-purple-text">playing</span>
              </div>
              <div className="grammar-row divider">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 2:</span>
                <span>We</span>
                <span>are</span>
                <span className="grammar-purple-text">reading</span>
              </div>
              <div className="grammar-row">
                <span style={{ color: '#64748b', fontSize: '13px' }}>Example 3:</span>
                <span>They</span>
                <span>are</span>
                <span className="grammar-purple-text">running</span>
              </div>
            </div>

            <div className="quiz-question-row">
              <button className="quiz-audio-btn" onClick={handleAudioPlay}>
                <Volume2 size={24} strokeWidth={2.5} />
              </button>
              <div className="quiz-question-text">
                {language === 'Hindi'
                  ? '"You", "We" या "They" के साथ present continuous tense का सही structure क्या है?'
                  : 'What is the correct present continuous tense structure with "You", "We" or "They"?'
                }
              </div>
            </div>

            <div className="quiz-options">
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_wrong_they'
                  ? (isChecked ? 'wrong' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_wrong_they')}
              >
                They is running
              </button>
              <button
                className={`quiz-option-btn ${selectedOption === 'opt_correct_they'
                  ? (isChecked ? 'selected' : 'selected')
                  : ''
                  } `}
                onClick={() => !isChecked && setSelectedOption('opt_correct_they')}
              >
                They are running
              </button>
            </div>

            <button
              className="btn-primary"
              disabled={!selectedOption || isChecked}
              onClick={() => setIsChecked(true)}
              style={{ marginTop: '0' }}
            >
              CHECK
            </button>
          </div>
        </div>
      )}

      {/* Quiz 4 Result Block */}

      {currentStep === 4 && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${selectedOption === 'opt_correct_they' ? 'success' : 'error'} `}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {selectedOption === 'opt_correct_they' ? (
                language === 'Hindi'
                  ? "शाबाश! Plural subjects (You/We/They) के साथ हम 'are' + verb+ing का उपयोग करते हैं।"
                  : "Brilliant! With plural subjects (You/We/They), we use 'are' + verb+ing."
              ) : (
                language === 'Hindi'
                  ? "गलत! 'is' singular subjects के लिए है। Plural subjects (They) के साथ 'are' का उपयोग करें।"
                  : "Oops! 'is' is for singular subjects. For plural subjects (They), use 'are'."
              )}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              setCurrentStep(5);
              setIsChecked(false);
              setSelectedOption(null);
            }}
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Arrange Words Quizzes (Steps 5, 6, 7) */}
      {[5, 6, 7].includes(currentStep) && (
        <div className="quiz-container">
          <div className="quiz-content" style={{ padding: '0px' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
                Words को translate और arrange करें
              </div>

              <div className="quiz-question-row" style={{ alignItems: 'center' }}>
                <img src="/avatar.png" alt="Avatar Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid #2a2e47' }} onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Annie'; }} />
                <div className="chat-bubble flex-row" style={{ background: '#1e2136', border: '1px solid #2a2e47', padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '0', flex: 1, gap: '12px', marginLeft: '12px' }}>
                  <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0', paddingRight: '8px' }}>
                    <Volume2 size={24} strokeWidth={2.5} />
                  </button>
                  <span style={{ fontSize: '15px', color: '#f8fafc', fontWeight: '600' }}>
                    {arrangeQuizzes[currentStep].hin}
                  </span>
                </div>
              </div>

              {/* Hint Box */}
              <div className="hint-card flex-col" style={{ background: 'rgba(56, 189, 248, 0.05)', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div className="flex-row" style={{ alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
                  <Lightbulb size={20} color="#38bdf8" style={{ marginRight: '8px' }} />
                  <span style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>HINT: TIME WORDS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '16px' }}>
                  {/* IN */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#a78bfa', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>in</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Months <span style={{ color: '#94a3b8', fontWeight: '400' }}>(July)</span></div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Years <span style={{ color: '#94a3b8', fontWeight: '400' }}>(2002)</span></div>
                  </div>
                  {/* ON */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#34d399', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>on</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Days <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Sunday)</span></div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Dates <span style={{ color: '#94a3b8', fontWeight: '400' }}>(14th Feb)</span></div>
                  </div>
                  {/* AT */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#38bdf8', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>at</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Time <span style={{ color: '#94a3b8', fontWeight: '400' }}>(7 PM)</span></div>
                  </div>
                  {/* NO PREPOSITION */}
                  <div className="flex-col" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', padding: '12px', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '4px', width: 'fit-content' }}>
                      <span style={{ color: '#ef4444', fontSize: '15px', fontWeight: '800' }}>in, on, at</span>
                      <div style={{ position: 'absolute', top: '50%', left: '-5%', width: '110%', height: '2px', background: '#ef4444', transform: 'translateY(-50%) rotate(-8deg)' }}></div>
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>today, tomorrow,</div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>yesterday</div>
                  </div>
                </div>
              </div>

              {/* Drop area */}
              <div className="drop-area-container" style={{ minHeight: '120px', borderBottom: '1px solid #2a2e47', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start', paddingBottom: '12px' }}>
                {arrangedWords.map((w) => (
                  <button key={`arr-${w}`} className="word-btn" onClick={() => handleWordClick(w, 'arranged')}>{w}</button>
                ))}
              </div>

              {/* Extra words */}
              <div className="extra-words-section">
                <div className="flex-row justify-between" style={{ marginBottom: '16px' }}>
                  <div className="flex-row" style={{ gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>
                    <Zap size={16} /> Extra words
                  </div>
                  <button onClick={handleResetWords} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2e47', padding: '6px', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Undo size={16} />
                  </button>
                </div>
                <div className="available-words" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-start', minHeight: '120px', alignContent: 'flex-start' }}>
                  {availableWords.map((w) => (
                    <button key={`avail-${w}`} className="word-btn" onClick={() => handleWordClick(w, 'available')}>{w}</button>
                  ))}
                </div>
              </div>

              <div className="flex-row" style={{ gap: '12px', marginTop: '32px' }}>
                <button onClick={handleAutoSolve} className="hint-btn-box" style={{ background: '#38bdf8', border: 'none', borderRadius: '16px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>
                  <Lightbulb size={24} color="#000" fill="#000" />
                </button>
                <button
                  className="btn-primary"
                  disabled={arrangedWords.length === 0 || isChecked}
                  onClick={() => setIsChecked(true)}
                  style={{ marginTop: '0' }}
                >
                  CHECK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arrange Quizzes Result Block */}
      {[5, 6, 7].includes(currentStep) && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${isArrangementCorrect ? 'success' : 'error'}`} style={{ marginTop: '24px' }}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {isArrangementCorrect ? (
                language === 'Hindi'
                  ? `Excellent! '${arrangeQuizzes[currentStep].eng}' बिल्कुल सही है।`
                  : `Excellent! '${arrangeQuizzes[currentStep].eng}' is correct.`
              ) : (
                language === 'Hindi'
                  ? `Oops! सही जवाब है: '${arrangeQuizzes[currentStep].eng}'.`
                  : `Oops! The correct answer is: '${arrangeQuizzes[currentStep].eng}'.`
              )}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              setCurrentStep(currentStep + 1);
              setIsChecked(false);
            }}
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Speaking Quizzes (Steps 8, 9, 10) */}
      {[8, 9, 10].includes(currentStep) && (
        <div className="quiz-container">
          <div className="quiz-content" style={{ padding: '0px' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
                {!isSpeakingPhase ? "Words को translate और arrange करें" : speakQuizzes[currentStep].speakHin}
              </div>

              <div className="quiz-question-row" style={{ alignItems: 'center' }}>
                <img src="/avatar.png" alt="Avatar Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid #2a2e47' }} onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Annie'; }} />
                <div className="chat-bubble flex-row" style={{ background: '#1e2136', border: '1px solid #2a2e47', padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '0', flex: 1, gap: '12px', marginLeft: '12px' }}>
                  <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0', paddingRight: '8px' }}>
                    <Volume2 size={24} strokeWidth={2.5} />
                  </button>
                  <span style={{ fontSize: '15px', color: '#f8fafc', fontWeight: '600' }}>
                    {!isSpeakingPhase ? speakQuizzes[currentStep].arrangeHin : speakQuizzes[currentStep].eng}
                  </span>
                </div>
              </div>

              {/* Hint Box (Same as before) */}
              <div className="hint-card flex-col" style={{ background: 'rgba(56, 189, 248, 0.05)', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div className="flex-row" style={{ alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
                  <Lightbulb size={20} color="#38bdf8" style={{ marginRight: '8px' }} />
                  <span style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>HINT: TIME WORDS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '16px' }}>
                  {/* IN */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#a78bfa', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>in</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Months <span style={{ color: '#94a3b8', fontWeight: '400' }}>(July)</span></div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Years <span style={{ color: '#94a3b8', fontWeight: '400' }}>(2002)</span></div>
                  </div>
                  {/* ON */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#34d399', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>on</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Days <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Sunday)</span></div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Dates <span style={{ color: '#94a3b8', fontWeight: '400' }}>(14th Feb)</span></div>
                  </div>
                  {/* AT */}
                  <div className="flex-col" style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#38bdf8', fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>at</div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Time <span style={{ color: '#94a3b8', fontWeight: '400' }}>(7 PM)</span></div>
                  </div>
                  {/* NO PREPOSITION */}
                  <div className="flex-col" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', padding: '12px', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '4px', width: 'fit-content' }}>
                      <span style={{ color: '#ef4444', fontSize: '15px', fontWeight: '800' }}>in, on, at</span>
                      <div style={{ position: 'absolute', top: '50%', left: '-5%', width: '110%', height: '2px', background: '#ef4444', transform: 'translateY(-50%) rotate(-8deg)' }}></div>
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>today, tomorrow,</div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>yesterday</div>
                  </div>
                </div>
              </div>

              {!isSpeakingPhase ? (
                <>
                  {/* Arrange Words UI */}
                  <div className="drop-area-container" style={{ minHeight: '120px', borderBottom: '1px solid #2a2e47', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start', paddingBottom: '12px' }}>
                    {arrangedWords.map((w, i) => (
                      <button key={`arr-${i}`} className="word-btn" onClick={() => handleWordClick(w, 'arranged')}>{w}</button>
                    ))}
                  </div>

                  <div className="extra-words-section">
                    <div className="flex-row justify-between" style={{ marginBottom: '16px' }}>
                      <div className="flex-row" style={{ gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>
                        <Zap size={16} /> Extra words
                      </div>
                      <button onClick={handleResetWords} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2e47', padding: '6px', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Undo size={16} />
                      </button>
                    </div>
                    <div className="available-words" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-start', minHeight: '120px', alignContent: 'flex-start' }}>
                      {availableWords.map((w, i) => (
                        <button key={`avail-${i}`} className="word-btn" onClick={() => handleWordClick(w, 'available')}>{w}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-row" style={{ gap: '12px', marginTop: '32px' }}>
                    <button onClick={handleAutoSolve} className="hint-btn-box" style={{ background: '#38bdf8', border: 'none', borderRadius: '16px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>
                      <Lightbulb size={24} color="#000" fill="#000" />
                    </button>
                    <button
                      className="btn-primary"
                      disabled={arrangedWords.length === 0 || isChecked}
                      onClick={() => {
                        if (isArrangementCorrect) {
                          setIsSpeakingPhase(true);
                        } else {
                          setIsChecked(true);
                        }
                      }}
                      style={{ marginTop: '0' }}
                    >
                      CHECK
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Dashed Word Container for Speaking */}
                  <div style={{ border: '2px dashed #10b981', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '16px', minHeight: '120px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                      {speakQuizzes[currentStep].correctArr.map((w, i) => (
                        <div key={i} style={{ background: 'transparent', border: '2px solid rgba(139, 92, 246, 0.5)', borderRadius: '8px', padding: '8px 16px', color: '#f8fafc', fontSize: '16px', fontWeight: '600' }}>
                          {w}
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '100%' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px', fontWeight: '700' }}>
                      Now say this sentence aloud
                    </div>
                  </div>

                  {/* Mic Button Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
                    <div style={{ background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', padding: '6px 16px', color: isListening ? '#ef4444' : '#10b981', fontSize: '13px', fontWeight: '600', marginBottom: '12px', transition: 'all 0.3s' }}>
                      {isListening ? 'Listening...' : 'Tap and speak'}
                    </div>
                    <button
                      onClick={startListening}
                      disabled={isListening}
                      style={{ background: isListening ? '#ef4444' : '#8b5cf6', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${isListening ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`, transition: 'all 0.2s', cursor: isListening ? 'default' : 'pointer', opacity: isListening ? 0.8 : 1 }}
                      // scaling removed per user request
                    >
                      <Mic size={32} color="#fff" strokeWidth={isListening ? 3 : 2.5} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Speaking Quizzes Result Block */}
      {[8, 9, 10].includes(currentStep) && isChecked && (
        <div ref={resultRef} className={`quiz-result-box ${!isSpeakingPhase ? 'error' : (isSpeechCorrect ? 'success' : 'error')}`} style={{ marginTop: '24px' }}>
          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0 }}>
              {!isSpeakingPhase ? (
                language === 'Hindi'
                  ? `Oops! सही जवाब है: '${speakQuizzes[currentStep].eng}'.`
                  : `Oops! The correct answer is: '${speakQuizzes[currentStep].eng}'.`
              ) : isSpeechCorrect ? (
                language === 'Hindi'
                  ? `Excellent! आपने बिल्कुल सही बोला: '${speakQuizzes[currentStep].eng}'`
                  : `Excellent! You said it perfectly: '${speakQuizzes[currentStep].eng}'`
              ) : (
                language === 'Hindi'
                  ? `Oops! आपने सही नहीं बोला। कोशिश करें: '${speakQuizzes[currentStep].eng}'`
                  : `Oops! That didn't sound quite right. Try saying: '${speakQuizzes[currentStep].eng}'`
              )}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              if (!isSpeakingPhase) {
                // Fix arrangement and transition to speaking phase
                setArrangedWords(speakQuizzes[currentStep].correctArr);
                setIsSpeakingPhase(true);
                setIsChecked(false);
              } else {
                if (isSpeechCorrect) {
                  setCurrentStep(currentStep + 1);
                  setIsChecked(false);
                  setIsSpeakingPhase(false);
                  setIsSpeechCorrect(null);
                } else {
                  setIsChecked(false);
                  setIsSpeechCorrect(null);
                }
              }
            }}
          >
            {!isSpeakingPhase ? "CONTINUE TO SPEAKING" : (isSpeechCorrect ? "CONTINUE" : "TRY AGAIN")}
          </button>
        </div>
      )}

      {/* Final Step: Ready for Practice */}
      {currentStep === 11 && (
        <div className="quiz-container" style={{ padding: '24px' }}>
          <div className="visual-aid" style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/present_continuous.png" alt="Concept Illustration" className="concept-image" style={{ height: '200px' }} />
          </div>

          <div className="quiz-result-row">
            <button className="quiz-audio-btn" onClick={handleAudioPlay} style={{ paddingTop: '0' }}>
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
            <div className="quiz-result-text" style={{ marginBottom: 0, fontSize: '16px' }}>
              {language === 'Hindi'
                ? "Cool, आपने rules समझ लिए। अब practice करते हैं ताकि आप इसे न भूलें।"
                : "Cool, you've understood the rules. Now let's practice so you don't forget it."
              }
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => alert("Starting interactive practice session...")}>
            START PRACTICE
          </button>
        </div>
      )}
    </div>
  );
}

export default ConceptExplanation;
