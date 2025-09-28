import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

/**
 * Calculate local metrics from transcript data
 * @param transcripts - Array of transcript objects with role and message
 * @returns Object containing calculated local metrics
 */
export function calculateLocalMetrics(transcripts: { role: string; message: string }[]) {
    const userMessages = transcripts.filter((t) => t.role === "user")

    const totalWords = userMessages.reduce((sum, msg) => sum + msg.message.split(/\s+/).length, 0)
    const avgWords = totalWords / (userMessages.length || 1)

    const uniqueWords = new Set(userMessages.flatMap((m) => m.message.toLowerCase().split(/\s+/)))
    const vocabRichness = (uniqueWords.size / (totalWords || 1)) * 100

    // Placeholder clarity: assume 100% for demo
    const clarity = 100

    // Placeholder latency: avg seconds between agent question & user reply
    const avgLatency = "2.5s"

    return {
        avgLatency,
        avgWords: avgWords.toFixed(1),
        vocabRichness: vocabRichness.toFixed(1) + "%",
        clarity: clarity.toFixed(1) + "%",
    }
}

/**
 * Calculate final score from local and AI metrics
 * @param localMetrics - Local calculated metrics
 * @param aiMetrics - AI/LLM generated metrics
 * @returns Final score as a number
 */
export function calculateFinalScore(localMetrics: any, aiMetrics: any) {
    // If LLM response has "scores" nested, unwrap it
    const scores = aiMetrics.scores || aiMetrics;

    const localScore =
        (parseFloat(localMetrics.avgWords) +
            parseFloat(localMetrics.vocabRichness) / 10 +
            parseFloat(localMetrics.clarity)) / 3;

    const aiScore =
        (scores.correctness +
            scores.relevance +
            scores.completeness +
            scores.confidence +
            scores.professionalism) / 5;

    return Math.round(0.4 * localScore + 0.6 * aiScore);
}

/**
 * Get AI analysis of interview transcript using OpenAI
 * @param parsedTranscript - Parsed transcript array
 * @returns AI metrics object with scores and recommendation
 */
export async function getAIAnalysis(parsedTranscript: any[]) {
    console.log("Querying LLM for subjective metrics...")

    const prompt = `
You are an interview evaluator. Analyze the following candidate transcript:

${JSON.stringify(parsedTranscript, null, 2)}

Provide scores (1–10) for:
- correctness
- relevance
- completeness
- confidence
- professionalism

Then give a final recommendation: Hire / Maybe / Reject.
Respond in JSON format.
  `

    const llmResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        temperature: 0,
    })

    const llmContent = llmResponse.choices[0].message?.content || ""
    // Remove any unexpected characters (e.g., backticks) from the response
    const sanitizedContent = llmContent.replace(/```json|```/g, "").trim()
    let aiMetrics = JSON.parse(sanitizedContent)

    // After JSON.parse of LLM response
    if (aiMetrics.scores) {
        aiMetrics = { ...aiMetrics.scores, recommendation: aiMetrics.recommendation }
    }

    console.log("LLM metrics received:", aiMetrics)
    return aiMetrics
}

/**
 * Process transcript and generate complete analysis
 * @param transcript - Raw transcript string or array
 * @returns Object containing analysis data and final score
 */
export async function processTranscriptAnalysis(transcript: string | any[]) {
    // Ensure the transcript is parsed correctly
    let parsedTranscript
    try {
        if (typeof transcript === "string") {
            parsedTranscript = JSON.parse(transcript)
        } else if (Array.isArray(transcript)) {
            parsedTranscript = transcript
        } else {
            throw new Error("Invalid transcript format")
        }
    } catch (error) {
        console.error("Error parsing transcript:", error)
        throw new Error("Invalid transcript format")
    }

    // Step 1: Calculate local metrics
    console.log("Calculating local metrics...")
    const localMetrics = calculateLocalMetrics(parsedTranscript)
    console.log("Local metrics calculated:", localMetrics)

    // Step 2: Query LLM for subjective metrics
    const aiMetrics = await getAIAnalysis(parsedTranscript)

    // Step 3: Calculate final score
    console.log("Calculating final score...")
    const finalScore = calculateFinalScore(localMetrics, aiMetrics)
    console.log("Final score calculated:", finalScore)

    return {
        analysis: {
            localMetrics,
            aiMetrics,
        },
        finalScore: {
            score: finalScore,
            breakdown: {
                ...localMetrics,
                ...aiMetrics,
            },
            interpretation: aiMetrics.recommendation,
        }
    }
}