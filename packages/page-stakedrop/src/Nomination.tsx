import React, { useEffect, useState, useMemo } from 'react';

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { SummaryBox, CardSummary } from '@polkadot/react-components';
import { formatBalance } from '@polkadot/util';
import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';

import * as StakedropAPI from './api';
import { useTranslation } from './translate';

interface Props {
}

function Nomination ({} :Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { hasAccounts, allAccounts } = useAccounts();
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  });
  // const [{ bondedTotal, foundStashes }, setState] = useState<State>({});

  useEffect(()=> {
    if (!hasAccounts || !activeEra) {
      return;
    }

    const currentEra = activeEra?.toNumber();
    (async () => {
      const stakingInfo = await StakedropAPI.getStakingInfo(currentEra);
      if (stakingInfo.status == 'ok') {
        const myStake = stakingInfo.result.filter(({nominator}) => allAccounts.includes(nominator));
        const totalStaked = myStake.reduce((sum, stake) => sum + stake.amount, 0) / 1000;
        setParticpated(totalStaked)
      }
    })();

    (async () => {
      const r = await StakedropAPI.getTotalStaking(currentEra);
      if (r.status == 'ok') {
        const amount = r.result[0].total_amount / 1000;
        setEventAmount(amount);
      }
    })();
  }, [allAccounts, activeEra])

  const [particpated, setParticpated] = useState(0);
  const [eventAmount, setEventAmount] = useState(0);

  const [minPHA, estPHA30, estPHA90] = useMemo((): number[] => {
    const minDeorm = StakedropAPI.pointThreshold;
    const estDenorm = Math.min(StakedropAPI.points(eventAmount, 90), StakedropAPI.pointThreshold);
    const norm30 = StakedropAPI.points(particpated, 30);
    const norm90 = StakedropAPI.points(particpated, 90);
    return [
      norm90 / minDeorm * 27000000,
      norm30 / estDenorm * 27000000,
      norm90 / estDenorm * 27000000,
    ];
  }, [particpated, eventAmount]);
  
  // const [period, setPeriod] = useState(0);
  // const [ksmReward, setKsmReward] = useState(0);

  return (
    <>
      <SummaryBox>
        <CardSummary label={t('My stashes')}>
          {formatBalance(particpated, undefined, 0)}
        </CardSummary>
        <CardSummary label={t('Particpated period')}>
          {0} days
        </CardSummary>
        <CardSummary label={t('Minimal PHA (90d)')}>
          {formatBalance(minPHA, {withUnit: 'PHA'}, 0)}
        </CardSummary>
        <CardSummary label={t('PHA reward est. (30d)')}>
          {formatBalance(estPHA30, {withUnit: 'PHA'}, 0)}
        </CardSummary>
        <CardSummary label={t('PHA reward est. (90d)')}>
          {formatBalance(estPHA90, {withUnit: 'PHA'}, 0)}
        </CardSummary>
      </SummaryBox>
    </>
  )
}

export default Nomination;