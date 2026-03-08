import React from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { GameContainer } from '../../components/game/GameContainer'

export const GameScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameWrapper}>
        <GameContainer />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1840',
  },
  gameWrapper: {
    flex: 1,
  },
})
