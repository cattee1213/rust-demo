'use client'

import { getSolanajournaldappProgram, getSolanajournaldappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useSolanajournaldappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanajournaldappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSolanajournaldappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['solanajournaldapp', 'all', { cluster }],
    queryFn: () => program.account.solanajournaldapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['solanajournaldapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ solanajournaldapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSolanajournaldappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolanajournaldappProgram()

  const accountQuery = useQuery({
    queryKey: ['solanajournaldapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.solanajournaldapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['solanajournaldapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ solanajournaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['solanajournaldapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ solanajournaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['solanajournaldapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ solanajournaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['solanajournaldapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ solanajournaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
