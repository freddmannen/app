import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { clearChats } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { SidebarList } from '@/components/sidebar-list';
import { IconNextChat, IconSeparator, IconVercel, IconGitHub, IconGoogle } from '@/components/ui/icons';
import { SidebarFooter } from '@/components/sidebar-footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { ClearHistory } from '@/components/clear-history';
import { UserMenu } from '@/components/user-menu';
import { auth } from '@/auth'
import { LoginButton } from '@/components/login-button'

export async function Header() {
  const session = await auth();
  // {session?.user ? (
  //   <Sidebar>
  //     <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
  //       {/* @ts-ignore */}
  //       <SidebarList userId={session?.user?.id} />
  //     </React.Suspense>
  //     <SidebarFooter>
  //       <ThemeToggle />
  //       <ClearHistory clearChats={clearChats} />
  //     </SidebarFooter>
  //   </Sidebar>
  // ) : (
  //   <Link href="/" target="_blank" rel="nofollow">
  //     <IconNextChat className="w-6 h-6 mr-2 dark:hidden" inverted />
  //     <IconNextChat className="hidden w-6 h-6 mr-2 dark:block" />
  //   </Link>
  // )}
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        

        <div className="flex items-center">
          <IconSeparator className="w-6 h-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button variant="link" asChild className="-ml-2">
              <Link href="/sign-in?callbackUrl=/">Login</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <LoginButton loginType="github" text="Login with GitHub" showIcon />
        <LoginButton loginType="google" text="Login with Google" showIcon />
      </div>
    </header>
  )
}