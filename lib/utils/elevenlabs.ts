import { createWriteStream, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { uploadAudioToS3 } from "@/lib/utils/s3"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetches and saves audio file from ElevenLabs conversation
 * @param conversationId - The conversation ID from ElevenLabs
 * @param retries - Number of retry attempts
 * @param delayMs - Delay between retries in milliseconds
 * @returns Object containing local path and S3 URL
 */
export async function fetchAndSaveAudio(
    conversationId: string,
    retries = 5,
    delayMs = 10000
): Promise<{ localPath: string | null, s3Url: string | null }> {
    const uploadsDir = join(process.cwd(), "uploads")

    // Ensure the uploads directory exists
    if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir)
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
                {
                    method: "GET",
                    headers: {
                        "xi-api-key": process.env.XI_API_KEY!,
                    },
                }
            )

            if (response.ok && response.body) {
                const audioFilePath = join(uploadsDir, `${conversationId}.mp3`)

                // Convert ReadableStream to buffer
                const reader = response.body.getReader()
                const chunks: Uint8Array[] = []

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    chunks.push(value)
                }

                // Combine chunks into a single buffer
                const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
                const audioBuffer = new Uint8Array(totalLength)
                let offset = 0

                for (const chunk of chunks) {
                    audioBuffer.set(chunk, offset)
                    offset += chunk.length
                }

                // Save locally first
                const fileStream = createWriteStream(audioFilePath)
                fileStream.write(audioBuffer)
                fileStream.end()

                await new Promise<void>((resolve, reject) => {
                    fileStream.on('finish', () => resolve())
                    fileStream.on('error', reject)
                })

                console.log(`Audio file saved locally on attempt ${attempt} at ${audioFilePath}`)

                // Upload to S3
                let s3Url: string | null = null
                try {
                    console.log(`🎵 Starting audio S3 upload for file: ${conversationId}.mp3`)
                    console.log(`📁 Buffer size: ${audioBuffer.length} bytes`)
                    s3Url = await uploadAudioToS3(audioBuffer, `${conversationId}.mp3`)
                    console.log(`✅ Audio uploaded to S3 successfully: ${s3Url}`)
                } catch (s3Error) {
                    console.error("❌ Failed to upload audio to S3:", s3Error)
                    console.error("S3 Error details:", JSON.stringify(s3Error, null, 2))
                }

                return { localPath: audioFilePath, s3Url }
            }

            const errorData = await response.json()
            console.error(`Attempt ${attempt}: Failed to fetch audio file:`, errorData)

            if (errorData.detail?.status !== "missing_conversation_audio") {
                break // Stop retrying for non-recoverable errors
            }
        } catch (error) {
            console.error(`Attempt ${attempt}: Error fetching audio file:`, error)
        }

        if (attempt < retries) {
            console.log(`Retrying to fetch audio file in ${delayMs / 1000} seconds...`)
            await delay(delayMs)
        }
    }

    console.error("Exhausted all retry attempts to fetch audio file.")
    return { localPath: null, s3Url: null }
}

/**
 * Fetches transcript from ElevenLabs conversation
 * @param conversationId - The conversation ID from ElevenLabs
 * @param retries - Number of retry attempts
 * @param delayMs - Delay between retries in milliseconds
 * @returns Transcript string or null if failed
 */
export async function fetchTranscript(
    conversationId: string,
    retries = 5,
    delayMs = 10000
): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
                {
                    method: "GET",
                    headers: {
                        "xi-api-key": process.env.XI_API_KEY!,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                console.log(`Transcript fetched successfully on attempt ${attempt}`)
                return data.transcript || null
            }

            const errorData = await response.json()
            console.error(`Attempt ${attempt}: Failed to fetch transcript:`, errorData)

            if (errorData.detail?.status !== "missing_conversation_audio") {
                break // Stop retrying for non-recoverable errors
            }
        } catch (error) {
            console.error(`Attempt ${attempt}: Error fetching transcript:`, error)
        }

        if (attempt < retries) {
            console.log(`Retrying to fetch transcript in ${delayMs / 1000} seconds...`)
            await delay(delayMs)
        }
    }

    console.error("Exhausted all retry attempts to fetch transcript.")
    return null
}

/**
 * Deletes conversation from ElevenLabs
 * @param conversationId - The conversation ID to delete
 * @returns Boolean indicating success
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
                method: "DELETE",
                headers: {
                    "xi-api-key": process.env.XI_API_KEY!,
                },
            }
        )

        if (response.ok) {
            console.log(`Conversation ${conversationId} deleted successfully.`)
            return true
        }

        const errorData = await response.json()
        console.error(`Failed to delete conversation ${conversationId}:`, errorData)
        return false
    } catch (error) {
        console.error(`Error deleting conversation ${conversationId}:`, error)
        return false
    }
}