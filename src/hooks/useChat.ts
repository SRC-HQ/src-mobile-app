import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChats, sendChat, type ChatMessage, type CreateChatDto } from '../services/api/chat'

export const useChats = (limit = 100) => {
  return useQuery({
    queryKey: ['chats', limit],
    queryFn: () => fetchChats(0, limit),
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10, // Refetch every 10 seconds
  })
}

export const useSendChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateChatDto) => sendChat(dto),
    onSuccess: (newMessage) => {
      // Optimistically update the cache
      queryClient.setQueryData<ChatMessage[]>(['chats', 100], (old) => {
        if (!old) return [newMessage]
        return [newMessage, ...old]
      })
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
