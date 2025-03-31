import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '../../../src/utils/supabase/client';

global.process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
global.process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('createClient', () => {
  it('should call createBrowserClient with environment variables', () => {
    createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  });
});
