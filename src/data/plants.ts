export const plants = [
  {
    plantID: 3,
    plantCode: 'BEA1',
    plantName: 'Dicke Bohnen',
    alternativeNames: [
      'Saubohnen',
      'Ackerbohnen',
      'Puffbohnen',
      'Schweinsbohnen',
    ],
    latinName: 'Vicia faba',
    family: 2,
    spacing: 30,
    inRowSpacing: 20,
    rowSpacing: 40,
    perennial: false,
    frostTolerant: -5,
    timings: {
      plantRelativeLastFrost: -8,
      timeToMaturity: 14,
      harvestRelativeToFirstFrost: -4,
    },
  },
  {
    plantID: 19,
    plantCode: 'GAR',
    plantName: 'Knoblauch',
    alternativeNames: [],
    latinName: 'Allium sativum',
    family: 4,
    spacing: 15,
    inRowSpacing: 10,
    rowSpacing: 25,
    perennial: false,
    frostTolerant: -30,
    timings: {
      plantRelativeLastFrost: -26,
      timeToMaturity: 36,
      harvestRelativeToFirstFrost: 0,
    },
  },
  {
    plantID: 16,
    plantCode: 'COU',
    plantName: 'Zucchini',
    alternativeNames: [],
    latinName: 'Cucurbita pepo',
    family: 6,
    spacing: 60,
    inRowSpacing: 60,
    rowSpacing: 60,
    perennial: false,
    frostTolerant: false,
    timings: {
      plantRelativeLastFrost: 1,
      timeToMaturity: 10,
      harvestRelativeToFirstFrost: 0,
    },
  },
];

// garlic
// ["plantRelativeLastFrost", -26]
// ["sowStartIndoors", null]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 18]
// ["timeToMaturity", 36]
// ["harvestRelativeToFirstFrost", 0]

//bok
/*
["plantRelativeLastFrost", -6]
["sowStartIndoors", -3]
["lastSowRelativeToLastFrost", 0]
["lastPlantingTime", 30]
["timeToMaturity", 9]
["harvestRelativeToFirstFrost", 5]
*/

//aub
/*
["plantRelativeLastFrost", 2]
["sowStartIndoors", -12]
["lastSowRelativeToLastFrost", -4]
["lastPlantingTime", 22]
["timeToMaturity", 18]
["harvestRelativeToFirstFrost", 0]
*/

// spring onion
// ["plantRelativeLastFrost", -4]
// ["sowStartIndoors", -4]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 25]
// ["timeToMaturity", 12]
// ["harvestRelativeToFirstFrost", 6]

// calabrese
// "ssi": -4,
// "lssrlf": 0,
// "prlf": -4,
// "lpt": 20,
// "ttm": 12,
// "hrff": 0,

// broad
// ["plantRelativeLastFrost", -8]
// ["sowStartIndoors", null]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 20]
// ["timeToMaturity", 14]
// ["harvestRelativeToFirstFrost", -4]

// radish
// ["plantRelativeLastFrost", -4]
// ["sowStartIndoors", null]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 40]
// ["timeToMaturity", 3]
// ["harvestRelativeToFirstFrost", 4]

// tom
// ["plantRelativeLastFrost", 0]
// ["sowStartIndoors", -8]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 25]
// ["timeToMaturity", 17]
// ["harvestRelativeToFirstFrost", 0]

// cabbage summer
// ["plantRelativeLastFrost", -5]
// ["sowStartIndoors", -4]
// ["lastSowRelativeToLastFrost", 0]
// ["lastPlantingTime", 20]
// ["timeToMaturity", 15]
// ["harvestRelativeToFirstFrost", 0]
