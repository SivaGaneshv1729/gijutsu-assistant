import re

with open('frontend/src/pages/Copilot.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_func = """const handleSpeak = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const cleanText = text.replace(/[*#\\[\\]]/g, '').replace(/citations/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };"""

replace_func = """const handleSpeak = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    
    // Clean markdown and citations
    const cleanText = text.replace(/[*#\\[\\]]/g, '').replace(/citations/g, '');
    
    // Split into smaller chunks (sentences) to prevent browser TTS crashing/silencing on long responses
    const chunks = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    
    chunks.forEach((chunk) => {
      if (chunk.trim().length > 0) {
        const utterance = new SpeechSynthesisUtterance(chunk.trim());
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    });
  };"""

content = content.replace(target_func, replace_func)

with open('frontend/src/pages/Copilot.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("TTS chunking fix applied.")
