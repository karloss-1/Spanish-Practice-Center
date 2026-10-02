// Canonical wording transcribed from the supplied Word specification.
export const questions = [
  {
    "id": "H01",
    "section": 1,
    "prompt": "Which approach should guide your choice of SER or ESTAR?",
    "sentence": "",
    "options": [
      "Decide whether something is permanent or temporary.",
      "Identify the function and meaning you want to express."
    ],
    "correct": "Identify the function and meaning you want to express.",
    "correctFeedback": "Correct. Start from function and meaning: Puebla está en México expresses location; Hoy es martes expresses the date; Mi abuelo está muerto expresses a resulting state.",
    "incorrectFeedback": {
      "Decide whether something is permanent or temporary.": "Not quite. The guide rejects that shortcut. Puebla está en México and Mi abuelo está muerto use ESTAR, while Hoy es martes uses SER. Identify the function and meaning instead."
    },
    "anchor": "hero"
  },
  {
    "id": "C01",
    "section": 2,
    "prompt": "Identify Ana’s profession.",
    "sentence": "Ana ___ doctora.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. Ana es doctora identifies her profession, so use SER.",
    "incorrectFeedback": {
      "está": "Not quite. The sentence identifies Ana’s profession. Use SER: Ana es doctora."
    },
    "anchor": "core-uses"
  },
  {
    "id": "C02",
    "section": 2,
    "prompt": "Say where the keys are located.",
    "sentence": "Las llaves ___ en la mesa.",
    "options": [
      "son",
      "están"
    ],
    "correct": "están",
    "correctFeedback": "Correct. Las llaves están en la mesa locates things, so use ESTAR.",
    "incorrectFeedback": {
      "son": "Not quite. These are things being located. Use ESTAR: Las llaves están en la mesa."
    },
    "anchor": "core-uses"
  },
  {
    "id": "C03",
    "section": 2,
    "prompt": "Identify today’s day of the week.",
    "sentence": "Hoy ___ martes.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. Hoy es martes expresses the date, a core use of SER.",
    "incorrectFeedback": {
      "está": "Not quite. Use SER for this date expression: Hoy es martes. Do not choose from how long Tuesday lasts."
    },
    "anchor": "core-uses"
  },
  {
    "id": "C04",
    "section": 2,
    "prompt": "Say that the action is in progress.",
    "sentence": "___ trabajando.",
    "options": [
      "Soy",
      "Estoy"
    ],
    "correct": "Estoy",
    "correctFeedback": "Correct. Estoy trabajando presents an action in progress with ESTAR.",
    "incorrectFeedback": {
      "Soy": "Not quite. The guide uses ESTAR for actions in progress: Estoy trabajando."
    },
    "anchor": "core-uses"
  },
  {
    "id": "E01",
    "section": 3,
    "prompt": "What does this sentence tell us?",
    "sentence": "El concierto es en el teatro.",
    "options": [
      "Where an event takes place.",
      "Where the theater is located."
    ],
    "correct": "Where an event takes place.",
    "correctFeedback": "Correct. The concert is the event. SER tells us where it takes place.",
    "incorrectFeedback": {
      "Where the theater is located.": "Not quite. The sentence locates the concert as an event. El teatro está en el centro would locate the theater itself."
    },
    "anchor": "events-locations"
  },
  {
    "id": "E02",
    "section": 3,
    "prompt": "Locate the theater itself.",
    "sentence": "El teatro ___ en el centro.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. El teatro está en el centro locates a place, so use ESTAR.",
    "incorrectFeedback": {
      "es": "Not quite. The theater itself is being located. Use ESTAR: El teatro está en el centro. SER would locate an event taking place there."
    },
    "anchor": "events-locations"
  },
  {
    "id": "E03",
    "section": 3,
    "prompt": "Give the time of the concert.",
    "sentence": "El concierto ___ a las ocho.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. El concierto es a las ocho gives the time of an event, so use SER.",
    "incorrectFeedback": {
      "está": "Not quite. This gives the time when an event takes place. Use SER: El concierto es a las ocho."
    },
    "anchor": "events-locations"
  },
  {
    "id": "A01",
    "section": 4,
    "prompt": "Carlos has finished preparing. Say that he is ready to leave.",
    "sentence": "Carlos ___ listo.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. Carlos está listo means he is ready.",
    "incorrectFeedback": {
      "es": "Not quite for this meaning. Carlos es listo describes him as clever. To say he is ready, use está listo."
    },
    "anchor": "adjective-meanings"
  },
  {
    "id": "A02",
    "section": 4,
    "prompt": "Juan has nothing to do. Say that he feels bored.",
    "sentence": "Juan ___ aburrido.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. Juan está aburrido means he is bored.",
    "incorrectFeedback": {
      "es": "Not quite for this meaning. Juan es aburrido describes him as boring. Here he is bored: Juan está aburrido."
    },
    "anchor": "adjective-meanings"
  },
  {
    "id": "A03",
    "section": 4,
    "prompt": "The fruit is not ripe yet. Choose the intended description.",
    "sentence": "",
    "options": [
      "Es verde.",
      "Está verde."
    ],
    "correct": "Está verde.",
    "correctFeedback": "Correct. Está verde describes the fruit as unripe or not ready.",
    "incorrectFeedback": {
      "Es verde.": "Not quite for this meaning. Es verde describes its green color. To express unripe or not ready, use Está verde."
    },
    "anchor": "adjective-meanings"
  },
  {
    "id": "A04",
    "section": 4,
    "prompt": "You taste the food and find it delicious.",
    "sentence": "___ rico.",
    "options": [
      "Es",
      "Está"
    ],
    "correct": "Está",
    "correctFeedback": "Correct. Está rico means it tastes good or is delicious.",
    "incorrectFeedback": {
      "Es": "Not quite for this meaning. The guide pairs Es rico with being rich and Está rico with tasting good. Here use Está rico."
    },
    "anchor": "adjective-meanings"
  },
  {
    "id": "S01",
    "section": 5,
    "prompt": "In this pair, what distinction does the guide emphasize?",
    "sentence": "La película es aburrida. / La película estuvo aburrida.",
    "options": [
      "Characterization versus evaluation of a particular experience.",
      "Boring versus bored."
    ],
    "correct": "Characterization versus evaluation of a particular experience.",
    "correctFeedback": "Correct. The movie remains boring in the basic description; the speaker presents it as a characterization or an evaluation of that occasion.",
    "incorrectFeedback": {
      "Boring versus bored.": "Not quite. This pair concerns a movie and the speaker’s perspective. The boring/bored contrast appears in Es aburrido / Está aburrido about a person."
    },
    "anchor": "different-perspective"
  },
  {
    "id": "S02",
    "section": 5,
    "prompt": "Which sentence evaluates how Ana looks in today’s situation?",
    "sentence": "",
    "options": [
      "Ana es guapa.",
      "Ana está guapísima hoy."
    ],
    "correct": "Ana está guapísima hoy.",
    "correctFeedback": "Correct. Ana está guapísima hoy evaluates how she looks in this situation.",
    "incorrectFeedback": {
      "Ana es guapa.": "That sentence is grammatical, but it characterizes Ana as attractive. The requested evaluation of how she looks today is Ana está guapísima hoy."
    },
    "anchor": "different-perspective"
  },
  {
    "id": "B01",
    "section": 6,
    "prompt": "Choose the standard sentence that evaluates the movie positively.",
    "sentence": "",
    "options": [
      "La película es buena.",
      "La película es bien."
    ],
    "correct": "La película es buena.",
    "correctFeedback": "Correct. Buena is an adjective evaluating the movie. La película es buena is the standard sentence.",
    "incorrectFeedback": {
      "La película es bien.": "Not quite. The guide does not use BIEN with SER. Use the adjective buena: La película es buena."
    },
    "anchor": "bueno-malo-bien-mal"
  },
  {
    "id": "B02",
    "section": 6,
    "prompt": "Say that you are okay or well.",
    "sentence": "",
    "options": [
      "Estoy bien.",
      "Soy bien."
    ],
    "correct": "Estoy bien.",
    "correctFeedback": "Correct. Estoy bien means that you are okay or well.",
    "incorrectFeedback": {
      "Soy bien.": "Not quite. BIEN is not used with SER in this pattern. To say you are okay or well, use Estoy bien."
    },
    "anchor": "bueno-malo-bien-mal"
  },
  {
    "id": "B03",
    "section": 6,
    "prompt": "You have tasted the mole. Say that it tastes good.",
    "sentence": "El mole ___ bueno.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. For food, estar bueno expresses that it tastes good: El mole está bueno.",
    "incorrectFeedback": {
      "es": "Not quite for the requested tasting evaluation. Use El mole está bueno. SER can characterize good qualities, but the guide’s food-tasting expression is estar bueno."
    },
    "anchor": "bueno-malo-bien-mal"
  },
  {
    "id": "P01",
    "section": 7,
    "prompt": "Say what the table is made of.",
    "sentence": "La mesa ___ de madera.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. La mesa es de madera expresses material, a core use of SER.",
    "incorrectFeedback": {
      "está": "Not quite. The sentence identifies the material. Use SER: La mesa es de madera."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P02",
    "section": 7,
    "prompt": "The door is closed. Describe its resulting state.",
    "sentence": "La puerta ___ cerrada.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. La puerta está cerrada presents a resulting state, so use ESTAR.",
    "incorrectFeedback": {
      "es": "Not quite. The guide presents a closed door as a resulting state: La puerta está cerrada."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P03",
    "section": 7,
    "prompt": "Say where the party takes place.",
    "sentence": "La fiesta ___ en mi casa.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. La fiesta es en mi casa locates an event, so use SER.",
    "incorrectFeedback": {
      "está": "Not quite. This tells us where an event takes place. Use SER: La fiesta es en mi casa."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P04",
    "section": 7,
    "prompt": "Say where the house is located.",
    "sentence": "Mi casa ___ en Puebla.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. Mi casa está en Puebla locates a place, so use ESTAR.",
    "incorrectFeedback": {
      "es": "Not quite. The house itself is being located. Use ESTAR: Mi casa está en Puebla."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P05",
    "section": 7,
    "prompt": "Laura has finished getting dressed. Everyone is waiting for her. Say that she is ready.",
    "sentence": "Laura ___ lista.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. Laura está lista means she is ready in this situation.",
    "incorrectFeedback": {
      "es": "Not quite for this meaning. Laura es lista describes her as clever. To say she is ready, use Laura está lista."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P06",
    "section": 7,
    "prompt": "Juan understands things quickly. Describe him as clever.",
    "sentence": "Juan ___ listo.",
    "options": [
      "es",
      "está"
    ],
    "correct": "es",
    "correctFeedback": "Correct. Juan es listo describes him as clever.",
    "incorrectFeedback": {
      "está": "Not quite for this meaning. Juan está listo means he is ready. To describe him as clever, use Juan es listo."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P07",
    "section": 7,
    "prompt": "What does this combination mean in the guide?",
    "sentence": "Está seguro.",
    "options": [
      "He/she is sure.",
      "It/he is safe or reliable."
    ],
    "correct": "He/she is sure.",
    "correctFeedback": "Correct. Está seguro means he or she is sure.",
    "incorrectFeedback": {
      "It/he is safe or reliable.": "Not quite. The guide pairs safe or reliable with Es seguro. Está seguro means he or she is sure."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P08",
    "section": 7,
    "prompt": "What does this combination mean in the guide?",
    "sentence": "Está vivo.",
    "options": [
      "He/she is alive.",
      "He/she is clever or shrewd."
    ],
    "correct": "He/she is alive.",
    "correctFeedback": "Correct. Está vivo means he or she is alive.",
    "incorrectFeedback": {
      "He/she is clever or shrewd.": "Not quite. Es vivo describes someone as clever or shrewd. Está vivo means someone is alive."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P09",
    "section": 7,
    "prompt": "The speaker evaluates one particular restaurant experience positively. Choose the source sentence that presents that perspective.",
    "sentence": "",
    "options": [
      "El restaurante es bueno.",
      "El restaurante estuvo muy bueno."
    ],
    "correct": "El restaurante estuvo muy bueno.",
    "correctFeedback": "Correct. This presents a positive evaluation of a particular experience.",
    "incorrectFeedback": {
      "El restaurante es bueno.": "That sentence is grammatical, but it characterizes the restaurant positively. The requested particular-experience evaluation is El restaurante estuvo muy bueno."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P10",
    "section": 7,
    "prompt": "The milk is spoiled. Choose the source expression for its condition.",
    "sentence": "La leche ___ mala.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. La leche está mala describes food in bad condition.",
    "incorrectFeedback": {
      "es": "Not quite for this meaning. The guide uses estar malo/a for spoiled food or products in bad condition: La leche está mala."
    },
    "anchor": "practice-lab"
  },
  {
    "id": "P11",
    "section": 7,
    "prompt": "Say that the answer is incorrect.",
    "sentence": "La respuesta ___ mal.",
    "options": [
      "es",
      "está"
    ],
    "correct": "está",
    "correctFeedback": "Correct. La respuesta está mal expresses that the answer is incorrect.",
    "incorrectFeedback": {
      "es": "Not quite. MAL is not used with SER in this pattern. Use La respuesta está mal."
    },
    "anchor": "practice-lab"
  }
];
export const categories = [
  {
    "label": "Core uses",
    "anchor": "core-uses",
    "ids": [
      "P01",
      "P02"
    ]
  },
  {
    "label": "Events vs. locations",
    "anchor": "events-locations",
    "ids": [
      "P03",
      "P04"
    ]
  },
  {
    "label": "Adjective meanings",
    "anchor": "adjective-meanings",
    "ids": [
      "P05",
      "P06",
      "P07",
      "P08"
    ]
  },
  {
    "label": "Different perspective",
    "anchor": "different-perspective",
    "ids": [
      "P09"
    ]
  },
  {
    "label": "Bueno, malo, bien and mal",
    "anchor": "bueno-malo-bien-mal",
    "ids": [
      "P10",
      "P11"
    ]
  }
];
