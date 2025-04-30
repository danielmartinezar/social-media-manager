import { Injectable } from '@nestjs/common';
import { BlacklistRepository } from '../repositories/blacklist-tokens.repository';

@Injectable()
export class BlacklistService {
  constructor(private readonly blacklistRepo: BlacklistRepository) {}

  /**
   * Blacklist a token by its jti for the remaining TTL.
   * @param jti        Unique JWT identifier from the token payload.
   * @param ttlSeconds Number of seconds until the original JWT expires.
   */
  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.blacklistRepo.addEntry(jti, expiresAt);
  }

  /**
   * Returns true if the given jti is currently blacklisted.
   * @param jti  Unique JWT identifier to check.
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const entry = await this.blacklistRepo.findActive(jti);
    return entry !== null;
  }
}
