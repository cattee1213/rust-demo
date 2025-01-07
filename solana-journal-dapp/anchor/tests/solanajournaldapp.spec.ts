import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Solanajournaldapp} from '../target/types/solanajournaldapp'

describe('solanajournaldapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solanajournaldapp as Program<Solanajournaldapp>

  const solanajournaldappKeypair = Keypair.generate()

  it('Initialize Solanajournaldapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        solanajournaldapp: solanajournaldappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanajournaldappKeypair])
      .rpc()

    const currentCount = await program.account.solanajournaldapp.fetch(solanajournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solanajournaldapp', async () => {
    await program.methods.increment().accounts({ solanajournaldapp: solanajournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanajournaldapp.fetch(solanajournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solanajournaldapp Again', async () => {
    await program.methods.increment().accounts({ solanajournaldapp: solanajournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanajournaldapp.fetch(solanajournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solanajournaldapp', async () => {
    await program.methods.decrement().accounts({ solanajournaldapp: solanajournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanajournaldapp.fetch(solanajournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solanajournaldapp value', async () => {
    await program.methods.set(42).accounts({ solanajournaldapp: solanajournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanajournaldapp.fetch(solanajournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solanajournaldapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solanajournaldapp: solanajournaldappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solanajournaldapp.fetchNullable(solanajournaldappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
