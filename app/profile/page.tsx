import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import { ArrowLeft, UserCircle, Mail, Calendar, Shield, Edit } from 'lucide-react'
import { format } from 'date-fns'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user?.email) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400 text-lg">
            Manage your personal information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-[#A5BF13] flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-[#292929]">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{user.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A5BF13] bg-opacity-10 text-[#A5BF13] rounded-lg text-sm font-medium">
                <Shield className="w-4 h-4" />
                {user.role}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Personal Information</h3>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg text-sm font-bold transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-[#404040]">
                  <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg">
                    <UserCircle className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Full Name</p>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b border-[#404040]">
                  <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg">
                    <Mail className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Email Address</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b border-[#404040]">
                  <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg">
                    <Shield className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Account Type</p>
                    <p className="text-white font-medium capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#A5BF13]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
                    <p className="text-white font-medium">
                      {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/orders"
                  className="p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer"
                >
                  <p className="text-sm text-gray-400 mb-1">Orders</p>
                  <p className="text-2xl font-bold text-white group-hover:text-[#A5BF13] transition-colors">View</p>
                </Link>
                <Link
                  href="/wallet"
                  className="p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer"
                >
                  <p className="text-sm text-gray-400 mb-1">Wallet</p>
                  <p className="text-2xl font-bold text-white group-hover:text-[#A5BF13] transition-colors">Manage</p>
                </Link>
                <Link
                  href="/settings"
                  className="p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer"
                >
                  <p className="text-sm text-gray-400 mb-1">Settings</p>
                  <p className="text-2xl font-bold text-white group-hover:text-[#A5BF13] transition-colors">Configure</p>
                </Link>
                {user.role === 'ORGANIZER' && (
                  <Link
                    href="/organizer/events/create"
                    className="p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl hover:border-[#A5BF13] transition-all group cursor-pointer"
                  >
                    <p className="text-sm text-gray-400 mb-1">Events</p>
                    <p className="text-2xl font-bold text-white group-hover:text-[#A5BF13] transition-colors">Create</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

