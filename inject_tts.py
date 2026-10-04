import re

with open('frontend/src/pages/Copilot.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Volume2 to lucide imports
content = re.sub(
    r'(import\s*\{.*?)(Mic,)(.*?\}\s*from\s*[\'"]lucide-react[\'"])',
    r'\1\2 Volume2,\3',
    content,
    flags=re.DOTALL
)

# 2. Add handleSpeak function inside the component
target_func_insert = "const handleSend = async () => {"
replace_func_insert = """const handleSpeak = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const cleanText = text.replace(/[*#_\\[\\]]/g, '').replace(/citations/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {"""
content = content.replace(target_func_insert, replace_func_insert)

# 3. Add Speak button to the Action Row
target_action_row = """{/* Action Row */}
                            <div className="flex items-center gap-3 text-slate-500 mt-1">"""
replace_action_row = """{/* Action Row */}
                            <div className="flex items-center gap-3 text-slate-500 mt-1">
                                <button 
                                  onClick={() => handleSpeak(msg.content)} 
                                  className="p-1 hover:text-white transition-colors"
                                  title="Read Aloud"
                                >
                                  <Volume2 size={14} />
                                </button>"""
content = content.replace(target_action_row, replace_action_row)

with open('frontend/src/pages/Copilot.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Text-to-Speech (Voice Commands) added successfully.")
