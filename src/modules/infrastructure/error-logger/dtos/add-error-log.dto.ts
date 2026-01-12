import { Types } from "mongoose";

export interface AddErrorLogDto {
  message: any;
  user_id?: string;
  url?: string;
  browser?: string;
  stack?: string;
  method?: string;
  host?: string;
  ip?: string;
  body?: any;
  payload ?: any;
}
