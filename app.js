const welcomeScreen = document.querySelector("#welcome-screen");
const builderScreen = document.querySelector("#builder-screen");
const beginButton = document.querySelector("#begin-button");
const builderCards = document.querySelectorAll(".builder-card");
const handoffScreen = document.querySelector("#handoff-screen");
const packagePanel = document.querySelector("#package-panel");
const profileText = document.querySelector("#profile-text");
const downloadButton = document.querySelector("#download-button");
const copyPackageButton = document.querySelector("#copy-package-button");
const copyMessageButton = document.querySelector("#copy-message-button");
const copyStatus = document.querySelector("#copy-status");
const handoffInstructions = document.querySelector("#handoff-instructions");
const platformButtons = document.querySelectorAll(".platform-button");
const flowError = document.querySelector("#flow-error");

const flowErrorMessage = "Something didn't open correctly. Please refresh and try again.";
const noticeItems = [
  "No account required.",
  "No database is used in this MVP.",
  "Your information is only used while you're using this page.",
  "Companion Core does not permanently store your Companion Package.",
  "Once you copy your package into another AI platform, that platform's own privacy and memory settings apply.",
  "Companion Core is not medical, legal, financial, or emergency advice."
];

const stepOrder = [
  "personName",
  "recentJoy",
  "futureHope",
  "companionPurpose",
  "companionCreation"
];

const state = {
  personName: "",
  recentJoy: "",
  futureHope: "",
  companionPurpose: "",
  companionName: "",
  companionAppearance: "",
  companionPackage: "",
  firstMessage: ""
};

installCompanionNotices();

beginButton.addEventListener("click", () => runFlowStep(() => {
  welcomeScreen.classList.add("hidden");
  builderScreen.classList.remove("hidden");
  showStep("personName");
}));

builderCards.forEach((card) => {
  card.addEventListener("submit", (event) => {
    event.preventDefault();
    runFlowStep(() => handleStep(card));
  });
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
    runFlowStep(() => showPlatformGuide(button.dataset.platform));
  });
});

function runFlowStep(action) {
  try {
    clearFlowError();
    const result = action();

    if (result && typeof result.catch === "function") {
      result.catch((error) => showFlowError(error));
    }
  } catch (error) {
    showFlowError(error);
  }
}

function installCompanionNotices() {
  insertNoticeAfter(welcomeScreen.querySelector(".welcome-copy"));

  builderCards.forEach((card) => {
    const intro = card.querySelector(".builder-copy") || card.querySelector(".eyebrow");
    insertNoticeAfter(intro);
  });

  insertNoticeAfter(handoffScreen.querySelector(".package-note"));
  insertNoticeAfter(packagePanel.querySelector(".package-reminder"));
}

function insertNoticeAfter(anchor) {
  if (!anchor || !anchor.parentElement) {
    return;
  }

  anchor.insertAdjacentElement("afterend", createCompanionNotice());
}

function createCompanionNotice() {
  const notice = document.createElement("section");
  const title = document.createElement("h2");
  const list = document.createElement("ul");

  notice.className = "companion-notice";
  notice.setAttribute("aria-label", "Companion Core Notice");
  title.textContent = "Companion Core Notice";

  noticeItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.appendChild(listItem);
  });

  notice.append(title, list);
  return notice;
}

function handleStep(card) {
  const step = card.dataset.step;
  const data = new FormData(card);

  if (step === "companionCreation") {
    state.companionName = cleanText(data.get("companionName")) || "my companion";
    state.companionAppearance = cleanText(data.get("companionAppearance")) || "something still taking shape";
    showHandoff();
    return;
  }

  state[step] = cleanText(data.get(step));
  showNextStep(step);
}

function showNextStep(currentStep) {
  const nextStep = stepOrder[stepOrder.indexOf(currentStep) + 1];

  if (nextStep) {
    showStep(nextStep);
  }
}

function showStep(step) {
  const hasStep = Array.from(builderCards).some((card) => card.dataset.step === step);

  if (!hasStep) {
    throw new Error(`Unknown builder step: ${step}`);
  }

  builderCards.forEach((card) => {
    const isCurrent = card.dataset.step === step;
    card.classList.toggle("hidden", !isCurrent);

    if (isCurrent) {
      const field = card.querySelector("input, textarea");

      if (field) {
        field.focus();
      }
    }
  });

  handoffScreen.classList.add("hidden");
}

function showHandoff() {
  state.firstMessage = buildFirstMessage();
  state.companionPackage = buildCompanionPackage();
  profileText.textContent = state.companionPackage;

  builderCards.forEach((card) => {
    card.classList.add("hidden");
  });

  packagePanel.classList.add("hidden");
  handoffInstructions.classList.add("hidden");
  handoffInstructions.replaceChildren();
  platformButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  handoffScreen.classList.remove("hidden");
  handoffScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildCompanionPackage() {
  const observations = noticePatterns();
  const support = buildSupportGuidance(observations);
  const unknowns = buildUnknowns();

  return `Companion Package v0.1

This is only the beginning.

Oh... we're going to keep learning together.

This package belongs to ${state.personName}.
Companion Core does not keep this companion here. ${state.personName} chooses where this companion will live.
This is a portable starting point. It can be copied into any AI platform, changed at any time, or ignored where it does not feel right.

Person name

${state.personName}

Something they enjoyed recently

${state.recentJoy}

Something they are looking forward to

${state.futureHope}

What they hope the companion helps them do

${state.companionPurpose}

Companion name

${state.companionName}

How they picture the companion

${state.companionAppearance}

Observed patterns

${formatProfileList(observations.map((observation) => observation.notice))}

How to be a good companion for this person

${support}

Things still unknown

${unknowns}

Suggested first message

${state.firstMessage}

Platform handoff

Choose the AI platform ${state.personName} already uses. Paste this Companion Package there, then send the suggested first message.

This is only a first sketch from a few answers. You can change it, ignore parts of it, or let it grow slowly.`;
}

function buildFirstMessage() {
  return `Hello. My name is ${state.personName}. I would like you to become my AI companion named ${state.companionName}. Companion Core helped me create the Companion Package below. Please use it as a starting point, not a final description. Treat every observation as tentative. Continue learning naturally through our conversations, respect my corrections, and help me think rather than think for me.`;
}

async function showPlatformGuide(platform) {
  platformButtons.forEach((item) => {
    item.classList.toggle("selected", item.dataset.platform === platform);
  });

  try {
    revealPackage();
  } catch (error) {
    showFlowError(error);
    return;
  }

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

function clearFlowError() {
  if (!flowError) {
    return;
  }

  flowError.textContent = "";
  flowError.classList.add("hidden");
}

function showFlowError(error) {
  console.error("Companion Builder flow failed", error);

  if (!flowError) {
    return;
  }

  builderCards.forEach((card) => {
    card.classList.add("hidden");
  });
  handoffScreen.classList.add("hidden");
  flowError.textContent = flowErrorMessage;
  flowError.classList.remove("hidden");
  flowError.scrollIntoView({ behavior: "smooth", block: "start" });
}

function revealPackage() {
  packagePanel.classList.remove("hidden");
  packagePanel.scrollIntoView({ behavior: "smooth", block: "start" });
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

function cleanText(text) {
  return String(text || "").trim().replace(/\s+/g, " ").slice(0, 600);
}

function noticePatterns() {
  const observations = [
    buildJoyObservation(),
    buildHopeObservation(),
    buildPurposeObservation()
  ];
  const extra = buildKeywordObservation();

  if (extra) {
    observations.push(extra);
  }

  return observations;
}

function buildJoyObservation() {
  return {
    id: "recentJoy",
    notice: `When ${state.personName} talked about enjoying "${shorten(state.recentJoy)}," one early pattern is that small real moments may be worth noticing.`,
    support: `Begin with the real details ${state.personName} shares, especially ordinary moments like "${shorten(state.recentJoy)}."`
  };
}

function buildHopeObservation() {
  return {
    id: "futureHope",
    notice: `Looking forward to "${shorten(state.futureHope)}" may point toward what gives ${state.personName} energy or hope right now.`,
    support: `When the conversation turns toward the future, connect it gently to "${shorten(state.futureHope)}" and ask what would make that feel possible.`
  };
}

function buildPurposeObservation() {
  return {
    id: "companionPurpose",
    notice: `${state.personName} hopes this companion can help with "${shorten(state.companionPurpose)}," so support should stay connected to that purpose.`,
    support: `Be useful in ways that serve "${shorten(state.companionPurpose)}," without taking over or deciding for ${state.personName}.`
  };
}

function buildKeywordObservation() {
  const text = `${state.recentJoy} ${state.futureHope} ${state.companionPurpose}`.toLowerCase();
  const patterns = [
    {
      id: "relationships",
      words: ["family", "friend", "daughter", "son", "grand", "wife", "husband", "people", "together"],
      notice: `Relationships may matter here; ${state.personName} mentioned people or shared life in these answers.`,
      support: "Make room for the people and relationships that show up in the conversation."
    },
    {
      id: "making",
      words: ["build", "make", "create", "fix", "cook", "garden", "project", "write", "paint"],
      notice: `Making or shaping something real may matter to ${state.personName}.`,
      support: "Help turn ideas into small, practical steps when that feels welcome."
    },
    {
      id: "calm",
      words: ["calm", "quiet", "peace", "peaceful", "slow", "gentle", "rest"],
      notice: `${state.personName} may value calm space and a pace that does not rush.`,
      support: "Keep the tone calm, ask one thing at a time, and leave room to think."
    },
    {
      id: "thinking",
      words: ["think", "learn", "understand", "idea", "ideas", "plan", "solve", "question"],
      notice: `${state.personName} may want a companion that helps think things through.`,
      support: "Help sort thoughts clearly, but do not think for the person."
    }
  ];

  return patterns.find((pattern) => pattern.words.some((word) => text.includes(word)));
}

function buildSupportGuidance(observations) {
  return formatProfileList(observations.map((observation) => observation.support));
}

function buildUnknowns() {
  return formatProfileList([
    `What helps ${state.personName} feel most understood.`,
    `How ${state.companionName} should respond when something feels hard.`,
    `Which parts of "${shorten(state.companionPurpose)}" matter most over time.`
  ]);
}

function shorten(text) {
  const cleaned = cleanText(text);
  return cleaned.length > 90 ? `${cleaned.slice(0, 87)}...` : cleaned;
}

function formatProfileList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}
