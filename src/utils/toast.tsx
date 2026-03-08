import React from 'react'
import { Toast } from 'heroui-native'
import { Pressable, Text, Linking } from 'react-native'
import { ENV } from '../config/env'

export type ToastVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

interface ShowToastOptions {
  variant?: ToastVariant
  label: string
  description?: string
  actionLabel?: string
  onActionPress?: () => void
  duration?: number | 'persistent'
}

interface ShowTransactionToastOptions {
  variant: 'success' | 'danger'
  label: string
  description?: string
  txHash: string
  duration?: number | 'persistent'
}

/**
 * Get Solscan URL based on current network environment
 */
const getSolscanUrl = (txHash: string): string => {
  const cluster = ENV.SOLANA_NETWORK === 'mainnet-beta' ? '' : `?cluster=${ENV.SOLANA_NETWORK}`
  return `https://solscan.io/tx/${txHash}${cluster}`
}

/**
 * Open transaction in Solscan
 */
const openTransaction = (txHash: string) => {
  const url = getSolscanUrl(txHash)
  Linking.openURL(url).catch((err) => console.error('Failed to open transaction:', err))
}

/**
 * Show a basic toast notification
 */
export const showToast = (
  toast: any,
  { variant = 'default', label, description, actionLabel, onActionPress, duration = 4000 }: ShowToastOptions,
) => {
  return toast.show({
    variant,
    label,
    description,
    actionLabel,
    onActionPress: actionLabel && onActionPress ? () => onActionPress() : undefined,
    duration,
  })
}

/**
 * Show a toast with transaction link
 */
export const showTransactionToast = (
  toast: any,
  { variant, label, description, txHash, duration = 10000 }: ShowTransactionToastOptions,
) => {
  return toast.show({
    component: (props: any) => (
      <Toast variant={variant} placement="top" className="bg-[#1a1b1e] border border-white/20 w-full mx-4" {...props}>
        <Toast.Title className="text-white">{label}</Toast.Title>
        {description && <Toast.Description className="text-white/80">{description}</Toast.Description>}
        <Pressable
          onPress={() => openTransaction(txHash)}
          className="mt-2 bg-[#b6b0ff] px-3 py-2 rounded-lg active:bg-[#a5a0ef]"
        >
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-black text-xs">
            View Transaction
          </Text>
        </Pressable>
        <Toast.Close className="absolute top-2 right-2" iconProps={{ color: '#ffffff' }} />
      </Toast>
    ),
    duration,
  })
}

/**
 * Show success toast
 */
export const showSuccessToast = (toast: any, label: string, description?: string) => {
  return showToast(toast, {
    variant: 'success',
    label,
    description,
    duration: 10000,
  })
}

/**
 * Show error toast
 */
export const showErrorToast = (toast: any, label: string, description?: string) => {
  return showToast(toast, {
    variant: 'danger',
    label,
    description,
    duration: 10000,
  })
}

/**
 * Show warning toast
 */
export const showWarningToast = (toast: any, label: string, description?: string) => {
  return showToast(toast, {
    variant: 'warning',
    label,
    description,
    duration: 10000,
  })
}

/**
 * Show claim success toast with transaction link
 */
export const showClaimSuccessToast = (toast: any, txHash: string, amount: string) => {
  return showTransactionToast(toast, {
    variant: 'success',
    label: 'Claim Successful!',
    description: `You have claimed ${amount} SOL`,
    txHash,
  })
}

/**
 * Show claim error toast
 */
export const showClaimErrorToast = (toast: any, error?: string) => {
  return showErrorToast(toast, 'Claim Failed', error || 'Failed to claim winnings. Please try again.')
}

/**
 * Show pick sperm success toast with transaction link
 */
export const showPickSpermSuccessToast = (toast: any, txHash: string, spermIds: number[], amount: string) => {
  const spermText = spermIds.length === 1 ? `Sperm #${spermIds[0] + 1}` : `${spermIds.length} sperms`
  return showTransactionToast(toast, {
    variant: 'success',
    label: 'Bet Placed Successfully!',
    description: `${spermText} - ${amount} SOL`,
    txHash,
  })
}

/**
 * Show pick sperm error toast
 */
export const showPickSpermErrorToast = (toast: any, error?: string) => {
  return showErrorToast(toast, 'Bet Failed', error || 'Failed to place bet. Please try again.')
}
