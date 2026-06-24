import type { Exercise, WorkoutDay, WorkoutType } from '../types';

export const phases = [
  { name: 'Foundation', weeks: 'Weeks 1-4', focus: 'Consistency, form, low soreness.' },
  { name: 'Consistency', weeks: 'Weeks 5-8', focus: 'More reps, smoother movement, habit building.' },
  { name: 'Build', weeks: 'Weeks 9-12', focus: 'Slightly harder variations and more volume.' },
  { name: 'Strength', weeks: 'Weeks 13-16', focus: 'Tempo, unilateral work, stronger core.' },
  { name: 'Definition', weeks: 'Weeks 17-20', focus: 'Density, controlled circuits, visible muscle tone.' },
  { name: 'Confidence', weeks: 'Weeks 21-24', focus: 'Strongest pain-free variations and consistency.' }
];

export const milestones = [
  { week: 1, label: 'Planted Roots' },
  { week: 4, label: 'Showing Up' },
  { week: 8, label: 'Momentum' },
  { week: 12, label: 'Stronger Than You Think' },
  { week: 16, label: 'Built Different' },
  { week: 20, label: 'Visible Proof' },
  { week: 24, label: 'Grow Strong' }
];

export const elbowRules = [
  '0-2: continue if movement feels stable.',
  '3-4: regress or swap upper-body movement.',
  '5+: stop upper-body loading for the day.',
  'Sharp pain, tingling, weakness, or next-day pain: mark it and regress next session.'
];

export const nutritionGuide = {
  protein: '110-130g/day',
  calories: '1700-1900/day to start, then adjust from real trend data.',
  formulas: [
    'Protein + colorful produce + satisfying carb + olive oil, avocado, nuts, or dairy.',
    'Greek yogurt bowl: yogurt, berries, granola, chia, and a little honey.',
    'Plate dinner: chicken, tofu, fish, eggs, or beans with potatoes, rice, or sourdough and a big salad.',
    'No-cook lunch: turkey or hummus wrap, fruit, crunchy vegetables, and cottage cheese.'
  ],
  groceries: [
    'Greek yogurt',
    'Eggs',
    'Chicken or tofu',
    'Salmon or tuna packets',
    'Cottage cheese',
    'Beans and lentils',
    'Frozen berries',
    'Spinach and salad greens',
    'Rice, potatoes, oats, sourdough',
    'Avocado, olive oil, nuts'
  ],
  snacks: [
    'Cottage cheese and fruit',
    'Protein smoothie',
    'Hard-boiled eggs and crackers',
    'Greek yogurt with cinnamon',
    'Apple with peanut butter',
    'Tuna packet with cucumber slices'
  ],
  restaurants: [
    'Choose a clear protein first, then add a carb you actually want.',
    'Ask for sauces on the side when portions are mysterious.',
    'Split fries if you want them. Do not turn dinner into a courtroom.',
    'Aim for enough protein and move on with your life.'
  ]
};

export const exercises: Exercise[] = [
  {
    id: 'chair-squat',
    name: 'Chair squat',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Stand in front of a chair, sit back until your hips touch, then stand tall with control.',
    formCues: ['Feet rooted', 'Knees follow toes', 'Chest relaxed but lifted'],
    commonMistakes: ['Dropping onto the chair', 'Knees collapsing inward'],
    easier: 'Use a higher chair or hold a counter lightly.',
    harder: 'Pause for one second at the chair.',
    substitute: 'Wall sit'
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squat',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Sit hips back and down, then press through the full foot to stand.',
    formCues: ['Ribs stacked over pelvis', 'Full-foot pressure', 'Smooth tempo'],
    commonMistakes: ['Rushing reps', 'Heels lifting'],
    easier: 'Return to chair squats.',
    harder: 'Tempo squat',
    substitute: 'Step-up'
  },
  {
    id: 'tempo-squat',
    name: 'Tempo squat',
    category: 'Lower body',
    difficulty: 'Medium',
    elbowLoad: 'None',
    howTo: 'Lower for three slow counts, pause briefly, then stand with control.',
    formCues: ['Slow lower', 'Quiet knees', 'Stand without bouncing'],
    commonMistakes: ['Turning the pause into a collapse', 'Holding breath'],
    easier: 'Bodyweight squat',
    harder: 'Add a longer pause.',
    substitute: 'Wall sit'
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse lunge',
    category: 'Lower body',
    difficulty: 'Medium',
    elbowLoad: 'None',
    howTo: 'Step one foot back, lower gently, then push through the front foot to return.',
    formCues: ['Short comfortable range', 'Front knee tracks toes', 'Tall posture'],
    commonMistakes: ['Taking too long a step', 'Pushing off the back foot too much'],
    easier: 'Split squat hold near a wall.',
    harder: 'Add a slow lowering tempo.',
    substitute: 'Step-up'
  },
  {
    id: 'step-up',
    name: 'Step-up',
    category: 'Lower body',
    difficulty: 'Medium',
    elbowLoad: 'None',
    howTo: 'Step onto a sturdy low surface, stand fully, then lower with control.',
    formCues: ['Drive through front heel', 'Control the way down', 'Use a low step'],
    commonMistakes: ['Springing off the back leg', 'Letting the knee cave'],
    easier: 'Use a lower step.',
    harder: 'Slow the lowering phase.',
    substitute: 'Reverse lunge'
  },
  {
    id: 'wall-sit',
    name: 'Wall sit',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Lean against a wall and slide down into a comfortable squat hold.',
    formCues: ['Knees over ankles', 'Back supported', 'Breathe steadily'],
    commonMistakes: ['Going too low too soon', 'Holding breath'],
    easier: 'Hold higher on the wall.',
    harder: 'Add five to ten seconds.',
    substitute: 'Chair squat'
  },
  {
    id: 'calf-raise',
    name: 'Calf raise',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Rise onto the balls of your feet, pause, then lower slowly.',
    formCues: ['Tall posture', 'Even pressure', 'Slow lower'],
    commonMistakes: ['Rolling ankles outward', 'Bouncing'],
    easier: 'Hold a wall lightly.',
    harder: 'Single-leg calf raise.',
    substitute: 'March in place'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Hinge at the hips with soft knees, then squeeze glutes to stand.',
    formCues: ['Hips back', 'Long spine', 'Shins mostly vertical'],
    commonMistakes: ['Squatting instead of hinging', 'Rounding the back'],
    easier: 'Practice with hands on hips.',
    harder: 'Kickstand hip hinge',
    substitute: 'Glute bridge'
  },
  {
    id: 'kickstand-rdl',
    name: 'Kickstand hip hinge',
    category: 'Lower body',
    difficulty: 'Medium',
    elbowLoad: 'Low',
    howTo: 'Set one foot slightly back like a kickstand and hinge mostly into the front leg.',
    formCues: ['Front leg does the work', 'Hips stay square', 'Small range is fine'],
    commonMistakes: ['Twisting open', 'Reaching for the floor'],
    easier: 'Romanian deadlift',
    harder: 'Slow three-count lower.',
    substitute: 'Marching glute bridge'
  },
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    category: 'Lower body',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Lie on your back with knees bent, press feet down, and lift hips.',
    formCues: ['Ribs down', 'Squeeze glutes', 'Do not arch low back'],
    commonMistakes: ['Pushing through toes', 'Overarching'],
    easier: 'Smaller range.',
    harder: 'Marching glute bridge',
    substitute: 'Wall sit'
  },
  {
    id: 'marching-glute-bridge',
    name: 'Marching glute bridge',
    category: 'Lower body',
    difficulty: 'Medium',
    elbowLoad: 'None',
    howTo: 'Hold a bridge and slowly lift one foot at a time without rocking.',
    formCues: ['Level hips', 'Slow marches', 'Quiet ribs'],
    commonMistakes: ['Dropping hips', 'Moving too fast'],
    easier: 'Glute bridge',
    harder: 'Single-leg glute bridge',
    substitute: 'Kickstand hip hinge'
  },
  {
    id: 'single-leg-glute-bridge',
    name: 'Single-leg glute bridge',
    category: 'Lower body',
    difficulty: 'Harder',
    elbowLoad: 'None',
    howTo: 'Bridge with one foot planted and the other leg lifted, keeping hips level.',
    formCues: ['Short range is fine', 'Level pelvis', 'Glute drives the lift'],
    commonMistakes: ['Cramping hamstrings', 'Arching low back'],
    easier: 'Marching glute bridge',
    harder: 'Add a pause at the top.',
    substitute: 'Tempo squat'
  },
  {
    id: 'wall-push-up',
    name: 'Wall push-up',
    category: 'Upper body',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Place hands on a wall, lower chest toward the wall, then press away smoothly.',
    formCues: ['Hands below shoulders', 'Elbows soft', 'Body moves as one piece'],
    commonMistakes: ['Flaring elbows wide', 'Dropping head forward'],
    easier: 'Stand closer to the wall.',
    harder: 'High counter push-up',
    substitute: 'Isometric wall press'
  },
  {
    id: 'counter-push-up',
    name: 'Counter push-up',
    category: 'Upper body',
    difficulty: 'Beginner',
    elbowLoad: 'Medium',
    howTo: 'Use a sturdy counter and perform push-ups with a long body line.',
    formCues: ['Wrists comfortable', 'Elbows at a gentle angle', 'Slow reps'],
    commonMistakes: ['Shrugging shoulders', 'Locking elbows hard'],
    easier: 'Wall push-up',
    harder: 'Incline push-up',
    substitute: 'Standing shoulder raises'
  },
  {
    id: 'incline-push-up',
    name: 'Incline push-up',
    category: 'Upper body',
    difficulty: 'Medium',
    elbowLoad: 'Avoid if sore',
    howTo: 'Use a bench or sturdy elevated surface and keep reps pain-free.',
    formCues: ['Strong plank line', 'Quiet shoulders', 'Stop before pain'],
    commonMistakes: ['Going too low too soon', 'Pushing through elbow pain'],
    easier: 'Counter push-up',
    harder: 'Knee push-up only if pain-free.',
    substitute: 'Isometric wall press'
  },
  {
    id: 'backpack-row',
    name: 'Backpack row',
    category: 'Upper body',
    difficulty: 'Medium',
    elbowLoad: 'Avoid if sore',
    howTo: 'Hold a lightly loaded backpack, hinge, and row toward your ribs.',
    formCues: ['Shoulder blade moves first', 'Neutral wrist', 'Light load'],
    commonMistakes: ['Yanking with the arm', 'Too much weight'],
    easier: 'Standing shoulder raises',
    harder: 'Add reps before adding weight.',
    substitute: 'Scapular wall slide'
  },
  {
    id: 'standing-ytw',
    name: 'Standing shoulder raises',
    category: 'Upper body',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Stand tall and move arms through Y, T, and W shapes with slow control.',
    formCues: ['Shoulders down', 'Small range', 'Thumbs slightly back'],
    commonMistakes: ['Arching ribs', 'Forcing range'],
    easier: 'Do one shape at a time.',
    harder: 'Pause each shape.',
    substitute: 'Scapular wall slide'
  },
  {
    id: 'scapular-wall-slide',
    name: 'Scapular wall slide',
    category: 'Upper body',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Slide forearms up a wall while keeping shoulders calm and ribs down.',
    formCues: ['Gentle pressure', 'Slow slide', 'No pinching'],
    commonMistakes: ['Forcing arms flat', 'Shrugging'],
    easier: 'Reduce range.',
    harder: 'Add a pause overhead.',
    substitute: 'Standing shoulder raises'
  },
  {
    id: 'isometric-wall-press',
    name: 'Isometric wall press',
    category: 'Upper body',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Press hands gently into a wall for a short hold without moving.',
    formCues: ['Gentle effort', 'No sharp pain', 'Breathe'],
    commonMistakes: ['Pressing too hard', 'Locking elbows'],
    easier: 'Use less pressure.',
    harder: 'Longer hold if pain-free.',
    substitute: 'Wall push-up'
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Lie on your back, brace gently, and lower opposite arm and leg with control.',
    formCues: ['Low back quiet', 'Slow reach', 'Exhale as you extend'],
    commonMistakes: ['Arching back', 'Moving too fast'],
    easier: 'Move legs only.',
    harder: 'Longer reach.',
    substitute: 'Heel taps'
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'From hands and knees, reach opposite arm and leg without shifting hips.',
    formCues: ['Push floor away gently', 'Level hips', 'Reach long'],
    commonMistakes: ['Twisting open', 'Overarching'],
    easier: 'Legs only.',
    harder: 'Pause each reach.',
    substitute: 'Dead bug'
  },
  {
    id: 'side-plank-knees',
    name: 'Side plank from knees',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'Medium',
    howTo: 'Prop on forearm and knees, lift hips, and hold a straight line.',
    formCues: ['Shoulder stacked', 'Short hold', 'No elbow pain'],
    commonMistakes: ['Sinking into shoulder', 'Holding through pain'],
    easier: 'Side-lying hip lift.',
    harder: 'Longer hold.',
    substitute: 'Heel taps'
  },
  {
    id: 'elevated-plank',
    name: 'Elevated plank',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Place hands on a counter and hold a long, steady plank.',
    formCues: ['Hands comfortable', 'Ribs down', 'Glutes lightly on'],
    commonMistakes: ['Locked elbows', 'Sagging hips'],
    easier: 'Use a higher surface.',
    harder: 'Lower surface if pain-free.',
    substitute: 'Dead bug'
  },
  {
    id: 'forearm-plank',
    name: 'Forearm plank',
    category: 'Core',
    difficulty: 'Medium',
    elbowLoad: 'Avoid if sore',
    howTo: 'Hold a forearm plank with elbows cushioned and shoulders relaxed.',
    formCues: ['Short quality hold', 'Neck long', 'Stop for elbow symptoms'],
    commonMistakes: ['Ignoring elbow pressure', 'Holding too long'],
    easier: 'Elevated plank',
    harder: 'Longer hold only if pain-free.',
    substitute: 'Dead bug'
  },
  {
    id: 'heel-taps',
    name: 'Heel taps',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Lie on your back and tap one heel at a time while keeping ribs quiet.',
    formCues: ['Small motion', 'Slow breath', 'Pelvis steady'],
    commonMistakes: ['Arching back', 'Rushing'],
    easier: 'Keep feet closer.',
    harder: 'Tap farther away.',
    substitute: 'Dead bug'
  },
  {
    id: 'pallof-no-band',
    name: 'Pallof-style press without band',
    category: 'Core',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Hold a pillow at chest height and press it forward while resisting torso rotation.',
    formCues: ['Square hips', 'Gentle press', 'Slow return'],
    commonMistakes: ['Shrugging', 'Twisting with the press'],
    easier: 'Shorter reach.',
    harder: 'Pause with arms extended.',
    substitute: 'Dead bug'
  },
  {
    id: 'cat-cow',
    name: 'Cat cow',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Move between rounding and gently extending your spine on hands and knees.',
    formCues: ['Move slowly', 'Breathe with motion', 'Pad hands if needed'],
    commonMistakes: ['Forcing range', 'Locking elbows'],
    easier: 'Do it seated.',
    harder: 'Add a pause at each end.',
    substitute: 'Child’s pose'
  },
  {
    id: 'thread-needle',
    name: 'Thread the needle',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'From hands and knees, reach one arm underneath and rotate gently.',
    formCues: ['Soft support arm', 'Easy breath', 'Comfortable range'],
    commonMistakes: ['Dumping weight into elbow', 'Forcing shoulder rotation'],
    easier: 'Do seated rotation.',
    harder: 'Longer gentle hold.',
    substitute: 'Thoracic open book'
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip flexor stretch',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Kneel or stand in a split stance and gently shift hips forward.',
    formCues: ['Tuck pelvis slightly', 'Tall posture', 'Gentle stretch'],
    commonMistakes: ['Overarching low back', 'Pushing too far'],
    easier: 'Do it standing.',
    harder: 'Reach arm overhead if comfortable.',
    substitute: 'Gentle yoga flow'
  },
  {
    id: 'hamstring-floss',
    name: 'Hamstring floss',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Extend and bend one leg gently to move through the back of the thigh.',
    formCues: ['Smooth motion', 'No nerve zing', 'Small range'],
    commonMistakes: ['Yanking into stretch', 'Pointing through discomfort'],
    easier: 'Reduce range.',
    harder: 'Slow the motion.',
    substitute: 'Figure four stretch'
  },
  {
    id: 'figure-four',
    name: 'Figure four stretch',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Cross one ankle over the opposite thigh and breathe into the hip stretch.',
    formCues: ['Relax shoulders', 'Flex foot gently', 'No knee pain'],
    commonMistakes: ['Pulling aggressively', 'Twisting knee'],
    easier: 'Do it seated.',
    harder: 'Bring legs closer.',
    substitute: 'Child’s pose'
  },
  {
    id: 'childs-pose',
    name: 'Child’s pose',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Fold hips back toward heels and rest arms comfortably.',
    formCues: ['Support head if useful', 'Easy breath', 'Arms can rest by sides'],
    commonMistakes: ['Forcing shoulders', 'Ignoring knee discomfort'],
    easier: 'Place pillow under hips.',
    harder: 'Walk hands to each side.',
    substitute: 'Figure four stretch'
  },
  {
    id: 'open-book',
    name: 'Thoracic open book',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Lie on your side and rotate the top arm open like a book.',
    formCues: ['Knees stacked', 'Move with breath', 'Do not force the shoulder'],
    commonMistakes: ['Letting knees slide apart', 'Chasing the floor'],
    easier: 'Use a pillow under the top arm.',
    harder: 'Pause open for two breaths.',
    substitute: 'Thread the needle'
  },
  {
    id: 'gentle-yoga-flow',
    name: 'Gentle yoga flow',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Move through cat cow, child’s pose, low lunge, hamstring floss, and easy twists.',
    formCues: ['Stay below strain', 'Skip wrist-heavy shapes', 'Finish calmer than you started'],
    commonMistakes: ['Turning recovery into a workout', 'Holding painful positions'],
    easier: 'Choose three movements only.',
    harder: 'Add a longer walk after.',
    substitute: 'Recovery walk'
  },
  {
    id: 'worlds-greatest-stretch',
    name: 'World’s greatest stretch',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Step into a comfortable lunge, place hands where they feel supported, and rotate through the upper back.',
    formCues: ['Use blocks or a chair if needed', 'Move slowly', 'Keep breath easy'],
    commonMistakes: ['Forcing the front hip', 'Dumping weight into the hands'],
    easier: 'Do the rotation from a high lunge with hands on a chair.',
    harder: 'Pause for two breaths in the rotation.',
    substitute: 'Thoracic open book'
  },
  {
    id: 'hip-circles',
    name: 'Hip circles',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Stand tall and draw slow circles with one hip at a time, using a wall for balance if useful.',
    formCues: ['Small circles first', 'Quiet ribs', 'No pinching'],
    commonMistakes: ['Moving too fast', 'Arching the low back'],
    easier: 'Hold a chair or wall.',
    harder: 'Add a slow marching reset between sides.',
    substitute: 'Marching'
  },
  {
    id: 'arm-circles',
    name: 'Arm circles',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Make small, slow arm circles forward and backward with relaxed shoulders.',
    formCues: ['Small range', 'Soft elbows', 'Shoulders away from ears'],
    commonMistakes: ['Swinging fast', 'Locking elbows'],
    easier: 'Bend elbows more.',
    harder: 'Make slightly larger circles if pain-free.',
    substitute: 'Shoulder controlled circles'
  },
  {
    id: 'shoulder-cars',
    name: 'Shoulder controlled circles',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Move one arm through the largest comfortable shoulder circle you can control.',
    formCues: ['Slow control', 'Ribs stay down', 'Pain-free range only'],
    commonMistakes: ['Chasing range', 'Shrugging'],
    easier: 'Use a smaller circle.',
    harder: 'Pause at sticky spots without forcing.',
    substitute: 'Scapular wall slide'
  },
  {
    id: 'marching',
    name: 'Marching',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'March in place with tall posture and quiet, steady breathing.',
    formCues: ['Stand tall', 'Foot lands quietly', 'Arms relaxed'],
    commonMistakes: ['Leaning back', 'Rushing'],
    easier: 'Hold a chair lightly.',
    harder: 'Slow the lowering foot.',
    substitute: 'Walking'
  },
  {
    id: 'walking',
    name: 'Walking',
    category: 'Cardio',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Walk at a pace that lets you breathe easily and finish feeling clearer, not drained.',
    formCues: ['Tall posture', 'Relaxed shoulders', 'Easy pace before fast pace'],
    commonMistakes: ['Turning every walk into a test', 'Increasing pace before duration'],
    easier: 'Take a shorter walk or split it into two walks.',
    harder: 'Add time before adding speed.',
    substitute: 'Bike, swimming, elliptical, or easy hike'
  },
  {
    id: 'walking-lunge',
    name: 'Walking lunge',
    category: 'Lower body',
    difficulty: 'Harder',
    elbowLoad: 'None',
    howTo: 'Step forward into a short lunge, stand tall, and repeat only if knees and hips feel good.',
    formCues: ['Short step', 'Front knee tracks toes', 'Tall chest'],
    commonMistakes: ['Taking giant steps', 'Dropping into the bottom'],
    easier: 'Reverse lunge',
    harder: 'Slow lowering.',
    substitute: 'Step-up'
  },
  {
    id: 'single-leg-balance',
    name: 'Single-leg balance',
    category: 'Balance',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Stand on one foot near a wall or chair and hold steady without gripping the floor.',
    formCues: ['Soft knee', 'Tall posture', 'Use support before wobbling hard'],
    commonMistakes: ['Locking the knee', 'Holding breath'],
    easier: 'Keep toes of the free foot on the floor.',
    harder: 'Add a slow reach or longer hold.',
    substitute: 'Step-up'
  },
  {
    id: 'farmer-carry',
    name: 'Backpack farmer carry',
    category: 'Carry',
    difficulty: 'Medium',
    elbowLoad: 'Low',
    howTo: 'Carry a loaded backpack at your side or hugged to your chest while walking slowly.',
    formCues: ['Tall posture', 'Shoulders level', 'Light enough to stay smooth'],
    commonMistakes: ['Leaning away from the load', 'Gripping through elbow pain'],
    easier: 'Carry the backpack hugged to your chest.',
    harder: 'Walk farther before adding weight.',
    substitute: 'Single-leg balance'
  },
  {
    id: 'doorway-pec-stretch',
    name: 'Doorway pec stretch',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'Low',
    howTo: 'Place forearm on a doorway and gently turn away until the chest opens.',
    formCues: ['Gentle stretch', 'Shoulder down', 'No tingling'],
    commonMistakes: ['Cranking the shoulder', 'Holding numbness or tingling'],
    easier: 'Lower the arm angle.',
    harder: 'Take two slow breaths in the stretch.',
    substitute: 'Thoracic open book'
  },
  {
    id: 'calf-stretch',
    name: 'Calf stretch',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Step one foot back, press the heel down gently, and breathe into the calf.',
    formCues: ['Heel heavy', 'Toes forward', 'Gentle pressure'],
    commonMistakes: ['Turning the foot out', 'Forcing the heel'],
    easier: 'Use a smaller step.',
    harder: 'Bend the back knee slightly to change the stretch.',
    substitute: 'Hamstring floss'
  },
  {
    id: 'neck-mobility',
    name: 'Neck mobility',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Move the neck through slow nods, turns, and gentle side bends.',
    formCues: ['Tiny range', 'No stretching into symptoms', 'Jaw relaxed'],
    commonMistakes: ['Pulling on the head', 'Moving quickly'],
    easier: 'Do only slow turns.',
    harder: 'Add slow breath holds at comfortable end ranges.',
    substitute: 'Deep breathing'
  },
  {
    id: 'deep-breathing',
    name: 'Deep breathing',
    category: 'Mobility',
    difficulty: 'Beginner',
    elbowLoad: 'None',
    howTo: 'Breathe slowly through the nose or relaxed mouth, letting the ribs move without forcing a huge breath.',
    formCues: ['Jaw relaxed', 'Shoulders heavy', 'Slow exhale'],
    commonMistakes: ['Forcing breath', 'Shrugging the shoulders'],
    easier: 'Lie on your back with knees bent.',
    harder: 'Add a longer exhale.',
    substitute: 'Child’s pose'
  },
  {
    id: 'mace-halo',
    name: 'Mace halo',
    category: 'Optional mace',
    difficulty: 'Harder',
    elbowLoad: 'Avoid if sore',
    howTo: 'Optional only: circle a very light mace around the head with slow control.',
    formCues: ['Light load', 'Pain-free elbows', 'Slow path'],
    commonMistakes: ['Using too much weight', 'Pushing through elbow symptoms'],
    easier: 'Mace offset hold.',
    harder: 'Do not progress unless elbows feel perfect.',
    substitute: 'Standing shoulder raises'
  },
  {
    id: 'mace-360-prep',
    name: 'Mace 360 prep',
    category: 'Optional mace',
    difficulty: 'Harder',
    elbowLoad: 'Avoid if sore',
    howTo: 'Optional only: rehearse a partial mace 360 path without speed or strain.',
    formCues: ['Prep, not performance', 'Soft grip', 'Stop for elbow pain'],
    commonMistakes: ['Moving fast', 'Letting elbows flare painfully'],
    easier: 'Mace offset hold.',
    harder: 'Only with coaching and pain-free reps.',
    substitute: 'Scapular wall slide'
  },
  {
    id: 'mace-offset-hold',
    name: 'Mace offset hold',
    category: 'Optional mace',
    difficulty: 'Medium',
    elbowLoad: 'Avoid if sore',
    howTo: 'Optional only: hold a light mace offset for a short, steady anti-rotation hold.',
    formCues: ['Short hold', 'Quiet ribs', 'No elbow strain'],
    commonMistakes: ['Holding too long', 'Gripping too hard'],
    easier: 'Pallof-style press without band.',
    harder: 'Longer hold only if pain-free.',
    substitute: 'Pallof-style press without band'
  }
];

const schedule: Array<{ day: string; type: WorkoutType }> = [
  { day: 'Monday', type: 'Strength A' },
  { day: 'Tuesday', type: 'Yoga + Walk' },
  { day: 'Wednesday', type: 'Strength B' },
  { day: 'Thursday', type: 'Recovery Walk' },
  { day: 'Friday', type: 'Strength C' },
  { day: 'Saturday', type: 'Optional' },
  { day: 'Sunday', type: 'Rest' }
];

const phaseForWeek = (week: number) => phases[Math.floor((week - 1) / 4)].name;

const warmUpLibrary = [
  'cat-cow',
  'worlds-greatest-stretch',
  'hip-circles',
  'arm-circles',
  'shoulder-cars',
  'glute-bridge',
  'walking-lunge',
  'marching',
  'open-book',
  'deep-breathing'
];

const coolDownLibrary = [
  'hamstring-floss',
  'hip-flexor-stretch',
  'childs-pose',
  'figure-four',
  'doorway-pec-stretch',
  'open-book',
  'calf-stretch',
  'neck-mobility'
];

const choose = (items: string[], start: number, count: number) =>
  Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);

const isDeloadWeek = (week: number) => week % 4 === 0;

const phaseRules = (week: number) => {
  if (week <= 4) {
    return {
      effort: 'Easy effort: 5-6 out of 10. Finish feeling like one more set was available.',
      rest: 'Rest 60-90 seconds between sets.',
      note: 'Create the habit. No soreness should last longer than 48 hours.',
      walk: 'Aim for 7,000 daily steps if that feels realistic. Add duration before pace.'
    };
  }
  if (week <= 8) {
    return {
      effort: 'Moderate effort: about 6 out of 10. Smooth reps matter more than harder versions.',
      rest: 'Rest 60-75 seconds between sets.',
      note: 'Increase total work gently. Add repetitions before adding another set.',
      walk: 'Aim for 7,500-8,500 daily steps. Easy walking is the main cardio.'
    };
  }
  if (week <= 12) {
    return {
      effort: 'Moderate effort: 6-7 out of 10. You should still have a clean rep left.',
      rest: 'Rest 60-75 seconds between sets.',
      note: 'This phase builds muscle with tempo, single-leg work, posture, and carries.',
      walk: 'Aim for 8,000-9,000 daily steps. Longer walks beat rushed walks.'
    };
  }
  if (week <= 16) {
    return {
      effort: 'Moderately hard effort: about 7 out of 10. Strong, never wrecked.',
      rest: 'Rest 60 seconds between sets.',
      note: 'Strength comes from better control, slower tempo, and confident single-leg work.',
      walk: 'Aim for 8,500-9,500 daily steps. Keep one walk conversational and easy.'
    };
  }
  if (week <= 20) {
    return {
      effort: 'Moderately hard effort: 7 out of 10. Shorter rests are optional, form is not.',
      rest: 'Rest 45-60 seconds between sets.',
      note: 'Higher density can support definition, but never trade posture for speed.',
      walk: 'Aim for 9,000-10,000 daily steps when recovery feels good.'
    };
  }
  return {
    effort: 'Confident effort: 7 out of 10. Use your strongest pain-free version.',
    rest: 'Rest 45-75 seconds between sets.',
    note: 'You should feel noticeably stronger now. Keep the plan sustainable.',
    walk: 'Aim for 9,000-10,000 daily steps, with one longer relaxed walk most weeks.'
  };
};

const progression = (week: number) => {
  const weekInPhase = ((week - 1) % 4) + 1;
  const deload = isDeloadWeek(week);
  if (deload) {
    return {
      sets: '2 sets',
      reps: week <= 4 ? '8 easy reps' : '8-10 easy reps',
      hold: week <= 8 ? '15-20 seconds' : '20-25 seconds',
      carry: '2 short carries',
      finisher: 'Skip the finisher this week.',
      note: 'Deload week: reduce volume by about 30 percent and do not chase personal records.'
    };
  }
  if (weekInPhase === 1) {
    return { sets: '2 sets', reps: '8 reps', hold: '20 seconds', carry: '2 carries of 30 seconds', finisher: 'Optional 4-minute easy circuit.' };
  }
  if (weekInPhase === 2) {
    return { sets: '2 sets', reps: '10 reps', hold: '25 seconds', carry: '2 carries of 40 seconds', finisher: 'Optional 5-minute easy circuit.' };
  }
  return { sets: '3 sets', reps: '10 reps', hold: '30 seconds', carry: '3 carries of 30 seconds', finisher: 'Optional 6-minute controlled circuit.' };
};

const phaseExercisePlan = (week: number, type: WorkoutType) => {
  const phaseIndex = Math.floor((week - 1) / 4);
  const push = ['wall-push-up', 'counter-push-up', 'counter-push-up', 'incline-push-up', 'incline-push-up', 'incline-push-up'][phaseIndex];
  const squat = ['chair-squat', 'bodyweight-squat', 'tempo-squat', 'tempo-squat', 'tempo-squat', 'tempo-squat'][phaseIndex];
  const hinge = ['glute-bridge', 'romanian-deadlift', 'kickstand-rdl', 'kickstand-rdl', 'kickstand-rdl', 'kickstand-rdl'][phaseIndex];
  const pull = phaseIndex === 0 ? 'standing-ytw' : 'backpack-row';
  const core = ['dead-bug', 'bird-dog', 'elevated-plank', 'forearm-plank', 'forearm-plank', 'side-plank-knees'][phaseIndex];
  const balance = phaseIndex <= 1 ? 'single-leg-balance' : phaseIndex <= 3 ? 'step-up' : 'reverse-lunge';
  const carry = phaseIndex >= 2 ? 'farmer-carry' : 'calf-raise';

  if (type === 'Strength A') return [squat, hinge, pull, push, core, balance];
  if (type === 'Strength B') return [phaseIndex <= 1 ? 'step-up' : 'reverse-lunge', hinge, pull, 'scapular-wall-slide', 'bird-dog', carry];
  return [squat, phaseIndex >= 4 ? 'single-leg-glute-bridge' : 'marching-glute-bridge', pull, push, core, balance, carry];
};

const strengthPrescription = (week: number, type: WorkoutType) => {
  const dose = progression(week);
  const rules = phaseRules(week);
  const prefix = `${dose.sets} of ${dose.reps}`;
  const carryText = type === 'Strength B' || type === 'Strength C' ? ` Carries or balance: ${dose.carry}.` : '';
  const deloadText = isDeloadWeek(week) ? ` ${dose.note}` : '';
  return `${prefix}. Core holds: ${dose.hold}. ${rules.rest}${carryText} ${dose.finisher}${deloadText}`;
};

const nonStrengthPrescription = (week: number, type: WorkoutType) => {
  const deloadText = isDeloadWeek(week) ? ' Keep it especially easy because this is a deload week.' : '';
  if (type === 'Yoga + Walk') return `Walk 25-40 minutes, then easy yoga or mobility for 15-25 minutes.${deloadText}`;
  if (type === 'Recovery Walk') return `Recovery walk 25-45 minutes plus 10 minutes of mobility.${deloadText}`;
  if (type === 'Optional') {
    if (week >= 21) return 'Optional long walk, easy hike, yoga, or very light steel mace practice only if the elbow feels calm.';
    return 'Optional yoga, easy hike, longer walk, or full rest. Choose the option that protects next week.';
  }
  return 'Complete rest. Walking is optional and should feel restorative.';
};

const dayFocus = (week: number, type: WorkoutType) => {
  const rules = phaseRules(week);
  if (type.startsWith('Strength')) return `${rules.note} Prioritize technique, posture, and leaving one clean set in reserve.`;
  if (type === 'Yoga + Walk') return 'Yoga is recovery, not punishment. Keep the walk conversational.';
  if (type === 'Recovery Walk') return 'Move blood, loosen hips and upper back, and finish fresher than you started.';
  if (type === 'Optional') return 'Optional means optional. Long-term consistency beats proving a point.';
  return 'Complete rest is part of the program.';
};

const dayExercises = (week: number, type: WorkoutType) => {
  if (type.startsWith('Strength')) return phaseExercisePlan(week, type);
  if (type === 'Yoga + Walk') return ['cat-cow', 'worlds-greatest-stretch', 'hip-flexor-stretch', 'hamstring-floss', 'figure-four', 'open-book'];
  if (type === 'Recovery Walk') return ['cat-cow', 'thread-needle', 'hip-circles', 'calf-stretch', 'neck-mobility'];
  if (type === 'Optional') return week >= 21 ? ['gentle-yoga-flow', 'mace-offset-hold', 'mace-halo', 'mace-360-prep'] : ['gentle-yoga-flow', 'open-book', 'figure-four'];
  return [];
};

export const generateWorkoutPlan = (): WorkoutDay[] => {
  const days: WorkoutDay[] = [];
  for (let week = 1; week <= 24; week += 1) {
    for (const item of schedule) {
      const isStrength = item.type.startsWith('Strength');
      const rules = phaseRules(week);
      const warmUpStart = (week + schedule.findIndex((day) => day.day === item.day)) % warmUpLibrary.length;
      const coolDownStart = (week + schedule.findIndex((day) => day.day === item.day)) % coolDownLibrary.length;

      days.push({
        id: `week-${week}-${item.day.toLowerCase()}`,
        week,
        day: item.day,
        phase: phaseForWeek(week),
        type: item.type,
        focus: dayFocus(week, item.type),
        exercises: dayExercises(week, item.type),
        setsReps: isStrength ? strengthPrescription(week, item.type) : nonStrengthPrescription(week, item.type),
        warmUp: item.type === 'Rest' ? [] : choose(warmUpLibrary, warmUpStart, 5),
        coolDown: item.type === 'Rest' ? [] : choose(coolDownLibrary, coolDownStart, 4),
        effortTarget: item.type.startsWith('Strength') ? rules.effort : 'Easy effort. You should be able to breathe through your nose or hold a conversation.',
        walkingTarget: rules.walk,
        coachNote: isDeloadWeek(week)
          ? 'Coach note: this is a deload week. Reduce volume, keep quality high, and leave the workout feeling better than when you started.'
          : 'Coach note: do not increase everything at once. Technique first, then repetitions, then sets, then harder variations, then load.',
        completed: false
      });
    }
  }
  return days;
};

export const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
