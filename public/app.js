const role = document.getElementById("role");
const jobDescription = document.getElementById("jobDescription");
const experienceLevel = document.getElementById("experienceLevel");
const skills = document.getElementById("skills");
const weakAreas = document.getElementById("weakAreas");

const generateBtn = document.getElementById("generateBtn");
const exampleBtn = document.getElementById("exampleBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");
const results = document.getElementById("results");

exampleBtn.addEventListener("click", () => {
  role.value = "AI/ML Intern";
  experienceLevel.value = "Intern";
  jobDescription.value =
    "We are looking for an AI/ML intern to help build machine learning features. The candidate should understand Python, data preprocessing, supervised learning, model evaluation and basic SQL.";
  skills.value =
    "Python, machine learning, data preprocessing, SQL, model evaluation";
  weakAreas.value =
    "SQL joins, explaining ML projects, behavioral questions";
});

clearBtn.addEventListener("click", () => {
  role.value = "";
  experienceLevel.value = "";
  jobDescription.value = "";
  skills.value = "";
  weakAreas.value = "";
  results.classList.add("hidden");
  status.textContent = "";
});

generateBtn.addEventListener("click", async () => {
  if (!role.value.trim() || !jobDescription.value.trim()) {
    status.textContent = "Please enter the role and job description.";
    return;
  }

  generateBtn.disabled = true;
  status.textContent = "Generating interview plan with local AI...";
  results.classList.add("hidden");

  try {
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: role.value,
        jobDescription: jobDescription.value,
        experienceLevel: experienceLevel.value,
        skills: skills.value,
        weakAreas: weakAreas.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    renderPlan(data);
    status.textContent = "Interview plan generated locally.";
    results.classList.remove("hidden");
  } catch (error) {
    status.textContent = error.message;
  } finally {
    generateBtn.disabled = false;
  }
});

function renderPlan(plan) {
  const questions = document.getElementById("questions");
  const topics = document.getElementById("topics");
  const answers = document.getElementById("answers");
  const followups = document.getElementById("followups");
  const interviewerQuestions = document.getElementById("interviewerQuestions");
  const checklist = document.getElementById("checklist");

  questions.innerHTML = (plan.likelyQuestions || [])
    .map(item => `
      <div class="item">
        <strong>${escapeHtml(item.question)}</strong>
        <div class="meta">${escapeHtml(item.type || "")}</div>
        <div>${escapeHtml(item.whyAsked || "")}</div>
      </div>
    `)
    .join("");

  topics.innerHTML = (plan.technicalTopics || [])
    .map(item => `
      <div class="item">
        <strong>${escapeHtml(item.topic)}</strong>
        <div class="meta">Priority: ${escapeHtml(item.priority || "")}</div>
        <div>${escapeHtml(item.reason || "")}</div>
      </div>
    `)
    .join("");

  answers.innerHTML = (plan.answerGuidance || [])
    .map(item => `
      <div class="item">
        <strong>${escapeHtml(item.question)}</strong>
        <div class="meta">${escapeHtml(item.approach || "")}</div>
        <ul>
          ${(item.keyPoints || [])
            .map(point => `<li>${escapeHtml(point)}</li>`)
            .join("")}
        </ul>
      </div>
    `)
    .join("");

  followups.innerHTML = (plan.followUpQuestions || [])
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");

  interviewerQuestions.innerHTML = (plan.questionsForInterviewer || [])
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");

  checklist.innerHTML = (plan.preparationChecklist || [])
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
