import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import { ArrowLeft, Wallet as WalletIcon, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default async function WalletPage() {
  const user = await getCurrentUser()
  
  if (!user?.email) {
    redirect('/auth/signin')
  }

  // Mock data - replace with real data from database
  const balance = 0
  const pendingBalance = 0
  const transactions = []

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-400 text-lg">
            Manage your funds and payment methods
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#A5BF13] to-[#8a9f10] rounded-2xl p-8 text-[#292929]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#292929] bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <WalletIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-80">Available Balance</p>
                    <p className="text-4xl font-bold mt-1">${balance.toFixed(2)}</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-[#292929] hover:bg-[#1a1a1a] text-white rounded-xl font-bold transition-all cursor-pointer">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Funds
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#292929] bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <p className="text-sm font-medium opacity-80 mb-1">Pending</p>
                  <p className="text-2xl font-bold">${pendingBalance.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-[#292929] bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <p className="text-sm font-medium opacity-80 mb-1">This Month</p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <button className="p-6 bg-[#292929] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg mb-3 group-hover:bg-opacity-20 transition-all">
                  <Plus className="w-6 h-6 text-[#A5BF13]" />
                </div>
                <p className="text-white font-bold text-sm">Add Funds</p>
              </button>

              <button className="p-6 bg-[#292929] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg mb-3 group-hover:bg-opacity-20 transition-all">
                  <ArrowUpRight className="w-6 h-6 text-[#A5BF13]" />
                </div>
                <p className="text-white font-bold text-sm">Withdraw</p>
              </button>

              <button className="p-6 bg-[#292929] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer">
                <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg mb-3 group-hover:bg-opacity-20 transition-all">
                  <Clock className="w-6 h-6 text-[#A5BF13]" />
                </div>
                <p className="text-white font-bold text-sm">History</p>
              </button>
            </div>

            {/* Transactions */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-dashed border-[#404040]">
                  <WalletIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-500">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Transaction items would go here */}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Payment Methods</h3>
                <button className="text-[#A5BF13] hover:text-[#8a9f10] text-sm font-medium cursor-pointer">
                  Add
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A5BF13] bg-opacity-10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-[#A5BF13]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">No cards added</p>
                      <p className="text-xs text-gray-400 mt-0.5">Add a payment method</p>
                    </div>
                  </div>
                </div>

                <button className="w-full p-4 border-2 border-dashed border-[#404040] rounded-xl text-gray-400 hover:border-[#A5BF13] hover:text-[#A5BF13] transition-all cursor-pointer">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Card
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Spent</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Earned</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Refunds</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Security</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Encrypted transactions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Buyer protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

