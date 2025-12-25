import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import { ArrowLeft, Bell, Lock, Globe, Eye, Shield, Trash2 } from 'lucide-react'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  
  if (!user?.email) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400 text-lg">
            Manage your account preferences and security
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                <Bell className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-sm text-gray-400">Manage how you receive notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400 mt-1">Receive email updates about your orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A5BF13]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Event Reminders</p>
                  <p className="text-sm text-gray-400 mt-1">Get reminded about upcoming events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A5BF13]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Marketing Updates</p>
                  <p className="text-sm text-gray-400 mt-1">Receive news about new events and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A5BF13]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                <Lock className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Security</h2>
                <p className="text-sm text-gray-400">Keep your account secure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Password</p>
                  <p className="text-sm text-gray-400 mt-1">••••••••</p>
                </div>
                <button className="px-4 py-2 bg-[#A5BF13] hover:bg-[#8a9f10] text-[#292929] rounded-lg text-sm font-bold transition-all cursor-pointer">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400 mt-1">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#404040] rounded-lg text-sm font-medium transition-all cursor-pointer">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Active Sessions</p>
                  <p className="text-sm text-gray-400 mt-1">Manage devices logged into your account</p>
                </div>
                <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#404040] rounded-lg text-sm font-medium transition-all cursor-pointer">
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                <Eye className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Privacy</h2>
                <p className="text-sm text-gray-400">Control your data and visibility</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Profile Visibility</p>
                  <p className="text-sm text-gray-400 mt-1">Control who can see your profile</p>
                </div>
                <select className="px-4 py-2 bg-[#292929] border border-[#404040] rounded-lg text-white text-sm focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer">
                  <option>Everyone</option>
                  <option>Friends</option>
                  <option>Only Me</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Data Sharing</p>
                  <p className="text-sm text-gray-400 mt-1">Share data with partners for personalization</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A5BF13]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#292929] border border-[#404040] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A5BF13] bg-opacity-10 rounded-xl">
                <Globe className="w-6 h-6 text-[#A5BF13]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Preferences</h2>
                <p className="text-sm text-gray-400">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Language</p>
                  <p className="text-sm text-gray-400 mt-1">Choose your preferred language</p>
                </div>
                <select className="px-4 py-2 bg-[#292929] border border-[#404040] rounded-lg text-white text-sm focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Currency</p>
                  <p className="text-sm text-gray-400 mt-1">Preferred currency for pricing</p>
                </div>
                <select className="px-4 py-2 bg-[#292929] border border-[#404040] rounded-lg text-white text-sm focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>CAD ($)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#404040] rounded-xl">
                <div>
                  <p className="font-medium text-white">Timezone</p>
                  <p className="text-sm text-gray-400 mt-1">Event times will be shown in this timezone</p>
                </div>
                <select className="px-4 py-2 bg-[#292929] border border-[#404040] rounded-lg text-white text-sm focus:outline-none focus:border-[#A5BF13] transition-colors cursor-pointer">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#292929] border border-red-500 border-opacity-30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500 bg-opacity-10 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                <p className="text-sm text-gray-400">Irreversible actions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-red-500 border-opacity-20 rounded-xl">
                <div>
                  <p className="font-medium text-red-400">Delete Account</p>
                  <p className="text-sm text-gray-400 mt-1">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

