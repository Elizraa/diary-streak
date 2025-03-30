import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { handleStampSubmit } from '@/utils/handleStampSubmit';

interface FormData {
  username: string;
  pin: string;
  notes?: string;
}

export default function StampForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    pin: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await handleStampSubmit(formData);

    setMessage(result.message);
    if (result.success) {
      setFormData({ username: '', pin: '', notes: '' });
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-4 shadow-lg">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Stamp In</h2>
        {message && (
          <p className="mb-2 text-center text-sm text-gray-600">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="pin"
            placeholder="PIN"
            value={formData.pin}
            onChange={handleChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <Input
            type="text"
            name="notes"
            placeholder="Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Stamp In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
