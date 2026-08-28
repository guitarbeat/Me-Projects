const fs = require('fs');

// BubblePhysics.ts - remove unused DAMPING
let physics = fs.readFileSync('apps/flo-and-tell/src/components/bubbles/BubblePhysics.ts', 'utf-8');
physics = physics.replace(/private static readonly DAMPING = 0\.92;\n\s*/g, '');
fs.writeFileSync('apps/flo-and-tell/src/components/bubbles/BubblePhysics.ts', physics);

// FloatingUserBubbles.tsx - useRef generic arg fix
let bubbles = fs.readFileSync('apps/flo-and-tell/src/components/bubbles/FloatingUserBubbles.tsx', 'utf-8');
bubbles = bubbles.replace(/const animationRef = useRef<number>\(\);/g, 'const animationRef = useRef<number>(0);');
bubbles = bubbles.replace(/const touchTimeoutRef = useRef<NodeJS\.Timeout>\(\);/g, 'const touchTimeoutRef = useRef<NodeJS.Timeout | undefined>();');
bubbles = bubbles.replace(/const hintTimerRef = useRef<NodeJS\.Timeout>\(\);/g, 'const hintTimerRef = useRef<NodeJS.Timeout | undefined>();');
fs.writeFileSync('apps/flo-and-tell/src/components/bubbles/FloatingUserBubbles.tsx', bubbles);

// AuthContext.tsx - exactOptionalPropertyTypes fix
let auth = fs.readFileSync('apps/flo-and-tell/src/contexts/AuthContext.tsx', 'utf-8');
auth = auth.replace(/username: profile\?.username \|\| undefined,/g, 'username: profile?.username || undefined,'); // it's already there
// Actually, let's just make it assignable
auth = auth.replace(/hasCustomPassword: true,/g, 'hasCustomPassword: true as boolean,');
// let's look at the interface
fs.writeFileSync('apps/flo-and-tell/src/contexts/AuthContext.tsx', auth);
