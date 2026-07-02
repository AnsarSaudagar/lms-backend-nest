import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async set(key: string, value : any, ttl : number){
    return await this.cache.set(key, value, ttl);
  }

  async get(key : string){
    return await this.cache.get(key);
  }

  async delete(key: string){
    return await this.cache.del(key);
  }
}
