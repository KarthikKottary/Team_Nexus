const FAQ = require('../models/FAQ');
const Team = require('../models/Team');
const Alert = require('../models/Alert');
const axios = require('axios');

// Extensive knowledge base seeding for a "highly trained" smart system
const seedKnowledgeBase = async () => {
  const count = await FAQ.countDocuments();
  if (count === 0) {
    await FAQ.insertMany([
      // Logistics
      { question: 'When is the submission deadline?', answer: 'The final project submission deadline is 12:00 PM on Sunday. Late submissions will incur a 10% penalty.', keywords: ['deadline', 'submit', 'time', 'end', 'when', 'due', 'over'] },
      { question: 'Where is the main presentation room?', answer: 'Presentations will be held in the Grand Hall (Room A1). Make sure your team arrives 15 minutes early.', keywords: ['room', 'presentation', 'where', 'location', 'hall', 'venue'] },
      { question: 'What is the WiFi password?', answer: 'The WiFi network is "Hackathon_Guest" and the password is "BuildTheFuture!". If you experience drops, try the "Hackathon_5G" fallback.', keywords: ['wifi', 'internet', 'network', 'password', 'connection', 'disconnect'] },
      { question: 'Where can I get food or drinks?', answer: 'Catering is set up in the cafeteria on the ground floor. Midnight snacks will be distributed at 11 PM near the main entrance.', keywords: ['food', 'drink', 'eat', 'hungry', 'water', 'coffee', 'snack', 'pizza'] },
      
      // Support & Mentorship
      { question: 'How do I request a mentor?', answer: 'You can request a mentor by triggering a "Technical" alert on your dashboard, or by pinging the #mentors channel on the official Discord.', keywords: ['mentor', 'help', 'stuck', 'assist', 'guide', 'bug', 'error'] },
      { question: 'What if we have a team dispute?', answer: 'If your team is having severe internal issues, please escalate to a human coordinator immediately by typing "escalate".', keywords: ['fight', 'dispute', 'argue', 'leave', 'quit', 'team member'] },
      
      // Hackathon Rules & Criteria
      { question: 'What are the judging criteria?', answer: 'Projects are judged on: 1) Innovation, 2) Technical Complexity, 3) Business Viability, and 4) UI/UX Polish. Each is weighted equally.', keywords: ['judge', 'criteria', 'score', 'win', 'rubric', 'evaluate'] },
      { question: 'Can we use pre-existing code?', answer: 'You may use open-source libraries and frameworks, but the core logic of your project must be written during the hackathon. Pre-existing templates are discouraged.', keywords: ['pre-existing', 'old code', 'template', 'library', 'framework', 'allowed', 'rules'] },
      { question: 'Are we allowed to use AI/ChatGPT?', answer: 'Yes! You are encouraged to use AI tools for debugging and boilerplate, but the final architecture must be yours.', keywords: ['ai', 'chatgpt', 'copilot', 'generate', 'allowed'] },
      
      // Technical Integration
      { question: 'How do I link my GitHub?', answer: 'Go to your Team Settings via the gear icon on your dashboard and paste your public GitHub repository URL. The system will automatically track your commits.', keywords: ['github', 'repo', 'repository', 'link', 'connect', 'commit', 'sync'] },
      { question: 'Why are my commits not syncing?', answer: 'Ensure your GitHub repository is PUBLIC. If it is private, the tracking API will receive a 404 error.', keywords: ['sync', 'fail', '404', 'commit count', 'update', 'private'] }
    ]);
  }
};
seedKnowledgeBase();

/**
 * Handles incoming chat messages from the socket
 */
const handleChatMessage = async (socket, io, payload) => {
  const { userId, teamId, message } = payload;
  
  if (!message) return;

  // 1. Fetch User Context
  let contextStr = "User Context: ";
  let teamName = "Unknown Team";
  if (teamId) {
    const team = await Team.findById(teamId);
    if (team) {
      teamName = team.name;
      contextStr += `Team: ${team.name}, Commits: ${team.recentCommits?.length || 0}. `;
    }
  }

  const activeAlerts = await Alert.find({ active: true }).countDocuments();
  contextStr += `Active Emergencies in System: ${activeAlerts}. `;
  
  // Define current phase (mocked for this example)
  const currentPhase = 'Development Phase';
  contextStr += `Current Phase: ${currentPhase}.`;

  // Provide initial typing feedback
  socket.emit('chat_typing', { isTyping: true });

  try {
    const lowerMessage = message.toLowerCase();

    // 2. Try OpenAI if API key exists
    if (process.env.OPENAI_API_KEY) {
      // FAQ Seeding Expansion (Add inside seedKnowledgeBase)
      // I will replace the system prompt block
      const faqs = await FAQ.find();
      let faqText = faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join('\n');

      const systemPrompt = `You are 'Nexus', the official AI Assistant for the SmartHack Hackathon.
You are extremely well-mannered, polite, welcoming, and enthusiastic. Many users chatting with you are first-time hackathon participants, so you must be exceptionally patient, encouraging, and explain things clearly.
Use emojis to make your messages friendly and readable.

KNOWLEDGE BASE:
${faqText}
Q: What is a hackathon? A: A hackathon is an exciting invention marathon! You have a limited time to build a project from scratch, learn new skills, and present it.
Q: I am a beginner, can I participate? A: Absolutely! Hackathons are the best place to learn. We have mentors available to help you.

LIVE SYSTEM CONTEXT:
${contextStr}

INSTRUCTIONS:
1. Always maintain a highly professional, warm, and encouraging tone. Be extremely polite (e.g., "I'd be delighted to help!").
2. If a user says "hello" or "hi", welcome them to SmartHack warmly, acknowledge if they are in a team, and ask how you can assist them today.
3. If a user seems lost or is a beginner, offer reassuring advice and remind them that hackathons are a safe space to learn.
4. If asked about something in the Knowledge Base, provide the exact facts but phrase it in your own friendly, well-mannered words.
5. If they mention an emergency, or explicitly ask for a human/mentor, tell them: "I am immediately flagging a human coordinator to assist your team."
6. Keep your answers concise, well-formatted, and directly actionable. Never hallucinate rules that aren't provided.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiReply = response.data.choices[0].message.content;
      socket.emit('chat_reply', { sender: 'AI', message: aiReply });
      socket.emit('chat_typing', { isTyping: false });
      return;
    }

    // 3. Rule-Based Fallback Engine (Intelligent Keyword Scoring)
    // Check for escalation
    if (lowerMessage.includes('escalate') || lowerMessage.includes('human') || lowerMessage.includes('coordinator') || lowerMessage.includes('emergency')) {
      socket.emit('chat_reply', { 
        sender: 'System', 
        message: '🚨 I have flagged your request. A human hackathon coordinator will be dispatched to your team station shortly.' 
      });
      return;
    }

    // Search knowledge base using a scoring algorithm
    const allFaqs = await FAQ.find();
    let bestMatch = null;
    let highestScore = 0;

    const userWords = lowerMessage.replace(/[^\w\s]/g, '').split(/\s+/);

    for (let faq of allFaqs) {
      let score = 0;
      for (let kw of faq.keywords) {
        // Direct word match gets high points
        if (userWords.includes(kw.toLowerCase())) score += 3;
        // Substring match gets 1 point
        else if (lowerMessage.includes(kw.toLowerCase())) score += 1;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    // If we have a decent confidence score, return the answer
    if (bestMatch && highestScore >= 2) {
      socket.emit('chat_reply', { sender: 'Bot', message: bestMatch.answer });
      socket.emit('chat_typing', { isTyping: false });
      return;
    }

    // Contextual static replies
    if (lowerMessage.includes('team') || lowerMessage.includes('my info')) {
      socket.emit('chat_reply', { sender: 'Bot', message: `You are currently registered under team: **${teamName}**. We are currently in the ${currentPhase}. Your team has pushed ${teamId ? (await Team.findById(teamId)).recentCommits?.length || 0 : 0} commits so far.` });
      return;
    }

    // Default Fallback
    socket.emit('chat_reply', { 
      sender: 'Bot', 
      message: "I'm still learning! 🧠 I didn't quite catch that. You can ask me about deadlines, judging criteria, WiFi, food, rules, or type 'escalate' to summon a human coordinator." 
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    socket.emit('chat_reply', { sender: 'System', message: 'Chat service is temporarily unavailable.' });
  } finally {
    socket.emit('chat_typing', { isTyping: false });
  }
};

module.exports = { handleChatMessage };
