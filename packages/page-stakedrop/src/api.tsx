import axios, {AxiosInstance} from 'axios';

 // http://34.90.127.31/
export const api: AxiosInstance =  axios.create({baseURL: 'http://stakedrop.phala.network'});

export interface Response<T> {
  status: "ok" | "error";
  result: T;
}

export async function request<T>(method: string, params?: any): Promise<Response<T>> {
  const resp = await api.get<Response<T>>(method, {params});
  return resp.data;
}

interface WhitelistItem {
  id: number;
  stash: string;
  validator: string;
  site: string;
  email: string;
  riot: string;
  twitter: string;
  controller: string;
}

export type WhitelistResult = WhitelistItem[];
export async function getWhitelist(): Promise<Response<WhitelistResult>> {
  return await request<WhitelistResult>('whitelist');
}

export interface EventTime {
  start_time: number;
  end_time: number;
}
export async function getStakedropTime(): Promise<Response<EventTime>> {
  return await request<EventTime>('stakedrop_time');
}

interface TotalStaking {
  total_amount: number;
}
export type TotalStakingResult = TotalStaking[];
export async function getTotalStaking(era: number): Promise<Response<TotalStakingResult>> {
  return await request<TotalStakingResult>('total_staking', {era});
}

