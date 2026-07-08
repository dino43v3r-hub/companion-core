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
  link.download = "companion-profile-v0.1.txt";
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
  const combined = userResponses.join(" ").toLowerCase();
  const details = noticeDetails(userResponses);
  const tone = noticeTone(combined);
  const pace = noticePace(userResponses);
  const interests = noticeInterests(combined);

  return `Companion Profile v0.1

What I'm beginning to notice

${details}
${interests}

How your companion should talk with you

Your companion should speak in a ${tone} way. It should leave room for your own words and should not rush to explain, fix, or turn your answers into a category.

${pace}

Things we can keep discovering together

We can keep noticing what brings you ease, what helps you feel understood, and what kinds of conversation feel comfortable over time.

This is only a first sketch from a few answers. You can change it, ignore parts of it, or let it grow slowly.`;
}

function noticeDetails(responses) {
  const averageLength = responses.join(" ").split(/\s+/).filter(Boolean).length / responses.length;

  if (averageLength > 24) {
    return "When something matters to you, you may enjoy having space to tell a little of the story around it.";
  }

  if (averageLength < 10) {
    return "You may like to begin simply, with the option to say more only when it feels right.";
  }

  return "You shared in a steady, natural way, with enough detail for someone to follow without pushing for more.";
}

function noticeTone(text) {
  const reflectiveWords = ["quiet", "remember", "thought", "felt", "feel", "peace", "calm"];
  const activeWords = ["walk", "made", "built", "played", "went", "garden", "work", "music"];
  const hasReflectiveWords = reflectiveWords.some((word) => text.includes(word));
  const hasActiveWords = activeWords.some((word) => text.includes(word));

  if (hasReflectiveWords && !hasActiveWords) {
    return "calm, unhurried, and thoughtful";
  }

  if (hasActiveWords) {
    return "warm, present, and interested";
  }

  return "gentle, clear, and curious";
}

function noticePace(responses) {
  const questionCount = responses.filter((response) => response.includes("?")).length;

  if (questionCount > 0) {
    return "When you ask or wonder about something, your companion should welcome that and stay with the question beside you.";
  }

  return "Your companion should ask small follow-up questions that grow naturally from what you already shared.";
}

function noticeInterests(text) {
  const possibleInterests = [
    ["family", "Time with people close to you may be a meaningful place for conversation."],
    ["friend", "Shared moments with other people may be worth returning to gently."],
    ["music", "Music may be one comfortable doorway into memory, mood, or joy."],
    ["book", "Stories and ideas may give your companion good places to begin."],
    ["garden", "Patient, living things may be part of what gives a day texture for you."],
    ["cook", "Everyday making and familiar comforts may be meaningful to include."]
  ];

  const found = possibleInterests.find(([word]) => text.includes(word));

  if (found) {
    return found[1];
  }

  return "The things you enjoy may come through best when the conversation begins with ordinary moments, not big questions.";
}
