const welcomeScreen = document.querySelector("#welcome-screen");
const conversationScreen = document.querySelector("#conversation-screen");
const beginButton = document.querySelector("#begin-button");
const messages = document.querySelector("#messages");
const replyForm = document.querySelector("#reply-form");
const replyInput = document.querySelector("#reply-input");
const profileCard = document.querySelector("#profile-card");
const profileText = document.querySelector("#profile-text");
const downloadButton = document.querySelector("#download-button");

const starterPrompt = "I'm really glad you're here. We can start small. What's something you've enjoyed recently?";

const warmReplies = [
  "That sounds like a good place to linger for a moment. What part of it stayed with you?",
  "Thank you for telling me. Was there a small detail in that moment that made it feel good?",
  "I like the way you described that. What do you think made it feel worth remembering?",
  "That helps me understand the kind of moments your companion should make room for.",
  "I'm holding onto the feel of what you shared, not as a label, just as a beginning."
];

const userResponses = [];
let replyIndex = 0;
let profileReady = false;

beginButton.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  conversationScreen.classList.remove("hidden");
  addMessage(starterPrompt, "companion");
  replyInput.focus();
});

replyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = replyInput.value.trim();
  if (!text || profileReady) {
    return;
  }

  userResponses.push(text);
  addMessage(text, "user");
  replyInput.value = "";

  window.setTimeout(() => {
    if (userResponses.length >= 4) {
      finishOnboarding();
      return;
    }

    const reply = warmReplies[Math.min(replyIndex, warmReplies.length - 1)];
    replyIndex += 1;
    addMessage(reply, "companion");
  }, 450);
});

downloadButton.addEventListener("click", () => {
  const file = new Blob([profileText.textContent], { type: "text/plain" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = "companion-profile-v0-1.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

function addMessage(text, sender) {
  const message = document.createElement("article");
  const paragraph = document.createElement("p");

  message.className = `message ${sender}`;
  paragraph.textContent = text;
  message.appendChild(paragraph);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function finishOnboarding() {
  profileReady = true;
  addMessage("I made a first gentle sketch from what you shared. It is only a beginning, and it can change as your companion gets to know you better.", "companion");
  profileText.textContent = buildProfile();
  profileCard.classList.remove("hidden");
  replyInput.disabled = true;
  replyInput.placeholder = "Your first profile is ready.";
  replyForm.querySelector("button").disabled = true;
  profileCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildProfile() {
  const observations = noticePatterns(userResponses);
  const support = buildSupportGuidance(observations);
  const discovery = buildDiscoveryGuidance(observations);

  return `Companion Profile v0.1

This profile belongs to the person who created it.
It is a small, portable starting point for an AI Companion.
It can be copied into any AI platform, changed at any time, or ignored where it does not feel right.

Instructions for the AI Companion

Use this profile gently. Do not treat it as a test result, diagnosis, or fixed identity. Let it guide how you listen, ask questions, and support the person. Keep learning from what the person says next.

Observed patterns

${formatProfileList(observations.map((observation, index) => (
    index === 0 ? `From this short conversation, ${observation.notice}` : observation.notice
  )))}

How to work with this person

${support}

Things we can keep discovering together

${discovery}

This is only a first sketch from a few answers. You can change it, ignore parts of it, or let it grow slowly.

How to use this profile

Copy this whole profile into the AI platform you want to use. You can say: "Please use this as a starting point for how you talk with me."

Saving this in your AI platform

If your AI platform lets you save memories, custom instructions, or project notes, paste this profile there. If it does not, keep this text file and paste it into a new conversation when you want your companion to remember the starting point.`;
}

function noticePatterns(responses) {
  const patterns = [
    {
      id: "serving",
      words: ["help", "helped", "support", "serve", "service", "volunteer", "care", "cared", "neighbor", "church", "community"],
      notice: (matches) => `when you mentioned ${formatMatches(matches)}, one early pattern is that meaning may show up when your time or attention helps someone else.`,
      support: "When we explore ideas together, it may help to connect them back to the people they could serve.",
      discovery: "We can keep noticing which kinds of care, service, or encouragement feel most worth your energy."
    },
    {
      id: "making",
      words: ["build", "built", "make", "made", "fix", "fixed", "repair", "create", "created", "cook", "cooked", "garden", "sew", "wood", "project"],
      notice: (matches) => `when you talked about ${formatMatches(matches)}, you seemed to connect meaning with making something real, useful, or cared for.`,
      support: "I should keep our conversations practical, with room to turn thoughts into next steps when that feels helpful.",
      discovery: "We can keep discovering what kinds of making, fixing, or shaping give you a sense of satisfaction."
    },
    {
      id: "relationships",
      words: ["family", "daughter", "son", "grand", "grandchild", "grandkids", "wife", "husband", "friend", "friends", "mother", "father", "sister", "brother"],
      notice: (matches) => `when you mentioned ${formatMatches(matches)}, you seemed to place real meaning in relationships and shared moments.`,
      support: "I should make space for the people in your stories and remember that everyday moments with them may carry real weight.",
      discovery: "We can keep noticing which relationships, memories, and shared routines you want your companion to understand."
    },
    {
      id: "curiosity",
      words: ["wonder", "curious", "learn", "learned", "read", "book", "idea", "ideas", "why", "how", "question", "thinking", "understand"],
      notice: (matches) => `when you brought up ${formatMatches(matches)}, you seemed to enjoy thinking things through rather than rushing past the idea.`,
      support: "When we talk through ideas, I should move at a steady pace and help connect the thought to what matters in daily life.",
      discovery: "We can keep discovering which questions are interesting enough to sit with for a while."
    },
    {
      id: "humor",
      words: ["laugh", "laughed", "funny", "joke", "joked", "humor", "silly", "smile", "smiled"],
      notice: (matches) => `when you mentioned ${formatMatches(matches)}, humor seemed like one way moments become lighter, warmer, or easier to share.`,
      support: "I should leave room for a little lightness when it fits, without forcing cheerfulness.",
      discovery: "We can keep noticing what kinds of humor feel natural and welcome."
    },
    {
      id: "ease",
      words: ["easy", "easier", "simple", "simpler", "organize", "organized", "plan", "planned", "problem", "solve", "solved", "useful", "practical"],
      notice: (matches) => `when you mentioned ${formatMatches(matches)}, you seemed to value practical ways to make life a little easier or more workable.`,
      support: "I should help sort ideas into plain next steps while still leaving room for the bigger reason behind them.",
      discovery: "We can keep discovering what kinds of support would make ordinary tasks feel lighter."
    },
    {
      id: "story",
      words: ["story", "remember", "remembered", "memory", "years", "used to", "when i", "told", "shared"],
      notice: (matches) => `when you shared ${formatMatches(matches)}, you seemed to understand moments through story, memory, or the details around what happened.`,
      support: "I should listen for the story around an answer instead of trying to rush to the point.",
      discovery: "We can keep noticing which memories feel important to return to gently."
    },
    {
      id: "ordinary",
      words: ["coffee", "morning", "walk", "outside", "porch", "music", "meal", "dinner", "breakfast", "tea", "sun", "quiet", "home"],
      notice: (matches) => `when you mentioned ${formatMatches(matches)}, ordinary moments seemed to carry more meaning than they first appear to.`,
      support: "I should treat small daily details as worth noticing, not as filler before the important part.",
      discovery: "We can keep discovering which small routines, places, and sounds help a day feel good."
    },
    {
      id: "calm",
      words: ["calm", "peace", "peaceful", "quiet", "slow", "gentle", "rest", "rested", "still"],
      notice: (matches) => `when you used words like ${formatMatches(matches)}, you may prefer conversation that has room to breathe and does not push too quickly.`,
      support: "I should keep a calm pace, ask one thing at a time, and give you space to answer in your own words.",
      discovery: "We can keep noticing what pace and tone help conversation feel comfortable."
    }
  ];

  const scored = patterns
    .map((pattern) => ({
      ...pattern,
      matches: matchedWords(pattern.words, responses),
      score: matchedWords(pattern.words, responses).length
    }))
    .filter((pattern) => pattern.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((pattern) => ({
      ...pattern,
      notice: pattern.notice(pattern.matches)
    }));

  const fallback = [
    {
      id: "ordinary",
      notice: "you seem to give ordinary moments enough attention for them to become meaningful.",
      support: "I should begin with everyday language and let larger ideas appear naturally from what you share.",
      discovery: "We can keep noticing which parts of daily life feel worth remembering."
    },
    {
      id: "story",
      notice: "you may appreciate being heard through the shape of what happened, not just the short answer.",
      support: "I should listen for details and connections instead of rushing to summarize you.",
      discovery: "We can keep discovering which stories feel important to hold onto."
    },
    {
      id: "calm",
      notice: "you may prefer a companion that stays calm, plainspoken, and patient.",
      support: "I should ask gentle follow-up questions and give you space to decide what matters.",
      discovery: "We can keep learning what makes the conversation feel comfortable and useful."
    }
  ];

  return fillObservations(scored, fallback);
}

function matchedWords(words, responses) {
  const matches = responses.reduce((found, response) => {
    const text = response.toLowerCase();
    return [...found, ...words.filter((word) => text.includes(word))];
  }, []);

  return [...new Set(matches)];
}

function formatMatches(matches) {
  const readable = matches.slice(0, 2);

  if (readable.length === 1) {
    return readable[0];
  }

  return `${readable[0]} and ${readable[1]}`;
}

function fillObservations(scored, fallback) {
  const observations = [...scored];

  fallback.forEach((item) => {
    if (observations.length < 3 && !observations.some((pattern) => pattern.id === item.id)) {
      observations.push(item);
    }
  });

  return observations.slice(0, 3);
}

function buildSupportGuidance(observations) {
  return formatProfileList(observations
    .slice(0, 2)
    .map((observation) => observation.support));
}

function buildDiscoveryGuidance(observations) {
  return formatProfileList(observations
    .map((observation) => observation.discovery));
}

function formatProfileList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}
