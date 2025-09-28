import VoiceReactiveVisual from '@/components/VoiceReactiveVisual';

export default function TestModularAnimation() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Testing Modular Animation</h1>
      
      <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
        <VoiceReactiveVisual 
          className="bg-black"
          isUserMicOn={true}
          isAgentSpeaking={false}
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>✅ Modular structure implemented:</p>
        <ul className="list-disc list-inside ml-4">
          <li>useThreeScene.ts - Handles Three.js scene setup and management</li>
          <li>useAudioManager.ts - Manages user microphone and agent audio</li>
          <li>useAnimationLoop.ts - Handles animation loop and sphere/camera updates</li>
          <li>VoiceReactiveVisual.tsx - Clean main component using modular hooks</li>
        </ul>
      </div>
    </div>
  );
}