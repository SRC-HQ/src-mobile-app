export const RACER_COUNT = 10

export const RACER_NAMES = [
  'President',
  'Doctor',
  'Astronaut',
  'Bartender',
  'CEO',
  'Chef',
  'Farmer',
  'Engineer',
  'Artist',
  'Scientist',
]

export const RACER_COLORS = [
  '#FF5733', // Red/Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F033FF', // Magenta
  '#FF33A8', // Pink
  '#33FFF5', // Cyan
  '#F5FF33', // Yellow
  '#FF8C33', // Orange
  '#8C33FF', // Purple
  '#33FF99', // Mint
]

// Race layout constants
export const RACE_CONFIG = {
  LANE_HEIGHT: 50,
  START_Y: 80,
  START_X: 60,
  FINISH_X: 300, // Adjusted for mobile screen
  RACER_SIZE: 40,
  INTERPOLATION_FACTOR: 0.15,
}

// Asset paths - Static requires for Metro bundler
export const ASSETS = {
  RACERS: [
    require('../../../assets/game/images/racer_01.png'),
    require('../../../assets/game/images/racer_02.png'),
    require('../../../assets/game/images/racer_03.png'),
    require('../../../assets/game/images/racer_04.png'),
    require('../../../assets/game/images/racer_05.png'),
    require('../../../assets/game/images/racer_06.png'),
    require('../../../assets/game/images/racer_07.png'),
    require('../../../assets/game/images/racer_08.png'),
    require('../../../assets/game/images/racer_09.png'),
    require('../../../assets/game/images/racer_10.png'),
  ],
  ICONS: [
    require('../../../assets/game/images/icon_01.png'),
    require('../../../assets/game/images/icon_02.png'),
    require('../../../assets/game/images/icon_03.png'),
    require('../../../assets/game/images/icon_04.png'),
    require('../../../assets/game/images/icon_05.png'),
    require('../../../assets/game/images/icon_06.png'),
    require('../../../assets/game/images/icon_07.png'),
    require('../../../assets/game/images/icon_08.png'),
    require('../../../assets/game/images/icon_09.png'),
    require('../../../assets/game/images/icon_10.png'),
  ],
  BACKGROUNDS: {
    SKY_01: require('../../../assets/game/images/bg_sky_01.png'),
    SKY_02: require('../../../assets/game/images/bg_sky_02.png'),
    SKY_03: require('../../../assets/game/images/bg_sky_03.png'),
    RACE_01: require('../../../assets/game/images/bg_race_01.png'),
    RACE_02: require('../../../assets/game/images/bg_race_02.png'),
    RACE_03: require('../../../assets/game/images/bg_race_03.png'),
    BILLBOARD_01: require('../../../assets/game/images/bg_billboard_01.png'),
    BILLBOARD_02: require('../../../assets/game/images/bg_billboard_02.png'),
    BILLBOARD_03: require('../../../assets/game/images/bg_billboard_03.png'),
    END_01: require('../../../assets/game/images/bg_end_01.png'),
    END_LINE_01: require('../../../assets/game/images/bg_end_line_01.png'),
    SHADOW_01: require('../../../assets/game/images/bg_shadow_01.png'),
    SHADOW_02: require('../../../assets/game/images/bg_shadow_02.png'),
    SHADOW_03: require('../../../assets/game/images/bg_shadow_03.png'),
  },
  UI: {
    RESULT_BG: require('../../../assets/game/images/item_bg_result.png'),
    RACE_DISPLAY: require('../../../assets/game/images/item_race_display.png'),
    RACE_PIN: require('../../../assets/game/images/item_race_pin.png'),
    RACE_SCORE: require('../../../assets/game/images/item_race_score.png'),
  },
}
