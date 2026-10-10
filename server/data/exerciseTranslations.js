/*
  Перевод справочника упражнений free-exercise-db (лицензия Unlicense,
  общественное достояние) на русский.

  Служебные поля — закрытые списки, переведены полностью.
  Названия упражнений переведены для ходовых: остальные ~720 импортируются
  с английским названием и лежат запасом, их можно переводить по мере надобности,
  дописывая строки в NAMES. Ключ — точное название из датасета.
*/

// Основная группа мышц
const MUSCLES = {
  abdominals: 'Пресс',
  abductors: 'Отводящие мышцы бедра',
  adductors: 'Приводящие мышцы бедра',
  biceps: 'Бицепс',
  calves: 'Икры',
  chest: 'Грудь',
  forearms: 'Предплечья',
  glutes: 'Ягодицы',
  hamstrings: 'Задняя поверхность бедра',
  lats: 'Широчайшие',
  'lower back': 'Поясница',
  'middle back': 'Середина спины',
  neck: 'Шея',
  quadriceps: 'Квадрицепс',
  shoulders: 'Плечи',
  traps: 'Трапеции',
  triceps: 'Трицепс'
};

// Оборудование — ложится в колонку machine, там уже русские значения
const EQUIPMENT = {
  barbell: 'Штанга',
  dumbbell: 'Гантели',
  cable: 'Блочный тренажер',
  machine: 'Тренажер',
  kettlebells: 'Гири',
  bands: 'Резина',
  'body only': 'Без оборудования',
  'exercise ball': 'Фитбол',
  'medicine ball': 'Медбол',
  'foam roll': 'Массажный ролик',
  'e-z curl bar': 'EZ-гриф',
  other: 'Другое'
};

const LEVELS = {
  beginner: 'Низкий',
  intermediate: 'Средний',
  expert: 'Высокий'
};

const CATEGORIES = {
  strength: 'силовая',
  cardio: 'кардио',
  stretching: 'растяжка',
  plyometrics: 'плиометрика',
  powerlifting: 'пауэрлифтинг',
  strongman: 'стронгмен'
};

// Ключ — точное название из датасета, значение — принятый русский термин
const NAMES = {
  // Грудь
  'Barbell Bench Press - Medium Grip': 'Жим штанги лёжа',
  'Wide-Grip Barbell Bench Press': 'Жим штанги лёжа широким хватом',
  'Barbell Incline Bench Press - Medium Grip': 'Жим штанги на наклонной скамье',
  'Decline Barbell Bench Press': 'Жим штанги на скамье с отрицательным наклоном',
  'Dumbbell Bench Press': 'Жим гантелей лёжа',
  'Incline Dumbbell Press': 'Жим гантелей на наклонной скамье',
  'Decline Dumbbell Bench Press': 'Жим гантелей на скамье с отрицательным наклоном',
  'Dumbbell Flyes': 'Разведение гантелей лёжа',
  'Incline Dumbbell Flyes': 'Разведение гантелей на наклонной скамье',
  'Decline Dumbbell Flyes': 'Разведение гантелей на отрицательном наклоне',
  'Cable Crossover': 'Сведение рук в кроссовере',
  'Low Cable Crossover': 'Сведение рук в нижнем блоке',
  'Machine Bench Press': 'Жим в тренажёре',
  'Smith Machine Bench Press': 'Жим в машине Смита',
  'Smith Machine Incline Bench Press': 'Жим в Смите на наклонной скамье',
  Butterfly: 'Сведение рук в тренажёре «бабочка»',
  'Straight-Arm Dumbbell Pullover': 'Пуловер с гантелью',
  'Bent-Arm Dumbbell Pullover': 'Пуловер с гантелью на согнутых руках',
  Pushups: 'Отжимания от пола',
  'Push-Up Wide': 'Отжимания широким хватом',
  'Incline Push-Up': 'Отжимания с упором на возвышение',
  'Push-Ups With Feet Elevated': 'Отжимания с ногами на возвышении',
  'Plyo Push-up': 'Плиометрические отжимания',
  'Dips - Chest Version': 'Отжимания на брусьях с наклоном на грудь',
  'Incline Cable Flye': 'Сведение в блоке на наклонной скамье',

  // Широчайшие и спина
  Pullups: 'Подтягивания',
  'Chin-Up': 'Подтягивания обратным хватом',
  'V-Bar Pullup': 'Подтягивания с V-рукоятью',
  'Wide-Grip Rear Pull-Up': 'Подтягивания широким хватом за голову',
  'Wide-Grip Lat Pulldown': 'Тяга верхнего блока широким хватом',
  'Close-Grip Front Lat Pulldown': 'Тяга верхнего блока узким хватом',
  'V-Bar Pulldown': 'Тяга верхнего блока с V-рукоятью',
  'One Arm Lat Pulldown': 'Тяга верхнего блока одной рукой',
  'Straight-Arm Pulldown': 'Тяга прямыми руками в блоке',
  'Underhand Cable Pulldowns': 'Тяга верхнего блока обратным хватом',
  'Bent Over Barbell Row': 'Тяга штанги в наклоне',
  'Reverse Grip Bent-Over Rows': 'Тяга штанги в наклоне обратным хватом',
  'Bent Over Two-Dumbbell Row': 'Тяга двух гантелей в наклоне',
  'One-Arm Dumbbell Row': 'Тяга гантели одной рукой',
  'Seated Cable Rows': 'Тяга горизонтального блока',
  'T-Bar Row with Handle': 'Тяга Т-грифа',
  'Lying T-Bar Row': 'Тяга Т-грифа лёжа',
  'Smith Machine Bent Over Row': 'Тяга в Смите в наклоне',
  'Leverage High Row': 'Тяга в рычажном тренажёре',
  'Dumbbell Incline Row': 'Тяга гантелей лёжа на наклонной скамье',

  // Поясница
  'Barbell Deadlift': 'Становая тяга',
  'Rack Pulls': 'Тяга с плинтов',
  'Deficit Deadlift': 'Становая тяга с дефицита',
  'Stiff Leg Barbell Good Morning': 'Наклоны со штангой на прямых ногах',
  'Seated Good Mornings': 'Наклоны со штангой сидя',
  Superman: 'Лодочка (супермен)',
  'Hyperextensions With No Hyperextension Bench': 'Гиперэкстензия без тренажёра',

  // Трапеции
  'Barbell Shrug': 'Шраги со штангой',
  'Dumbbell Shrug': 'Шраги с гантелями',
  'Cable Shrugs': 'Шраги в блоке',
  'Clean Shrug': 'Шраги в стиле взятия на грудь',
  'Standing Dumbbell Upright Row': 'Тяга гантелей к подбородку',
  'Upright Cable Row': 'Тяга к подбородку в блоке',

  // Плечи
  'Barbell Shoulder Press': 'Жим штанги стоя',
  'Standing Military Press': 'Армейский жим стоя',
  'Seated Barbell Military Press': 'Жим штанги сидя',
  'Dumbbell Shoulder Press': 'Жим гантелей сидя',
  'Standing Dumbbell Press': 'Жим гантелей стоя',
  'Arnold Dumbbell Press': 'Жим Арнольда',
  'Machine Shoulder (Military) Press': 'Жим в тренажёре на плечи',
  'Cable Shoulder Press': 'Жим в блоке на плечи',
  'Side Lateral Raise': 'Махи гантелями в стороны',
  'Seated Side Lateral Raise': 'Махи гантелями в стороны сидя',
  'One-Arm Side Laterals': 'Махи гантелью в сторону одной рукой',
  'Front Dumbbell Raise': 'Подъём гантелей перед собой',
  'Front Cable Raise': 'Подъём в блоке перед собой',
  'Reverse Flyes': 'Махи в наклоне на заднюю дельту',
  'Reverse Machine Flyes': 'Обратные разведения в тренажёре',
  'Cable Rear Delt Fly': 'Разведение в кроссовере на заднюю дельту',
  'Face Pull': 'Тяга к лицу',
  'Upright Barbell Row': 'Тяга штанги к подбородку',
  'Push Press': 'Швунг жимовой',
  'Handstand Push-Ups': 'Отжимания в стойке на руках',
  'External Rotation': 'Наружная ротация плеча',
  'Seated Dumbbell Press': 'Жим гантелей сидя от плеч',

  // Бицепс
  'Barbell Curl': 'Подъём штанги на бицепс',
  'EZ-Bar Curl': 'Подъём EZ-грифа на бицепс',
  'Close-Grip EZ Bar Curl': 'Подъём EZ-грифа узким хватом',
  'Close-Grip Standing Barbell Curl': 'Подъём штанги на бицепс узким хватом',
  'Dumbbell Bicep Curl': 'Подъём гантелей на бицепс',
  'Dumbbell Alternate Bicep Curl': 'Попеременный подъём гантелей на бицепс',
  'Hammer Curls': 'Молотковые сгибания',
  'Alternate Hammer Curl': 'Попеременные молотки',
  'Cross Body Hammer Curl': 'Молотки поперёк корпуса',
  'Cable Hammer Curls - Rope Attachment': 'Молотки с канатной рукоятью',
  'Concentration Curls': 'Концентрированные сгибания',
  'Incline Dumbbell Curl': 'Подъём гантелей на наклонной скамье',
  'Cable Preacher Curl': 'Сгибания на скамье Скотта в блоке',
  'Machine Preacher Curls': 'Сгибания на скамье Скотта в тренажёре',
  'One Arm Dumbbell Preacher Curl': 'Сгибание одной рукой на скамье Скотта',
  'Machine Bicep Curl': 'Сгибания на бицепс в тренажёре',
  'Drag Curl': 'Протяжка на бицепс',
  'Lying Cable Curl': 'Сгибания на бицепс в блоке лёжа',

  // Трицепс
  'Triceps Pushdown': 'Разгибание рук в блоке',
  'Triceps Pushdown - Rope Attachment': 'Разгибание рук в блоке с канатом',
  'Reverse Grip Triceps Pushdown': 'Разгибание рук в блоке обратным хватом',
  'Close-Grip Barbell Bench Press': 'Жим штанги узким хватом',
  'Close-Grip Dumbbell Press': 'Жим гантелей узким хватом',
  'Bench Dips': 'Отжимания от скамьи',
  'Dips - Triceps Version': 'Отжимания на брусьях на трицепс',
  'Cable Rope Overhead Triceps Extension': 'Французский жим из-за головы с канатом',
  'Cable One Arm Tricep Extension': 'Разгибание одной руки в блоке',
  'Decline EZ Bar Triceps Extension': 'Французский жим на отрицательном наклоне',
  'Cable Lying Triceps Extension': 'Французский жим в блоке лёжа',
  'Decline Dumbbell Triceps Extension': 'Разгибание гантелей лёжа на наклонной',
  'Board Press': 'Жим с бордов',

  // Квадрицепс и ноги
  'Barbell Squat': 'Приседания со штангой',
  'Barbell Full Squat': 'Глубокие приседания со штангой',
  'Front Squat (Clean Grip)': 'Фронтальные приседания',
  'Box Squat': 'Приседания в короб',
  'Barbell Hack Squat': 'Гакк-приседания со штангой',
  'Bodyweight Squat': 'Приседания без веса',
  'Dumbbell Squat': 'Приседания с гантелями',
  'Leg Press': 'Жим ногами',
  'Narrow Stance Leg Press': 'Жим ногами узкой постановкой',
  'Leg Extensions': 'Разгибания ног в тренажёре',
  'Single-Leg Leg Extension': 'Разгибание одной ноги в тренажёре',
  'Barbell Lunge': 'Выпады со штангой',
  'Dumbbell Lunges': 'Выпады с гантелями',
  'Barbell Walking Lunge': 'Выпады со штангой в движении',
  'Dumbbell Rear Lunge': 'Обратные выпады с гантелями',
  'Barbell Step Ups': 'Зашагивания на платформу со штангой',
  'Chair Squat': 'Приседания к стулу',

  // Задняя поверхность бедра
  'Romanian Deadlift': 'Румынская тяга',
  'Lying Leg Curls': 'Сгибания ног лёжа',
  'Seated Leg Curl': 'Сгибания ног сидя',
  'Good Morning': 'Наклоны со штангой на плечах',
  'Glute Ham Raise': 'Сгибания на ГХР',
  'Natural Glute Ham Raise': 'Сгибания на ГХР без тренажёра',
  'Power Clean': 'Взятие штанги на грудь',
  'Clean Deadlift': 'Тяга в стиле взятия на грудь',
  'Smith Machine Stiff-Legged Deadlift': 'Тяга на прямых ногах в Смите',
  'Reverse Hyperextension': 'Обратная гиперэкстензия',

  // Ягодицы
  'Barbell Hip Thrust': 'Ягодичный мост со штангой',
  'Barbell Glute Bridge': 'Ягодичный мост со штангой на полу',
  'Butt Lift (Bridge)': 'Ягодичный мост',
  'Single Leg Glute Bridge': 'Ягодичный мост на одной ноге',
  'One-Legged Cable Kickback': 'Отведение ноги назад в блоке',
  'Glute Kickback': 'Махи ногой назад',
  'Step-up with Knee Raise': 'Зашагивания с подъёмом колена',
  'Pull Through': 'Протяжка между ног в блоке',
  'Kneeling Squat': 'Приседания с колен',

  // Икры
  'Standing Calf Raises': 'Подъёмы на носки стоя',
  'Seated Calf Raise': 'Подъёмы на носки сидя',
  'Standing Dumbbell Calf Raise': 'Подъёмы на носки с гантелями',
  'Standing Barbell Calf Raise': 'Подъёмы на носки со штангой',
  'Calf Press On The Leg Press Machine': 'Жим носками в тренажёре',
  'Smith Machine Calf Raise': 'Подъёмы на носки в Смите',

  // Пресс и кор
  Crunches: 'Скручивания',
  'Cable Crunch': 'Скручивания в блоке',
  'Decline Crunch': 'Скручивания на наклонной скамье',
  'Cross-Body Crunch': 'Косые скручивания',
  'Reverse Crunch': 'Обратные скручивания',
  'Cable Reverse Crunch': 'Обратные скручивания в блоке',
  Plank: 'Планка',
  'Russian Twist': 'Русские скручивания',
  'Cable Russian Twists': 'Русские скручивания в блоке',
  'Mountain Climbers': 'Скалолаз',
  'Hanging Leg Raise': 'Подъём ног в висе',
  'Air Bike': 'Велосипед лёжа',
  'Barbell Ab Rollout - On Knees': 'Ролик для пресса с колен',
  'Barbell Side Bend': 'Наклоны в стороны со штангой',
  'Dead Bug': 'Мёртвый жук',
  '3/4 Sit-Up': 'Подъёмы корпуса',
  'Decline Reverse Crunch': 'Обратные скручивания на наклонной',
  'Push Up to Side Plank': 'Отжимание с переходом в боковую планку',

  // Предплечья
  'Palms-Up Barbell Wrist Curl Over A Bench': 'Сгибания запястий со штангой',
  'Palms-Down Wrist Curl Over A Bench': 'Разгибания запястий со штангой',
  'Cable Wrist Curl': 'Сгибания запястий в блоке',
  'Finger Curls': 'Сгибания пальцев',
  "Farmer's Walk": 'Прогулка фермера',

  // Кардио и общая физподготовка
  'Running, Treadmill': 'Бег на дорожке',
  'Jogging, Treadmill': 'Лёгкий бег на дорожке',
  'Walking, Treadmill': 'Ходьба на дорожке',
  'Rowing, Stationary': 'Гребной тренажёр',
  'Bicycling, Stationary': 'Велотренажёр',
  'Recumbent Bike': 'Горизонтальный велотренажёр',
  'Rope Jumping': 'Прыжки со скакалкой',
  'Elliptical Trainer': 'Эллиптический тренажёр',
  Stairmaster: 'Степпер',
  'Step Mill': 'Лестничный тренажёр',
  Bicycling: 'Велосипед',
  Skating: 'Катание на коньках',
  'Trail Running/Walking': 'Бег и ходьба по пересечённой местности',
  'Bench Jump': 'Запрыгивания на скамью',
  'Knee Tuck Jump': 'Прыжки с подтягиванием коленей',
  Inchworm: 'Гусеница'
};

module.exports = { MUSCLES, EQUIPMENT, LEVELS, CATEGORIES, NAMES };
