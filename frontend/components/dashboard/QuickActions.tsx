import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, GitBranch, Play } from 'lucide-react';

const QuickActions = () => {
    const handleAction = (action: string) => {
        console.log(`Action triggered: ${action}`);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
                className="h-auto flex-col items-start p-4 space-y-2 bg-cyan-600 hover:bg-cyan-700"
                onClick={() => handleAction('save-push')}
            >
                <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5" />
                    <span className="font-bold">Sauvegarder & Push</span>
                </div>
                <span className="text-xs opacity-90">Commit changes & push to remote</span>
            </Button>

            <Button
                className="h-auto flex-col items-start p-4 space-y-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleAction('pull-sync')}
            >
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5" />
                    <span className="font-bold">Pull & Sync</span>
                </div>
                <span className="text-xs opacity-90">Update local from remote</span>
            </Button>

            <Button
                className="h-auto flex-col items-start p-4 space-y-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleAction('new-branch')}
            >
                <div className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" />
                    <span className="font-bold">Nouvelle branche</span>
                </div>
                <span className="text-xs opacity-90">Create feature branch</span>
            </Button>

            <Button
                className="h-auto flex-col items-start p-4 space-y-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleAction('start-project')}
            >
                <div className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span className="font-bold">Lancer projet</span>
                </div>
                <span className="text-xs opacity-90">Start dev servers</span>
            </Button>
        </div>
    );
};

export default QuickActions;
