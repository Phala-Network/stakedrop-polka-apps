import axios, {AxiosInstance} from 'axios';

export const api: AxiosInstance =  axios.create({baseURL: 'https://stakedrop.phala.network/api/'});

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

interface Points {
  total_point: number;
  total_point_est: number;
}
export type PointsResult = Points[];
export async function getPoints(era: number): Promise<Response<PointsResult>> {
  return await request<PointsResult>('stakedrop_point', {era});
}

export const startDate = new Date('2020-05-15T10:00:00Z');

export function points(ksm: number, days: number) {
  return ksm * days / 30 * Math.pow(1.01, (days - 30));
}

export const pointThreshold: number = points(2700000, 90);