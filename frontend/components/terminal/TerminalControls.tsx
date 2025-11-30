import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Wifi } from 'lucide-react';

const TerminalControls = () => {
    return (
        <div className="flex items-center justify-between pb-4">
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                    <Wifi className="mr-1 h-3 w-3" />
                    Connecté
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => { }}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                </Button>
                <Button variant="outline" size="sm" onClick={() => { }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
};

export default TerminalControls;
