import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { RACER_COUNT, RACE_CONFIG } from '../../game/constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const RaceTrack: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Track lanes */}
      {Array.from({ length: RACER_COUNT + 1 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.lane,
            {
              top: RACE_CONFIG.START_Y + index * RACE_CONFIG.LANE_HEIGHT,
            },
          ]}
        />
      ))}

      {/* Start line */}
      <View
        style={[
          styles.startLine,
          {
            left: RACE_CONFIG.START_X,
            top: RACE_CONFIG.START_Y,
            height: RACER_COUNT * RACE_CONFIG.LANE_HEIGHT,
          },
        ]}
      />

      {/* Finish line */}
      <View
        style={[
          styles.finishLine,
          {
            left: RACE_CONFIG.FINISH_X,
            top: RACE_CONFIG.START_Y,
            height: RACER_COUNT * RACE_CONFIG.LANE_HEIGHT,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5b5880',
    position: 'relative',
  },
  lane: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  startLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#33ff57',
  },
  finishLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#ff5733',
  },
})
