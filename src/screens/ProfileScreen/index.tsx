import React, { useMemo } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AvatarDefaultIcon } from '../../components/svgs'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useProfile } from '../../hooks/useProfile'
import { ProfileSkeleton } from '../../components/LoadingSkeleton'

interface ProfileScreenProps {
  onBack: () => void
}

const ProfileScreenComponent = ({ onBack }: ProfileScreenProps) => {
  const insets = useSafeAreaInsets()
  const { account } = useMobileWallet()
  const address = account?.address?.toString() || ''
  const { data: profile, isLoading } = useProfile(address)

  const displayAddress = useMemo(() => {
    if (!address) return ''
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }, [address])

  const fullAddress = useMemo(() => {
    if (!address) return ''
    return `${address.slice(0, 12)}...${address.slice(-12)}`
  }, [address])

  return (
    <View className="flex-1 bg-[#0a0b0d]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <View className="flex-row items-center">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 items-center justify-center mr-2 rounded-lg active:bg-white/10"
          >
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-xl">
            Account
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Profile Info */}
            <View className="items-center py-8">
              <View className="mb-4">
                <AvatarDefaultIcon width={100} height={100} />
              </View>
              <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-xl mb-2">
                {profile?.username || '@username123'}
              </Text>
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-sm">
                {displayAddress}
              </Text>
            </View>

            {/* Profile Details */}
            <View className="px-6 py-4 gap-4">
              <View className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-2">
                  Username
                </Text>
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-base">
                  {profile?.username || '@username123'}
                </Text>
              </View>

              <View className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-2">
                  Wallet Address
                </Text>
                <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white text-sm">
                  {fullAddress}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

export const ProfileScreen = React.memo(ProfileScreenComponent)
ProfileScreen.displayName = 'ProfileScreen'
