import axios, {AxiosInstance} from 'axios';

const stakedropJsonUrl = '/stakedrop.json';
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

interface StakingInfo {
  nominator: string;
  nominee: string
  amount: number;
}
export type StakingInfoResult = StakingInfo[];
export async function getStakingInfo(era:number, nominator?: string): Promise<Response<StakingInfoResult>> {
  return await request<StakingInfoResult>('staking_info', {era, nominator});
}

interface EraStakeDetail {
  era: number;
  amount: number;
}
export type StakeAmountResult = EraStakeDetail[];
export async function getStakeAmount(nominator: string): Promise<Response<StakeAmountResult>> {
  return await request<StakeAmountResult>('stake_amount', {nominator});
}

export const startDate = new Date('2020-05-15T10:00:00Z');
export const endDate = new Date('2020-08-15T10:00:00Z');
export const startEra = 793;
export const daysSinceStart = Math.ceil(((new Date()).getTime() - startDate.getTime()) / 24 / 3600 / 1000);

export function points(ksm: number, days: number) {
  return ksm * days / 30 * Math.pow(1.01, (days - 30));
}

export const pointThreshold: number = points(2700000, 90);

interface EthAddress {
  eth_address: string;
}
export type EthAddressResult = EthAddress[];
export async function getEthAddress(account: string): Promise<Response<EthAddressResult>> {
  return await request<EthAddressResult>('eth_address', {account});
}

// [{"id":"674777", "nominator":"CczSz9z41uHpftVviWz91TgjLe3SmbvXfbAc958cjy7F6Qs", "end_era":"1160", "pha":"7422", "pha_est":"6995", "start_era":"793", "eras":"361"},
export interface StakedropReward {
  id: string;
  nominator: string;
  pha: string;
  eras: string;
  end_era: string;
  start_era: string;
}

let cachedReward: StakedropReward[] = [];
export async function getStakedropRewards(): Promise<StakedropReward[]> {
  if (cachedReward.length == 0) {
    const resp = await axios.get(stakedropJsonUrl)
    cachedReward = resp.data as StakedropReward[];
  }
  return cachedReward;
}
