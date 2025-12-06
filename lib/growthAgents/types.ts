export type GrowthAction =
    | 'content'
    | 'hooks'
    | 'analytics'
    | 'schedule'
    | 'trends'
    | 'responses';

export interface GrowthAgent {
    platform: string;
    title: string;
    description: string;
    capabilities: GrowthAction[];
    run: (payload: { message: string; action?: GrowthAction }) => Promise<string>;
}
