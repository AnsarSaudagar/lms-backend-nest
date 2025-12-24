import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async set(key: string, value : any){
    return await this.cache.set(key, value);
  }

  async get(key : string){
    return await this.cache.get(key);
  }
}
