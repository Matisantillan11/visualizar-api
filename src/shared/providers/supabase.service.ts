import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private readonly supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
      );
    }

    // Regular client for normal operations
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Admin client for admin operations (requires service role key)
    if (supabaseServiceRoleKey) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      // Fallback to regular client if service role key is not provided

      this.supabaseAdmin = this.supabase;
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Send OTP to user's email
   */
  async sendOTP(email: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // We don't want to create users in Supabase auth, only in our local DB
      },
    });

    if (error) {
      throw new Error(`Failed to send OTP: ${error.message}`);
    }

    return data;
  }

  /**
   * Verify OTP and get session
   */
  async verifyOTP(email: string, token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    console.log({ data, error });
    if (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }

    return data;
  }

  /**
   * Verify a Supabase JWT token
   */
  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error) {
      throw new Error(`Failed to verify token: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user from Supabase by access token
   */
  async getUserFromToken(accessToken: string) {
    // Set the session with the access token
    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.getUser(accessToken);

    if (sessionError) {
      throw new Error(`Invalid session: ${sessionError.message}`);
    }

    return sessionData?.user;
  }

  /**
   * Create a new user in Supabase Auth
   * This uses the admin API to create users without requiring a password
   *
   * Note: Make sure your Supabase project has the following settings:
   * 1. Authentication > Providers > Email: Enabled
   * 2. Authentication > Settings > Enable email confirmations: Can be on or off
   * 3. You must use the service_role key (not anon key) for admin operations
   */
  async createUser(email: string) {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm the email so they can sign in with OTP
      user_metadata: {
        created_by: 'admin',
      },
      app_metadata: {
        provider: 'email',
      },
    });

    if (error) {
      throw new Error(`Failed to create Supabase user: ${error.message}`);
    }

    return data;
  }
}
