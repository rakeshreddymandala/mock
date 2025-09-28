import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { Analyser } from '@/lib/design/analyser';
import { fs as backdropFS, vs as backdropVS } from '@/lib/design/backdrop-shader';
import { vs as sphereVS } from '@/lib/design/sphere-shader';

interface VoiceReactiveVisualProps {
  elevenLabsAudio?: string | null;
  isAgentSpeaking: boolean;
  onAgentAudioEnd?: () => void;
  onSystemAudioElementReady?: (element: HTMLAudioElement) => void;
  mediaStream?: MediaStream | null; // Add mediaStream prop for mic muting
  className?: string;
}

export default function VoiceReactiveVisual({ 
  elevenLabsAudio,
  isAgentSpeaking,
  onAgentAudioEnd,
  onSystemAudioElementReady,
  mediaStream,
  className = '' 
}: VoiceReactiveVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    composer?: EffectComposer;
    sphere?: THREE.Mesh;
    backdrop?: THREE.Mesh;
    analyser?: Analyser;
    animationId?: number;
    audioElement?: HTMLAudioElement;
    audioContext?: AudioContext;
    rotation?: THREE.Vector3;
    prevTime?: number;
  }>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [micWasMuted, setMicWasMuted] = useState(false); // Track if we muted the mic

  // Microphone muting functions
  const muteUserMicrophone = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack && audioTrack.enabled) {
        console.log("🔇 Muting user microphone during agent speech");
        audioTrack.enabled = false;
        setMicWasMuted(true);
      }
    }
  };

  const unmuteUserMicrophone = () => {
    if (mediaStream && micWasMuted) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack && !audioTrack.enabled) {
        console.log("🔊 Unmuting user microphone after agent speech");
        audioTrack.enabled = true;
        setMicWasMuted(false);
      }
    }
  };

  // Handle agent audio playback and animation
  useEffect(() => {
    console.log("🎨 VoiceReactiveVisual props changed:", {
      elevenLabsAudio,
      isAgentSpeaking,
      audioLength: elevenLabsAudio?.length
    })
    
    // Clean up previous audio when new audio comes in
    if (sceneRef.current.audioElement) {
      sceneRef.current.audioElement.pause();
      sceneRef.current.audioElement = undefined;
      sceneRef.current.analyser = undefined;
    }
    
    if (elevenLabsAudio && isAgentSpeaking) {
      console.log("🎵 Starting agent audio playback and animation...")
      muteUserMicrophone(); // Mute user mic when agent starts speaking
      playAgentAudioAndAnimate(elevenLabsAudio);
    } else {
      console.log("🔇 Stopping audio playback")
      unmuteUserMicrophone(); // Unmute user mic when agent stops speaking
      setIsPlaying(false);
    }
  }, [elevenLabsAudio, isAgentSpeaking, mediaStream]);

  const playAgentAudioAndAnimate = async (audioUrl: string) => {
    try {
      console.log("🎵 Setting up agent audio for animation...", audioUrl.substring(0, 50) + "...")
      setIsPlaying(true);
      
      // Create audio element
      const audioElement = new Audio();
      
      // Try with crossOrigin first, fallback without if CORS issues
      try {
        audioElement.crossOrigin = "anonymous";
        audioElement.src = audioUrl;
      } catch (corsError) {
        console.warn("⚠️ CORS issue, trying without crossOrigin...");
        audioElement.crossOrigin = null;
        audioElement.src = audioUrl;
      }
      
      // Create or reuse audio context
      let audioContext = sceneRef.current.audioContext;
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        sceneRef.current.audioContext = audioContext;
      }
      
      console.log("🔊 Audio context state:", audioContext.state)
      
      // Resume audio context if suspended (required for autoplay policies)
      if (audioContext.state === 'suspended') {
        console.log("🔄 Resuming suspended audio context...")
        await audioContext.resume();
        console.log("✅ Audio context resumed:", audioContext.state)
      }
      
      // Wait for audio to be ready with timeout
      console.log("📡 Loading audio data...")
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Audio loading timeout"));
        }, 10000); // 10 second timeout
        
        audioElement.oncanplaythrough = () => {
          clearTimeout(timeout);
          resolve(undefined);
        };
        audioElement.onerror = (e) => {
          clearTimeout(timeout);
          reject(e);
        };
        audioElement.load();
      });
      
      console.log("📊 Audio loaded successfully, creating analyser...")
      
      try {
        // Setup audio analysis for animation
        const source = audioContext.createMediaElementSource(audioElement);
        const analyser = new Analyser(source);
        
        console.log("📊 Analyser created successfully")
        
        // Connect to output so we can hear it
        source.connect(audioContext.destination);
        
        // Store for animation
        sceneRef.current.analyser = analyser;
        sceneRef.current.audioElement = audioElement;
        
        console.log("✅ Audio analysis chain setup complete")
        
      } catch (analyserError) {
        console.error("❌ Error setting up audio analyser:", analyserError);
        // Continue without analyser - at least audio will play
        sceneRef.current.audioElement = audioElement;
      }
      
      // Add event listeners for debugging
      audioElement.onplay = () => {
        console.log("🎵 Audio play event fired - animation should start")
        console.log("🎬 Analyser ready:", !!sceneRef.current.analyser)
      };
      audioElement.onpause = () => console.log("⏸️ Audio paused");
      audioElement.onerror = (e) => console.error("❌ Audio error:", e);
      
      // Add time update listener for debugging
      audioElement.ontimeupdate = () => {
        if (Math.random() < 0.01) { // Log occasionally
          console.log("🕒 Audio time:", audioElement.currentTime, "/", audioElement.duration);
        }
      };
      
      // Notify parent component for recording integration
      if (onSystemAudioElementReady) {
        onSystemAudioElementReady(audioElement);
      }
      
      console.log("▶️ Starting audio playback...")
      
      // Play the audio
      await audioElement.play();
      
      console.log("✅ Audio is playing, animation should be active")
      console.log("🎵 Audio state:", {
        paused: audioElement.paused,
        currentTime: audioElement.currentTime,
        duration: audioElement.duration,
        readyState: audioElement.readyState,
        hasAnalyser: !!sceneRef.current.analyser
      })
      
      // Handle audio end
      audioElement.onended = () => {
        console.log('🎵 Agent audio finished - stopping animation');
        setIsPlaying(false);
        sceneRef.current.analyser = undefined;
        sceneRef.current.audioElement = undefined;
        unmuteUserMicrophone(); // Unmute user mic when audio ends
        if (onAgentAudioEnd) {
          onAgentAudioEnd();
        }
      };
      
    } catch (error) {
      console.error('❌ Error playing agent audio:', error);
      console.error('❌ Full error details:', error);
      unmuteUserMicrophone(); // Unmute user mic on error
      setIsPlaying(false);
    }
  };



  const initScene = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

    // Create backdrop
    const backdrop = new THREE.Mesh(
      new THREE.IcosahedronGeometry(10, 5),
      new THREE.RawShaderMaterial({
        uniforms: {
          resolution: { value: new THREE.Vector2(1, 1) },
          rand: { value: 0 },
        },
        vertexShader: backdropVS,
        fragmentShader: backdropFS,
        glslVersion: THREE.GLSL3,
      }),
    );
    backdrop.material.side = THREE.BackSide;
    scene.add(backdrop);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create sphere
    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
    });

    // Add custom shader to sphere material
    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.uniforms.inputData = { value: new THREE.Vector4() };
      shader.uniforms.outputData = { value: new THREE.Vector4() };

      // Store shader reference
      sphereMaterial.userData = { ...sphereMaterial.userData, shader };
      shader.vertexShader = sphereVS;
    };

    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphere);
    sphere.visible = true; // Make sphere visible immediately

    // Load EXR environment map (but don't wait for it)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader().load('/piz_compressed.exr', (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      sphereMaterial.envMap = exrCubeRenderTarget.texture;
    });

    // Setup post-processing
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      5,
      0.5,
      0,
    );
    const fxaaPass = new ShaderPass(FXAAShader);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dPR = renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      (backdrop.material as THREE.RawShaderMaterial).uniforms.resolution.value.set(w * dPR, h * dPR);
      renderer.setSize(w, h);
      composer.setSize(w, h);
      fxaaPass.material.uniforms['resolution'].value.set(1 / (w * dPR), 1 / (h * dPR));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      sphere,
      backdrop,
      rotation: new THREE.Vector3(0, 0, 0),
      prevTime: 0,
    };

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  useEffect(() => {
    const cleanup = initScene();
    
    // Animation function inside useEffect to avoid dependency issues
    const animate = () => {
      if (!sceneRef.current.sphere || !sceneRef.current.backdrop || !sceneRef.current.composer) {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        return;
      }

      const { sphere, backdrop, camera, composer, rotation } = sceneRef.current;

      const t = performance.now();
      const dt = (t - (sceneRef.current.prevTime || 0)) / (1000 / 60);
      sceneRef.current.prevTime = t;

      // Always update backdrop (for background animation)
      const backdropMaterial = backdrop.material as THREE.RawShaderMaterial;
      backdropMaterial.uniforms.rand.value = Math.random() * 10000;

      // Check animation conditions
      const hasAnalyser = !!sceneRef.current.analyser;
      const hasAudioElement = !!sceneRef.current.audioElement;
      const isAudioPlaying = sceneRef.current.audioElement && !sceneRef.current.audioElement.paused && sceneRef.current.audioElement.currentTime > 0;
      
      // Debug: log animation conditions occasionally
      if (Math.random() < 0.005) { // Log ~0.5% of frames when we have audio
        console.log('🎬 Animation conditions:', {
          hasAnalyser,
          hasAudioElement,
          isAudioPlaying,
          audioCurrentTime: sceneRef.current.audioElement?.currentTime,
          audioDuration: sceneRef.current.audioElement?.duration,
          audioReadyState: sceneRef.current.audioElement?.readyState,
          isPlaying
        });
      }
      
      // Animate if we're supposed to be playing (either with analyser data or fallback)
      if (isPlaying && hasAudioElement) {
        const sphereMaterial = sphere.material as THREE.MeshStandardMaterial;
        
        if (hasAnalyser && isAudioPlaying) {
          // FULL AUDIO-REACTIVE ANIMATION with analyser data
          const analyser = sceneRef.current.analyser!;
          analyser.update();
          
          // Get audio frequency data
          const audioData = analyser.data;
          const lowFreq = audioData[0] || 0;
          const midFreq = audioData[1] || 0;
          const highFreq = audioData[2] || 0;
          
          // Debug: log audio data when there's significant audio
          if ((lowFreq + midFreq + highFreq) > 30 && Math.random() < 0.02) {
            console.log('🎵 Audio analyser data:', { lowFreq, midFreq, highFreq });
          }

          if (sphereMaterial.userData?.shader) {
            // Scale sphere based on mid frequency (more responsive)
            const scaleMultiplier = 1 + (0.4 * midFreq) / 255;
            sphere.scale.setScalar(scaleMultiplier);

            // Rotate camera based on audio
            const f = 0.003; // Increased sensitivity
            if (rotation) {
              rotation.x += (dt * f * 0.8 * midFreq) / 255;
              rotation.z += (dt * f * 0.8 * midFreq) / 255;
              rotation.y += (dt * f * 0.5 * highFreq) / 255;

              const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
              const quaternion = new THREE.Quaternion().setFromEuler(euler);
              const vector = new THREE.Vector3(0, 0, 5);
              vector.applyQuaternion(quaternion);
              if (camera) {
                camera.position.copy(vector);
                camera.lookAt(sphere.position);
              }
            }

            // Update shader uniforms with more responsive values
            const shader = sphereMaterial.userData.shader;
            shader.uniforms.time.value += (dt * 0.2 * lowFreq) / 255;
            shader.uniforms.inputData.value.set(
              (2.0 * lowFreq) / 255,
              (0.3 * midFreq) / 255,
              (20 * highFreq) / 255,
              0,
            );
            shader.uniforms.outputData.value.set(
              (4.0 * lowFreq) / 255,
              (0.3 * midFreq) / 255,
              (20 * highFreq) / 255,
              0,
            );
          }
        } else {
          // FALLBACK ANIMATION when audio is playing but no analyser data
          console.log('🎪 Using fallback animation - audio playing but no analyser data');
          
          if (sphereMaterial.userData?.shader) {
            // Create synthetic animation based on time
            const timeBasedIntensity = (Math.sin(t * 0.005) + 1) * 0.5; // 0 to 1
            const scaleMultiplier = 1 + (0.2 * timeBasedIntensity);
            sphere.scale.setScalar(scaleMultiplier);

            // Gentle camera rotation
            const f = 0.001;
            if (rotation) {
              rotation.x += dt * f * 0.3;
              rotation.z += dt * f * 0.3;
              rotation.y += dt * f * 0.15;

              const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
              const quaternion = new THREE.Quaternion().setFromEuler(euler);
              const vector = new THREE.Vector3(0, 0, 5);
              vector.applyQuaternion(quaternion);
              if (camera) {
                camera.position.copy(vector);
                camera.lookAt(sphere.position);
              }
            }

            // Update shader with time-based animation
            const shader = sphereMaterial.userData.shader;
            shader.uniforms.time.value += dt * 0.05;
            shader.uniforms.inputData.value.set(
              timeBasedIntensity * 0.5,
              timeBasedIntensity * 0.1,
              timeBasedIntensity * 2.0,
              0,
            );
            shader.uniforms.outputData.value.set(
              timeBasedIntensity * 1.0,
              timeBasedIntensity * 0.1,
              timeBasedIntensity * 2.0,
              0,
            );
          }
        }
      } else {
        // IDLE STATE - subtle default animation when not playing
        const sphereMaterial = sphere.material as THREE.MeshStandardMaterial;
        if (sphereMaterial.userData?.shader) {
          const shader = sphereMaterial.userData.shader;
          shader.uniforms.time.value += dt * 0.001; // Very slow default animation
        }
        
        // Gradually return to default position
        const targetScale = 1;
        const currentScale = sphere.scale.x;
        sphere.scale.setScalar(currentScale + (targetScale - currentScale) * 0.05);
        
        if (camera && rotation) {
          // Gradually return camera to default position
          const targetPos = new THREE.Vector3(2, -2, 5);
          camera.position.lerp(targetPos, 0.02);
          camera.lookAt(sphere.position);
        }
      }

      composer.render();
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    sceneRef.current.animationId = requestAnimationFrame(animate);

    return () => {
      // Cleanup
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      
      // Stop any playing audio and cleanup audio context
      if (sceneRef.current.audioElement) {
        sceneRef.current.audioElement.pause();
        sceneRef.current.audioElement = undefined;
      }
      
      if (sceneRef.current.audioContext && sceneRef.current.audioContext.state !== 'closed') {
        sceneRef.current.audioContext.close();
      }
      
      sceneRef.current.analyser = undefined;
      
      if (cleanup) {
        cleanup();
      }
      
      // Dispose Three.js objects
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.composer) {
        sceneRef.current.composer.dispose();
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}