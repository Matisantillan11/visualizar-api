import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseKey);
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
}
