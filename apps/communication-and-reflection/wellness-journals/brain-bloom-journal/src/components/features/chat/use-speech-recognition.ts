import { useEffect, useRef, useState, useCallback } from 'react';

export const useSpeechRecognition = (onTranscript: (text: string) => void, onError: (error: any) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          onTranscript(transcript.replace(/[<>]/g, ''));
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event: any) => {
          onError(event);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // * Silently handle stop errors - speech recognition may already be stopped
          console.debug('Speech recognition stop error:', error);
        }
        recognitionRef.current = null;
      }
    };
  }, [onTranscript, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening };
};
