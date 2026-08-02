export const T = {
  ink: '#1E2B22', green: '#2F5D3A', citrus: '#E8A722', citrusSoft: '#FBF0D7',
  paper: '#FAF9F4', card: '#FFFFFF', line: '#E4E2D8', sub: '#6B7568',
  red: '#B4552D', greenLight: '#EBF3EC',
}

export const MODALITIES = [
  'Walking','Running','Swimming','Yoga','Weight lifting','Treadmill','Cycling',
  'HIIT','Pilates','Tennis','Badminton','Basketball','Soccer','Rock climbing',
  'Jump rope','Rowing','Elliptical','Stretching','Martial arts','Dance','Hiking','Surfing',
]

export const MODALITY_COLOR = {
  Walking:'#7FA86B', Running:'#D97742', Swimming:'#4E8FB0', Yoga:'#9C7BB0',
  'Weight lifting':'#5B5F97', Treadmill:'#B0784E', Cycling:'#4EA98F', HIIT:'#C25B5B',
  Pilates:'#C08BA8', Tennis:'#7B9E3A', Badminton:'#3A9E8A', Basketball:'#E07830',
  Soccer:'#5B8A3A', 'Rock climbing':'#8A6B3A', 'Jump rope':'#C05B8A', Rowing:'#3A6B8A',
  Elliptical:'#8A3A5B', Stretching:'#A8C87B', 'Martial arts':'#C8A83A', Dance:'#E07BB0',
  Hiking:'#5BA86B', Surfing:'#3A8AB0', Rest:'#C9C6BA',
}

export const GUIDED = ['Yoga','Weight lifting','HIIT','Pilates','Dance','Stretching','Running']

export const ETH_STAPLES = {
  Indian: ['Basmati rice','Idli rice','Atta','Toor dal','Chana dal','Moong dal','Urad dal','Salt','Sugar','Oil','Ghee','Turmeric','Cumin seeds','Coriander powder','Red chili powder','Garam masala','Mustard seeds','Hing','Bay leaves','Cardamom','Curry leaves','Tamarind','Semolina (rava)','Poha','Tea'],
  Mediterranean: ['Olive oil','Sea salt','Dried oregano','Chickpeas (canned)','Lentils','Pasta','Tahini','Cumin','Paprika','Bay leaves','Vegetable broth'],
  'East Asian': ['Jasmine rice','Soy sauce','Sesame oil','Rice vinegar','Fish sauce','Oyster sauce','Mirin','Gochujang','Cornstarch','Rice noodles','White pepper','Five spice'],
  Mexican: ['Long-grain rice','Pinto beans (canned)','Black beans (canned)','Cumin','Chili powder','Smoked paprika','Dried oregano','Garlic powder','Salsa (jarred)','Oil','Salt'],
  American: ['All-purpose flour','Sugar','Baking powder','Salt','Oil','Canned beans','Canned tomatoes','Vegetable broth','Pasta','Oats'],
  'Middle Eastern': ['Basmati rice','Bulgur','Chickpeas (canned)','Tahini','Olive oil','Sumac','Allspice','Turmeric','Cumin','Coriander','Cardamom','Cinnamon'],
}

export const ALLERGIES = ['Gluten','Dairy','Nuts','Peanuts','Soy','Eggs','Shellfish','Sesame']
export const AVOIDS = ['Beef','Pork','Lamb','Chicken','Turkey','Fish','Onion','Garlic','Mushrooms']
export const QUICK_STORES = ["Trader Joe's",'Costco','Indian grocery','Whole Foods','Safeway','H Mart','Sprouts']
export const DAY_FULL = { Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday' }
export const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export const FUN_MEALS = {
  Indian: ['Sprouts chaat','Baked handva','Moong dal chilla','Grilled paneer tikka','Rajma bowl','Rava upma','Masala dosa','Idli sambhar','Uttapam','Poha','Pesarattu','Dhokla','Lemon rice'],
  Mediterranean: ['Mezze spread','Shakshuka','Baked falafel pita','Loaded hummus bowl'],
  'East Asian': ['Miso soup + edamame','Bibimbap','Cold soba salad','Tofu stir fry'],
  Mexican: ['Baked nacho plate','Black bean tostadas','Elote bowl'],
  American: ['Buddha bowl','Loaded sweet potato','High-protein grain bowl'],
  'Middle Eastern': ['Mezze platter','Mujaddara','Fattoush salad'],
}

export const DEFAULT_PROFILE = {
  diet: 'No restriction', ethnicities: [],
  allergies: [], avoids: [], customAvoid: '',
  goalKg: 6, goalMonths: 3, startWeight: '', heightCm: '',
  stores: [], mealsPerDay: 1, mealSlots: ['dinner'],
  exercisePrefs: [], ytChannels: {}, staples: [],
  snackPref: 'store-bought', onboarded: false,
}
