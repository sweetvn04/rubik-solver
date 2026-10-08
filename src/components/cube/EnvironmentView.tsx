import { ContactShadows } from '@react-three/drei';

export function EnvironmentView() {
  return (
    <>
      {/* Warm ambient base light */}
      <ambientLight intensity={0.9} color="#fff6eb" />

      {/* Main warm key light */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.8}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Soft cool fill light from opposite angle */}
      <directionalLight
        position={[-6, -2, -6]}
        intensity={0.5}
        color="#d6e8fa"
      />

      {/* Gentle front fill for face visibility */}
      <directionalLight
        position={[0, 4, 8]}
        intensity={0.6}
        color="#fff4e0"
      />

      {/* Soft cozy contact shadow beneath the Rubik cube */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.35}
        scale={8}
        blur={2.4}
        far={4.5}
        color="#3d2f23"
      />
    </>
  );
}
