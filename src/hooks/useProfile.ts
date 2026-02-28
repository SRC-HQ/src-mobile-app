import { useQuery } from '@tanstack/react-query'

interface ProfileData {
  username: string
  address: string
  image?: string
}

const fetchProfile = async (address: string): Promise<ProfileData> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`YOUR_API_ENDPOINT/profile/${address}`)
  // return response.json()

  // Mock data for now
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    username: '@username123',
    address,
  }
}

export const useProfile = (address: string) => {
  return useQuery({
    queryKey: ['profile', address],
    queryFn: () => fetchProfile(address),
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
