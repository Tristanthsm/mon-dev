import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCommit, Terminal, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

const activities = [
    {
        id: 1,
        type: 'git',
        action: 'Git Push',
        desc: 'feat: added terminal component',
        time: '5 min ago',
        status: 'success',
        icon: GitCommit,
    },
    {
        id: 2,
        type: 'terminal',
        action: 'npm install',
        desc: 'installed shadcn/ui dependencies',
        time: '15 min ago',
        status: 'success',
        icon: Terminal,
    },
    {
        id: 3,
        type: 'db',
        action: 'Migration',
        desc: 'created users table',
        time: '1 hour ago',
        status: 'warning',
        icon: Database,
    },
    {
        id: 4,
        type: 'error',
        action: 'Build Failed',
        desc: 'TypeScript error in server.ts',
        time: '2 hours ago',
        status: 'error',
        icon: AlertCircle,
    },
    {
        id: 5,
        type: 'git',
        action: 'Git Pull',
        desc: 'merged main branch',
        time: '3 hours ago',
        status: 'success',
        icon: CheckCircle2,
    },
];

const ActivityList = () => {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background`}>
                                <activity.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.desc}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                <Badge variant={activity.status === 'success' ? 'default' : activity.status === 'error' ? 'destructive' : 'secondary'}>
                                    {activity.time}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityList;
