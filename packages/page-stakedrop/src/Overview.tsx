import React, { useEffect, useState } from 'react';

import { Balance } from '@polkadot/types/interfaces';
import { BareProps } from '@polkadot/react-components/types';
import { DeriveStakingOverview, DeriveSessionProgress } from '@polkadot/api-derive/types';
import { useApi, useCall, useFavorites } from '@polkadot/react-hooks';

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
  const [percentage, setPercentage] = useState<string | undefined>();

  useEffect((): void => {
    totalIssuance && totalStaked?.gtn(0) && setPercentage(
      `${(totalStaked.muln(10000).div(totalIssuance).toNumber() / 100).toFixed(2)}%`
    );
  }, [totalIssuance, totalStaked]);

  const [stakeAmount, setStakeAmount] = useState<number>(0);
  useEffect(() => {
    if (!sessionInfo || !sessionInfo.activeEra) {
      return;
    }
    if (new Date() < StakedropApi.startDate) {
      return;
    }
    // console.log('era', sessionInfo.activeEra.toNumber(), sessionInfo.currentEra);
    const currentEra = sessionInfo.activeEra.toNumber();

    async function sendRequest() {
      const r = await StakedropApi.getTotalStaking(currentEra);
      if (r.status == 'ok') {
        const amount = r.result[0].total_amount;
        setStakeAmount(amount);
      }
    }
    sendRequest();

  }, [sessionInfo]) 

  return (
    <>
      <SummaryBox>
        <CardSummary label={t('KSM total staked')}>
          {percentage}
        </CardSummary>
        <CardSummary label={t('stakedrop participate rate')}>
          {(stakeAmount / StakedropApi.pointThreshold * 100).toFixed(2)}%
        </CardSummary>
        <CardSummary label={t('PHA total reward (est.)')}>
          27,000,000
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