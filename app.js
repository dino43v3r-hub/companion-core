const welcomeScreen = document.querySelector("#welcome-screen");
const conversationScreen = document.querySelector("#conversation-screen");
const beginButton = document.querySelector("#begin-button");
const messages = document.querySelector("#messages");
const replyForm = document.querySelector("#reply-form");
const replyInput = document.querySelector("#reply-input");
const profileCard = document.querySelector("#profile-card");
const profileText = document.querySelector("#profile-text");
const downloadButton = document.querySelector("#download-button");
const copyPackageButton = document.querySelector("#copy-package-button");
const copyMessageButton = document.querySelector("#copy-message-button");
const copyStatus = document.querySelector("#copy-status");
const handoffCard = document.querySelector("#handoff-card");
const handoffInstructions = document.querySelector("#handoff-instructions");
const platformButtons = document.querySelectorAll(".platform-button");

const starterPrompt = "What would you like me to call you?";

const warmReplies = [
  "That sounds like a good place to linger for a moment. What part of it stayed with you?",
  "Thank you for telling me. Was there a small detail in that moment that made it feel good?",
  "I like the way you described that. What do you think made it feel worth remembering?"
];

const state = {
  step: "personName",
  personName: "",
  companionName: "",
  companionAppearance: "",
  userResponses: [],
  replyIndex: 0,
  companionPackage: "",
  firstMessage: ""
};

beginButton.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  conversationScreen.classList.remove("hidden");
  addMessage(starterPrompt, "companion");
  replyInput.focus();
});

replyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = replyInput.value.trim();
  if (!text || state.step === "ready") {
    return;
  }

  addMessage(text, "user");
  replyInput.value = "";

  window.setTimeout(() => {
    handleReply(text);
  }, 450);
});

downloadButton.addEventListener("click", () => {
  const file = new Blob([state.companionPackage], { type: "text/plain" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = "companion-package-v0-1.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

copyPackageButton.addEventListener("click", () => {
  copyText(state.companionPackage, "Your Companion Package is copied.");
});

copyMessageButton.addEventListener("click", () => {
  copyText(state.firstMessage, "The first message is copied.");
});

platformButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPlatformGuide(button.dataset.platform);
  });
});

function handleReply(text) {
  if (state.step === "personName") {
    state.personName = cleanName(text) || "friend";
    state.step = "conversation";
    addMessage(`Thanks, ${state.personName}. Let's spend a few minutes talking. What's something you've enjoyed recently?`, "companion");
    return;
  }

  if (state.step === "conversation") {
    state.userResponses.push(text);

    if (state.userResponses.length >= 4) {
      state.step = "companionName";
      addMessage("What would you like your companion to be called?", "companion");
      return;
    }

    const reply = warmReplies[Math.min(state.replyIndex, warmReplies.length - 1)];
    state.replyIndex += 1;
    addMessage(reply, "companion");
    return;
  }

  if (state.step === "companionName") {
    state.companionName = cleanName(text) || "my companion";
    state.step = "companionAppearance";
    addMessage("Would you like your companion to have a particular form or appearance? It could be a dinosaur, a bee, an owl, a car, a lighthouse, or nothing at all.", "companion");
    return;
  }

  if (state.step === "companionAppearance") {
    state.companionAppearance = text || "nothing in particular";
    showCompanionPackage();
  }
}

function addMessage(text, sender) {
  const message = document.createElement("article");
  const paragraph = document.createElement("p");

  message.className = `message ${sender}`;
  paragraph.textContent = text;
  message.appendChild(paragraph);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function showCompanionPackage() {
  state.step = "ready";
  state.firstMessage = buildFirstMessage();
  state.companionPackage = buildCompanionPackage();

  addMessage("I made your Companion Package. The next step is choosing where your companion will live.", "companion");
  profileText.textContent = state.companionPackage;
  profileCard.classList.remove("hidden");
  handoffCard.classList.remove("hidden");
  replyInput.disabled = true;
  replyInput.placeholder = "Your Companion Package is ready.";
  replyForm.querySelector("button").disabled = true;
  profileCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildCompanionPackage() {
  const observations = noticePatterns(state.userResponses);
  const support = buildSupportGuidance(observations);
  const discovery = buildDiscoveryGuidance(observations);

  return `Companion Package v0.1

This package belongs to ${state.personName}.
Companion Core does not keep this companion here. ${state.personName} chooses where this companion will live.
This is a portable starting point. It can be copied into any AI platform, changed at any time, or ignored where it does not feel right.

Person name

${state.personName}

Companion name

${state.companionName}

Companion appearance

${state.companionAppearance}

Companion Core Profile

This profile was built from a short, warm conversation. Treat it as a beginning, not a final description.

Instructions for the AI Companion

You are becoming ${state.personName}'s AI companion named ${state.companionName}. Use this package gently. Do not treat it as a test result, diagnosis, or fixed identity. Let it guide how you listen, ask questions, and support ${state.personName}. Keep learning naturally from what ${state.personName} says next. Respect corrections.

Observed patterns

${formatProfileList(observations.map((observation, index) => (
    index === 0 ? `From this short conversation, ${observation.notice}` : observation.notice
  )))}

How to be a good companion for this person

${support}

Things still unknown

${discovery}
- Many things are still unknown. Ask gently, notice what changes, and let ${state.personName} lead the pace.

Suggested first message to paste into the chosen AI platform

${state.firstMessage}

How to use this profile

Copy this whole Companion Package into the AI platform ${state.personName} wants to use. Then send the suggested first message.

Saving this in your AI platform

If the AI platform lets ${state.personName} save memories, custom instructions, or project notes, paste this package there. If it does not, keep this text file and paste it into a new conversation when ${state.personName} wants the companion to remember the starting point.

This is only a first sketch from a few answers. You can change it, ignore parts of it, or let it grow slowly.`;
}

function buildFirstMessage() {
  return `Hello. My name is ${state.personName}. I would like you to become my AI companion named ${state.companionName}. Companion Core helped me create the Companion Package below. Please use it as a starting point, not a final description. Treat every observation as tentative. Continue learning naturally through our conversations, respect my corrections, and help me think rather than think for me.`;
}

async function showPlatformGuide(platform) {
  platformButtons.forEach((item) => {
    item.classList.toggle("selected", item.dataset.platform === platform);
  });

  handoffInstructions.textContent = "Opening the guide...";
  handoffInstructions.classList.remove("hidden");

  try {
    const guide = await loadPlatformGuide(platform);
    console.log("Loaded platform guide", platform, guide.platform);
    renderPlatformGuide(guide);
  } catch (error) {
    console.error("Could not load platform guide", { platform, error });
    handoffInstructions.textContent = "I could not open that guide just now. You can still copy your Companion Package and paste it into the AI platform you use.\n\nYour next conversation starts there.";
  }
}

async function loadPlatformGuide(platform) {
  const response = await fetch(`./platform-guides/${platform}.json`);

  if (!response.ok) {
    throw new Error(`Guide not found: ${platform}`);
  }

  const guide = await response.json();

  if (guide.platform !== platform) {
    throw new Error(`Guide platform mismatch: expected ${platform}, received ${guide.platform}`);
  }

  return guide;
}

function renderPlatformGuide(guide) {
  handoffInstructions.replaceChildren();

  handoffInstructions.append(
    createHeading(guide.title),
    createParagraph(guide.description),
    createGuideSection("Best option", guide.best_option),
    createGuideSection("If that isn't available", guide.fallback_option),
    createStepList(guide.numbered_steps),
    createGuideSection("Suggested first message", guide.suggested_first_message),
    createNotes(guide.notes),
    createGuideActions(),
    createParagraph("Your next conversation starts there.")
  );
}

function createHeading(text) {
  const heading = document.createElement("h3");
  heading.textContent = text;
  return heading;
}

function createParagraph(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

function createGuideSection(title, text) {
  const section = document.createElement("section");
  const heading = document.createElement("h4");
  const paragraph = document.createElement("p");

  heading.textContent = title;
  paragraph.textContent = text;
  section.append(heading, paragraph);
  return section;
}

function createStepList(steps) {
  const section = document.createElement("section");
  const heading = document.createElement("h4");
  const list = document.createElement("ol");

  heading.textContent = "Step-by-step instructions";
  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    list.appendChild(item);
  });

  section.append(heading, list);
  return section;
}

function createNotes(notes) {
  const section = document.createElement("section");
  const heading = document.createElement("h4");
  const paragraph = document.createElement("p");

  heading.textContent = "Notes";
  paragraph.textContent = notes;

  section.append(heading, paragraph);
  return section;
}

function createGuideActions() {
  const actions = document.createElement("div");
  const packageButton = document.createElement("button");
  const messageButton = document.createElement("button");

  actions.className = "action-row";
  packageButton.className = "primary-button";
  packageButton.type = "button";
  packageButton.textContent = "Copy my Companion Package";
  packageButton.addEventListener("click", () => {
    copyText(state.companionPackage, "Your Companion Package is copied.");
  });

  messageButton.className = "secondary-button";
  messageButton.type = "button";
  messageButton.textContent = "Copy the first message";
  messageButton.addEventListener("click", () => {
    copyText(state.firstMessage, "The first message is copied.");
  });

  actions.append(packageButton, messageButton);
  return actions;
}

function copyText(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => showCopyStatus(successMessage))
      .catch(() => fallbackCopyText(text, successMessage));
    return;
  }

  fallbackCopyText(text, successMessage);
}

function fallbackCopyText(text, successMessage) {
  const helper = document.createElement("textarea");

  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
  showCopyStatus(successMessage);
}

function showCopyStatus(message) {
  copyStatus.textContent = message;
}

function cleanName(text) {
  return text.trim().replace(/\s+/g, " ").slice(0, 60);
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
    .map((pattern) => {
      const matches = matchedWords(pattern.words, responses);
      return {
        ...pattern,
        matches,
        score: matches.length
      };
    })
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
