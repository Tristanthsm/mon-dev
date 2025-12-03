import CoachSettings from '@/components/settings/CoachSettings';

export const metadata = {
  title: 'Réglages Coach IA',
};

export default function CoachSettingsPage() {
  // For V1 we load/save via parent page; keep persistence out of this PR
  const handleSave = async (payload: any) => {
    // TODO: Persist to Supabase / user profile
    console.log('Saving coach settings (V1 stub):', payload);
    // Optionally show a toast/notification
  };

  return (
    <div className="p-6">
      <CoachSettings onSave={handleSave} />
    </div>
  );
}
