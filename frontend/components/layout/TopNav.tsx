import React from 'react';
import Link from 'next/link';
import { Terminal, Github, Database, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopNav = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">Dev Cockpit</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
                            Dashboard
                        </Link>
                        <Link href="/terminal" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Terminal
                        </Link>
                        <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            GitHub
                        </Link>
                        <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Supabase
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
