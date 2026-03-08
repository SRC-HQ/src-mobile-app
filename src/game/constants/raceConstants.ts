/**
 * Race constants ported from web version (vanillaAssets.ts)
 * Adjusted for mobile screen sizes while maintaining game logic
 */

export const RACER_COUNT = 10

// Canvas dimensions - adjusted for mobile
// Web uses 1280x768, mobile will scale based on device
export const CANVAS = {
  // Base dimensions for calculations (will be scaled)
  BASE_WIDTH: 1280,
  BASE_HEIGHT: 768,
  // Mobile portrait dimensions
  MOBILE_WIDTH: 768,
  MOBILE_HEIGHT: 1024,
} as const

// Racer sprite frame dimensions (from web)
export const FRAME = {
  WIDTH: 181,
  HEIGHT: 141,
  COUNT: 10,
  REG_X: 131 / 2 + 5, // Registration point X
  REG_Y: 91 - 2, // Registration point Y
} as const

// Race layout - pixel positions in world coords
export const RACE = {
  // Racers horizontal range in world coords
  rangeX: [50, 280] as [number, number], // Reduced max to prevent racers from going off-screen
  // First lane centre-Y
  startY: 240,
  // Vertical gap between lanes
  laneSpaceY: 50,
  // Background layer Y offsets
  skyY: -10,
  billboardY: 100,
  groundY: 100,
  // End-line initial X and Y - starts off-screen to the right
  endlineX: 800, // Start far right, will scroll in when progress > 92%
  endlineY: 365,
  endlineTopOffset: 60, // Reduced from 121 to move endline up (lower value = higher position)
  endlineBottomOffset: 57,
  endSpriteOffsetX: 20,
  endSpriteOffsetY: -240,
  // End line dimensions (adjust these to change size)
  endlineWidth: 20, // Width of the vertical finish line stripe
  endlineHeight: 260, // Height of the vertical finish line stripe
  endWidth: 20, // Width of the finish banner/decoration
  endHeight: 40, // Height of the finish banner/decoration
  // Race speed for parallax (reduced for smoother scrolling)
  raceSpeed: 220, // Reduced from 280
} as const

// Parallax multipliers for background layers (reduced for smoother animation)
export const PARALLAX_MULT = {
  ground: 0.8, // Reduced from 1
  billboard: 0.6, // Reduced from 0.8
  sky: 0.25, // Reduced from 0.3
} as const

// Field settings - cycling backgrounds
export const FIELD_SETTINGS = [
  {
    sky: require('../../../assets/game/images/bg_sky_01.png'),
    race: require('../../../assets/game/images/bg_race_01.png'),
    billboard: require('../../../assets/game/images/bg_billboard_01.png'),
    end: require('../../../assets/game/images/bg_end_01.png'),
    endline: require('../../../assets/game/images/bg_end_line_01.png'),
    shadow: require('../../../assets/game/images/bg_shadow_01.png'),
  },
  {
    sky: require('../../../assets/game/images/bg_sky_02.png'),
    race: require('../../../assets/game/images/bg_race_02.png'),
    billboard: require('../../../assets/game/images/bg_billboard_02.png'),
    end: require('../../../assets/game/images/bg_end_01.png'),
    endline: require('../../../assets/game/images/bg_end_line_01.png'),
    shadow: require('../../../assets/game/images/bg_shadow_02.png'),
  },
  {
    sky: require('../../../assets/game/images/bg_sky_03.png'),
    race: require('../../../assets/game/images/bg_race_03.png'),
    billboard: require('../../../assets/game/images/bg_billboard_03.png'),
    end: require('../../../assets/game/images/bg_end_01.png'),
    endline: require('../../../assets/game/images/bg_end_line_01.png'),
    shadow: require('../../../assets/game/images/bg_shadow_03.png'),
  },
] as const

// Scorebar constants
export const SCOREBAR = {
  SCALE: 0.85, // Reduced from 1.15 to make item_race_score smaller
  Y_PERCENT: 1.02, // 90% from top
  OFFSET_X: 165, // Score list offset X
  ICON_SPACING: -23, // Negative spacing for overlap
  PIN_RANGE: {
    startX: 95,
    endX: 340, // Extended further to match the full length of the progress bar
  },
  ICON_SCALE: 0.3, // Icon scale (25% of original size)
  ICON_Y: -28, // Icon Y position in score list - adjusted to be above horizontal progress line
  ICON_X: 115, // Icon X position adjustment for icon_[number].png assets
  PIN_Y: 60, // Pin Y position - adjusted to be above horizontal progress line
  PIN_X_OFFSET: -25, // Pin X position adjustment for item_race_pin.png
  PIN_SCALE: 0.5, // Pin scale adjustment for item_race_pin.png size
} as const

// Animation constants
export const ANIMATION = {
  // Entrance animation
  ENTRANCE_DURATION: 1200, // ms
  ENTRANCE_STAGGER: 80, // ms between each racer
  ENTRANCE_OFF_SCREEN_X: -300,

  // Jitter (organic speed variation)
  JITTER_FULL_AT: 8000, // ms remaining
  JITTER_GONE_AT: 4000, // ms remaining

  // Lock to final order
  LOCK_BLEND_AT: 6000, // ms remaining
  LOCK_FULL_AT: 1500, // ms remaining

  // End line appearance
  END_LINE_TRIGGER: 92, // progress percentage

  // Interpolation (optimized for smooth 60fps)
  LERP_SPEED: 0.12,
  LERP_SPEED_LOCKED: 0.15,
  ICON_LERP_SPEED: 0.2,

  // Pack positioning
  SPREAD_MULT: 3,
} as const

// Fallback duration if no server data
export const FALLBACK_DURATION_MS = 30_000

// Max base speed for normalization
export const MAX_BASE_SPEED = 1

// Debug
export const DEBUG_FINISH_OFFSET_X = 0
