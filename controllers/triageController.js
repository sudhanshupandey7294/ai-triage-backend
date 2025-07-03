// const Patient = require("../models/Patient");
// require("dotenv").config();
// // Polyfill for fetch in Node.js
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// globalThis.fetch = fetch;

// const { CohereClient } = require("cohere-ai");

// const cohere = new CohereClient({
//   token: process.env.COHERE_API_KEY,
// });

// exports.assessPatient = async (req, res) => {
//   try {
//     const { name, age, gender, symptoms, vitals } = req.body;

//     const prompt = `
// You are a hospital triage assistant.

// Patient Info:
// - Name: ${name}
// - Age: ${age}
// - Gender: ${gender}
// - Symptoms: ${symptoms.join(", ")}
// - Vitals: ${JSON.stringify(vitals)}

// Respond ONLY in valid JSON format:
// {
//   "urgencyLevel": "low | moderate | critical",
//   "recommendation": "short sentence",
//   "scoreBreakdown": {
//     "Respiratory": 0-10,
//     "Cardiac": 0-10,
//     "General": 0-10
//   }
// }
// `;

//     const result = await cohere.generate({
//       model: "command",
//       prompt,
//       maxTokens: 300,
//       temperature: 0.5,
//     });

//     const text = result.generations[0].text.trim();
//     console.log("🧠 Cohere Response:", text);

//     // const cleaned = text.replace(/```json|```/g, "").trim();
//     // const aiResponse = JSON.parse(cleaned);
// // Extract JSON object using RegExp
// const jsonMatch = text.match(/\{[\s\S]*?\}/);


//     const newPatient = await Patient.create({
//       name,
//       age,
//       gender,
//       symptoms,
//       vitals,
//       urgencyScore: {
//         level: aiResponse.urgencyLevel,
//         scoreBreakdown: aiResponse.scoreBreakdown,
//       },
//     });

//     res.status(200).json({
//       ...newPatient._doc,
//       recommendation: aiResponse.recommendation,
//     });
//   } catch (err) {
//     console.error("❌ TRIAGE ERROR:", err.message);
//     res.status(500).json({ error: "Triage failed", detail: err.message });
//   }
// };
const Patient = require("../models/Patient");
require("dotenv").config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
globalThis.fetch = fetch;

const { CohereClient } = require("cohere-ai");
const JSON5 = require("json5");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// ✅ Helper: Safely extract valid JSON from messy AI response
function safeJsonExtract(text) {
  const match = text.match(/\{[\s\S]*\}/); // greedy match
  if (!match) throw new Error("❌ No JSON block found");

  let json = match[0];

  // Fix: balance braces if response is cut off
  const openBraces = (json.match(/{/g) || []).length;
  const closeBraces = (json.match(/}/g) || []).length;

  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    json += "}".repeat(missing);
  }

  return json;
}

exports.assessPatient = async (req, res) => {
  try {
    const { name, age, gender, symptoms, vitals } = req.body;

    const prompt = `
You are a hospital triage AI assistant helping prioritize patients.

Patient Info:
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms.join(", ")}
- Vitals: ${JSON.stringify(vitals)}

Respond only in valid JSON, no explanation:
{
  "urgencyLevel": "low" | "moderate" | "critical",
  "recommendation": "short sentence",
  "scoreBreakdown": {
    "Respiratory": 0-10,
    "Cardiac": 0-10,
    "General": 0-10
  }
}
`;

    const result = await cohere.generate({
      model: "command",
      prompt,
      maxTokens: 150,
      temperature: 0.4,
    });

    const text = result.generations[0].text.trim();
    console.log("🧠 Cohere Response:", text);

    const safeJson = safeJsonExtract(text);

    let aiResponse;
    try {
      aiResponse = JSON5.parse(safeJson);
    } catch (err) {
      console.error("❌ JSON5 PARSE ERROR:", err.message);
      throw new Error("AI returned invalid or incomplete JSON.");
    }

    const newPatient = await Patient.create({
      name,
      age,
      gender,
      symptoms,
      vitals,
      urgencyScore: {
        level: aiResponse.urgencyLevel,
        scoreBreakdown: aiResponse.scoreBreakdown,
      },
    });

    res.status(200).json({
      ...newPatient._doc,
      recommendation: aiResponse.recommendation,
    });
  } catch (err) {
    console.error("❌ TRIAGE ERROR:", err.message);
    res.status(500).json({ error: "Triage failed", detail: err.message });
  }
};

