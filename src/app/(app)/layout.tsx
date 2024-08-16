'use client'

import { useClerk, useUser } from "@clerk/nextjs";
import { ImageIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, Share2Icon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';
import { ReactNode, useState } from "react";

const sidebarItems = [
  {
    href: '/home',
    icon: LayoutDashboardIcon,
    label: 'Home'
  },
  {
    href: '/social-share',
    icon: Share2Icon,
    label: 'Social Share'
  },
  {
    href: '/video-upload',
    icon: UploadIcon,
    label: 'Video Upload'
  },
]

export default function AppLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathName = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()
  const signOutHandler = async () => await signOut()
  return (
    <div className="drawer lg:drawer-open">
      <input
        type="checkbox"
        className="drawer-toggle"
        id="sidebarDrawer"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* navbar */}
        <header className="w-full bg-base-200">
          <div className="navbar mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex-none lg:hidden">
              <label htmlFor="sidebarDrawer" className="btn btn-square btn-ghost drawer-button">
                <MenuIcon />
              </label>
            </div>
            <div className="flex-1">
              <Link href='/' onClick={() => router.push('/')}>
                <div className="btn btn-ghost normal-case text-2xl font-bold tracking-tight cursor-pointer text-white">
                  Cloudinary Showcase
                </div>
              </Link>
            </div>
            <div className="flex flex-none items-center space-x-4">
              {user && (
                <>
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.imageUrl} alt={user.username || user.emailAddresses[0].emailAddress} />
                    </div>
                  </div>
                  <span className="text-sm truncate max-w-xs lg:max-w-md text-white">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  <button className="btn btn-ghost btn-circle text-white" onClick={signOutHandler}>
                    <LogOutIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        {/* main content */}
        <main className="flex-grow">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8">
            {children}
          </div>
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="w-64 h-full flex flex-col bg-base-200">
          <div className="flex items-center justify-center py-4">
            <ImageIcon className="w-10 h-10 text-primary" />
          </div>
          <ul className="w-full text-base-content menu p-4 flex-grow">
            {sidebarItems.map(i => (
              <li className="mb-2" key={i.href}>
                <Link
                  href={i.href}
                  className={`
                    flex items-center space-x-4 px-4 py-2 rounded-lg 
                    ${pathName === i.href
                      ?
                      'bg-primary text-white'
                      :
                      'hover:bg-base-300'
                    }
                    `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i.icon className='w-6 h-6' />
                  <span>
                    {i.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {user && (
            <div className="p-4">
              <button onClick={signOutHandler} className="btn btn-outline btn-error w-full">
                <LogOutIcon className="mr-2 h-5 w-5" /> Sign Out
              </button>
            </div>
          )}
        </aside>
      </div>
      <Toaster position='top-center' />
    </div>
  )
}