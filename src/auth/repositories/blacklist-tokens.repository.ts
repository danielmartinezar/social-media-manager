import { Injectable } from '@nestjs/common';
import { DataSource, Repository, MoreThan, LessThan } from 'typeorm';
import { BlacklistedToken } from '../entity/blacklist-tokens.entity';

@Injectable()
export class BlacklistRepository extends Repository<BlacklistedToken> {
  constructor(private readonly dataSource: DataSource) {
    super(BlacklistedToken, dataSource.createEntityManager());
  }

  /**
   * Create and persist a new blacklist entry.
   * @param jti    Unique JWT identifier (the “jti” claim).
   * @param expiresAt  Absolute Date when this entry should expire.
   */
  async addEntry(jti: string, expiresAt: Date): Promise<BlacklistedToken> {
    const entry = this.create({ jti, expiresAt });
    return this.save(entry);
  }

  /**
   * Find a non-expired blacklist entry by its jti.
   * @param jti  Unique JWT identifier to look up.
   * @returns    The entry if found and not expired, or null otherwise.
   */
  async findActive(jti: string): Promise<BlacklistedToken | null> {
    return this.findOne({
      where: {
        jti,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  /**
   * Delete all entries whose expiration is in the past.
   * @returns  Number of deleted rows.
   */
  async pruneExpired(): Promise<number> {
    const result = await this.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}
