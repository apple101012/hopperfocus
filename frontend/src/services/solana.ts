/**
 * ChronoCharm Solana Integration
 * Phantom wallet connection and devnet transactions
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Phantom wallet types
interface PhantomProvider {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  publicKey?: PublicKey
  isConnected: boolean
}

declare global {
  interface Window {
    solana?: PhantomProvider
  }
}

const DEVNET_RPC = 'https://api.devnet.solana.com'

class SolanaService {
  connection: Connection

  constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed')
  }

  /**
   * Check if Phantom wallet is installed
   */
  isPhantomInstalled(): boolean {
    return typeof window !== 'undefined' && window.solana?.isPhantom === true
  }

  /**
   * Get Phantom provider
   */
  getProvider(): PhantomProvider | null {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      return window.solana
    }
    return null
  }

  /**
   * Connect to Phantom wallet
   */
  async connectWallet(): Promise<PublicKey | null> {
    const provider = this.getProvider()
    if (!provider) {
      window.open('https://phantom.app/', '_blank')
      return null
    }

    try {
      const response = await provider.connect()
      console.log('✓ Connected to Phantom:', response.publicKey.toString())
      return response.publicKey
    } catch (err) {
      console.error('❌ Wallet connection failed:', err)
      return null
    }
  }

  /**
   * Disconnect from Phantom wallet
   */
  async disconnectWallet(): Promise<void> {
    const provider = this.getProvider()
    if (provider) {
      await provider.disconnect()
      console.log('✓ Disconnected from Phantom')
    }
  }

  /**
   * Get connected wallet public key
   */
  getConnectedWallet(): PublicKey | null {
    const provider = this.getProvider()
    return provider?.publicKey || null
  }

  /**
   * Request devnet SOL airdrop (for "Proof of Focus" completion reward)
   * This is the hackathon flex - real blockchain transaction on Solana devnet
   */
  async airdropProofOfFocus(recipientPubkey: PublicKey): Promise<string | null> {
    try {
      // Request 0.1 SOL airdrop (proof of quest completion)
      const signature = await this.connection.requestAirdrop(
        recipientPubkey,
        0.1 * LAMPORTS_PER_SOL
      )

      // Wait for confirmation
      await this.connection.confirmTransaction(signature)

      console.log('✓ Proof of Focus airdrop confirmed:', signature)
      return signature
    } catch (err) {
      console.error('❌ Airdrop failed:', err)
      return null
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(pubkey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(pubkey)
      return balance / LAMPORTS_PER_SOL
    } catch (err) {
      console.error('❌ Failed to get balance:', err)
      return 0
    }
  }
}

export const solana = new SolanaService()
