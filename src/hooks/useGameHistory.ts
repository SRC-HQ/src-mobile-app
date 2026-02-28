import { useQuery } from '@tanstack/react-query'

export interface HistoryRow {
  id: string
  race: string
  block: string
  winnerIndex: number
  winnersCount: number
  totalPool: string
  babyKing: string
  time: string
}

const fetchGameHistory = async (): Promise<HistoryRow[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('YOUR_API_ENDPOINT/game-history')
  // return response.json()

  // Mock data with simulated delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return [
    {
      id: '1',
      race: '#3942',
      block: 'Bx7k...9mP2',
      winnerIndex: 0,
      winnersCount: 125,
      totalPool: '13.9628',
      babyKing: 'Hit',
      time: 'Just now',
    },
    {
      id: '2',
      race: '#3941',
      block: 'Cx8m...4nQ3',
      winnerIndex: 2,
      winnersCount: 311,
      totalPool: '15.6228',
      babyKing: 'Miss',
      time: '10s ago',
    },
    {
      id: '3',
      race: '#3940',
      block: 'Dy9n...5oR4',
      winnerIndex: 6,
      winnersCount: 89,
      totalPool: '11.2341',
      babyKing: 'Hit',
      time: '1m ago',
    },
    {
      id: '4',
      race: '#3939',
      block: 'Ez0o...6pS5',
      winnerIndex: 1,
      winnersCount: 203,
      totalPool: '18.5672',
      babyKing: 'Miss',
      time: '2m ago',
    },
    {
      id: '5',
      race: '#3938',
      block: 'Fa1p...7qT6',
      winnerIndex: 4,
      winnersCount: 156,
      totalPool: '14.3421',
      babyKing: 'Hit',
      time: '3m ago',
    },
    {
      id: '6',
      race: '#3937',
      block: 'Gb2q...8rU7',
      winnerIndex: 8,
      winnersCount: 278,
      totalPool: '19.8765',
      babyKing: 'Miss',
      time: '5m ago',
    },
    {
      id: '7',
      race: '#3936',
      block: 'Hc3r...9sV8',
      winnerIndex: 3,
      winnersCount: 192,
      totalPool: '16.4532',
      babyKing: 'Hit',
      time: '7m ago',
    },
    {
      id: '8',
      race: '#3935',
      block: 'Id4s...0tW9',
      winnerIndex: 5,
      winnersCount: 145,
      totalPool: '12.7891',
      babyKing: 'Miss',
      time: '10m ago',
    },
  ]
}

export const useGameHistory = () => {
  return useQuery({
    queryKey: ['gameHistory'],
    queryFn: fetchGameHistory,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
