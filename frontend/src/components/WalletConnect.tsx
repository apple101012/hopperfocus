/**
 * WalletConnect Component
 * Phantom wallet connection UI for Solana devnet
 */

import React, { useState, useEffect } from 'react'
import { Wallet, Zap } from 'lucide-react'
import { solana } from '../services/solana'
import { PublicKey } from '@solana/web3.js'

interface WalletConnectProps {
  onQuestComplete?: () => void
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onQuestComplete }) => {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    // Check if already connected
    const key = solana.getConnectedWallet()
    if (key) {
      setPublicKey(key)
      setConnected(true)
      loadBalance(key)
    }
  }, [])

  const loadBalance = async (key: PublicKey) => {
    const bal = await solana.getBalance(key)
    setBalance(bal)
  }

  const handleConnect = async () => {
    const key = await solana.connectWallet()
    if (key) {
      setPublicKey(key)
      setConnected(true)
      await loadBalance(key)
    }
  }

  const handleDisconnect = async () => {
    await solana.disconnectWallet()
    setPublicKey(null)
    setConnected(false)
    setBalance(0)
  }

  const handleClaimProof = async () => {
    if (!publicKey) return

    setClaiming(true)
    try {
      const signature = await solana.airdropProofOfFocus(publicKey)
      if (signature) {
        alert(`🎉 Proof of Focus claimed! Transaction: ${signature}`)
        await loadBalance(publicKey)
        onQuestComplete?.()
      } else {
        alert('❌ Failed to claim Proof of Focus. Check devnet RPC status.')
      }
    } catch (err) {
      alert('❌ Transaction failed')
    } finally {
      setClaiming(false)
    }
  }

  if (!connected) {
    return (
      <div className="contract-card">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-5 h-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-amber-900">Phantom Wallet</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Connect your Solana wallet to receive "Proof of Focus" NFT rewards when you complete quest logs.
        </p>
        <button
          onClick={handleConnect}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Connect Wallet
        </button>
        {!solana.isPhantomInstalled() && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Don't have Phantom? Click to install
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="contract-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Disconnect
        </button>
      </div>

      <div className="bg-amber-50 rounded p-3 mb-3">
        <p className="text-xs text-gray-600 mb-1">Wallet Address</p>
        <p className="text-xs font-mono text-gray-800 truncate">
          {publicKey?.toString()}
        </p>
        <p className="text-xs text-gray-600 mt-2">Balance: {balance.toFixed(4)} SOL</p>
      </div>

      <button
        onClick={handleClaimProof}
        disabled={claiming}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        {claiming ? 'Claiming...' : 'Claim Proof of Focus (0.1 SOL)'}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Complete all tasks to earn devnet SOL
      </p>
    </div>
  )
}
