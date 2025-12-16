import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase: SupabaseClient;
  private readonly supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey =
      this.configService.get<string>('SUPABASE_SR_KEY');

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
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
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
   * Session expires in 1 year (365 days)
   *
   * IMPORTANT: To set session expiration to 1 year, configure it in your Supabase project:
   * 1. Go to Supabase Dashboard > Authentication > Settings
   * 2. Under "Session Management", set "Time-box user sessions" to 525600 minutes (1 year)
   * 3. Optionally set "Inactivity timeout" as needed
   *
   * Session expiration cannot be set programmatically via the SDK - it must be configured
   * at the project level in the Supabase dashboard.
   */
  async verifyOTP(email: string, token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

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
   * Get user from Supabase Auth by email
   * This uses the admin API to search for users by email
   */
  async getUserByEmail(email: string) {
    try {
      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers();

      if (error) {
        throw new Error(`Failed to list Supabase users: ${error.message}`);
      }

      const emailToLowerCase = email.toLowerCase();
      const user = data.users.find(
        (u) => u.email?.toLowerCase() === emailToLowerCase,
      );
      return user || null;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to get user by email: ${err.message}`);
    }
  }

  /**
   * Create a new user in Supabase Auth
   * This uses the admin API to create users without requiring a password
   * If the user already exists in Supabase, returns the existing user
   */
  async createUser(email: string, name: string) {
    // Create new user in Supabase Auth
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      user_metadata: {
        name,
      }, // Optional: add extra data like a name or age
      email_confirm: true,
      app_metadata: {
        provider: 'email',
      },
    });

    if (error) {
      // If user already exists error, try to get the existing user
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists') ||
        error.message.includes('User already registered')
      ) {
        const existingUser = await this.getUserByEmail(email.toLowerCase());
        if (existingUser) {
          return {
            user: existingUser,
            session: null,
          };
        }
      }
      throw new Error(`Failed to create Supabase user: ${error.message}`);
    }
    return data;
  }
}
