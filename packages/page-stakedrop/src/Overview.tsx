import React, { useEffect, useState, useMemo } from 'react';

import { Balance } from '@polkadot/types/interfaces';
import { BareProps } from '@polkadot/react-components/types';
import { DeriveStakingOverview, DeriveSessionProgress } from '@polkadot/api-derive/types';
import { useApi, useCall, useFavorites } from '@polkadot/react-hooks';
import { formatBalance, formatNumber } from '@polkadot/util';

import { SummaryBox, CardSummary } from '@polkadot/react-components';

import StakeOverview from '@polkadot/app-staking/Overview';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';

import { useTranslation } from './translate';
import * as StakedropApi from './api';

export const STORE_FAVS_BASE = 'staking:favorites';

interface Props extends BareProps {
  // hasQueries: boolean;
  // isIntentions?: boolean;
  next?: string[];
  stakingOverview?: DeriveStakingOverview;
  whitelist?: string[];
}

function Overview ({next, stakingOverview, whitelist}: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { api } = useApi();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);
  const { totalStaked } = useSortedTargets(favorites);
  const sessionInfo = useCall<DeriveSessionProgress>(api.derive.session?.progress, []);
  const totalIssuance = useCall<Balance>(api.query.balances?.totalIssuance, []);
  const [percentage, setPercentage] = useState<string>('-');

  useEffect((): void => {
    totalIssuance && totalStaked?.gtn(0) && setPercentage(
      `${(totalStaked.muln(10000).div(totalIssuance).toNumber() / 100).toFixed(2)}%`
    );
  }, [totalIssuance, totalStaked]);

  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [stakePoints, setStakePoints] = useState<number>(0);
  const [stakePointsEst, setStakePointsEst] = useState<number>(0);
  useEffect(() => {
    if (!sessionInfo || !sessionInfo.activeEra) {
      return;
    }
    const currentEra = sessionInfo.activeEra.toNumber();
    [
      async () => {
        const r = await StakedropApi.getTotalStaking(currentEra);
        if (r.status == 'ok') {
          const amount = r.result[0].total_amount / 1000;
          setStakeAmount(amount);
          setStakePointsEst(StakedropApi.points(amount, 90));
        }
      },
      async () => {
        const r = await StakedropApi.getPoints(currentEra);
        if (r.status == 'ok') {
          const points = r.result[0].total_point_est;
          setStakePoints(points);
        }
      }
    ].map(f => f());
  }, [sessionInfo]);
  const totalPHA = useMemo(() => {
    let rate = stakePoints / StakedropApi.pointThreshold;
    if (rate <= 1) {
      rate = 1;
    }
    return 27000000 * rate;
  }, [stakePoints])

  return (
    <>
      <SummaryBox>
        <CardSummary label={t('KSM network staked')}>
          {percentage}
        </CardSummary>
        <CardSummary label={t('KSM participating')}>
          {formatBalance(stakeAmount, undefined, 0)}
        </CardSummary>
        <CardSummary label={t('stakedrop participate rate (est.)')}>
          {(stakePointsEst / StakedropApi.pointThreshold * 100).toFixed(2)}%
        </CardSummary>
        <CardSummary label={t('PHA total reward (est.)')}>
          {formatNumber(totalPHA)}
        </CardSummary>
      </SummaryBox>

      <StakeOverview
        // className={basePath === pathname ? '' : 'staking--hidden'}
        hasQueries={true}
        showType='both'
        next={next}
        stakingOverview={stakingOverview}
        whitelist={whitelist}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    </>
  )
}

export default Overview;
