import React, { useEffect, useState, useMemo } from 'react';
import { Container, Grid } from 'semantic-ui-react'
import styled from 'styled-components';

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { SummaryBox, CardSummary } from '@polkadot/react-components';
import { formatBalance } from '@polkadot/util';
import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';


import ReactEcharts from 'echarts-for-react';

import * as StakedropAPI from './api';
import { useTranslation } from './translate';

interface Props {
}

interface NominatorStash {
  nominator: string;
  stash: StakedropAPI.StakeAmountResult;
};

const StashCard = styled(Grid.Column)`
  background-color: #fff;
  box-shadow: 0 5px 20px #bbb;
  margin: 20px;
  padding: 2rem 1rem 0 2rem !important;
`;

function Nomination ({} :Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { hasAccounts, allAccounts } = useAccounts();
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  });
  // const [{ bondedTotal, foundStashes }, setState] = useState<State>({});
  const [stashes, setStashes] = useState<NominatorStash[]>([]);

  useEffect(()=> {
    if (!hasAccounts || !activeEra) {
      return;
    }

    const currentEra = activeEra?.toNumber();
    (async () => {
      const stakingInfo = await StakedropAPI.getStakingInfo(currentEra);
      if (stakingInfo.status != 'ok') {
        return;
      }
      const myStake = stakingInfo.result.filter(({nominator}) => allAccounts.includes(nominator));
      const totalStaked = myStake.reduce((sum, stake) => sum + stake.amount, 0) / 1000;
      setParticpated(totalStaked)

      const stashes = myStake.map(({nominator}) => nominator);
      const allStashes = await Promise.all(stashes.map(async (nominator) => {
        return {
          nominator, 
          stash: (await StakedropAPI.getStakeAmount(nominator)).result,
        };
      }));
      setStashes(allStashes);
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
    if (particpated < 10) {
      return [0, 0, 0];
    }
    const minDeorm = StakedropAPI.pointThreshold;
    const estDenorm = Math.min(StakedropAPI.points(eventAmount, 90), StakedropAPI.pointThreshold);
    const norm30 = StakedropAPI.points(particpated, 30);
    const norm90 = StakedropAPI.points(particpated, 90);
    return [
      norm90 / minDeorm * 27000000,
      estDenorm > 0 ? norm30 / estDenorm * 27000000 : 0,
      estDenorm > 0 ? norm90 / estDenorm * 27000000 : 0,
    ];
  }, [particpated, eventAmount]);

  const participatedPeriod = useMemo((): number => {
    return stashes
      .map(({stash}) =>
        stash.filter(s =>
          s.era >= StakedropAPI.startEra && s.amount >= 10
        ).length / 4)
      .reduce(Math.max as (a: number, b: number)=>number, 0);
  }, [stashes]);

  const stashCharts = useMemo((): JSX.Element[] => {
    const eraNames: string[] = [];
    const daysToShow = 30;
    for (let i = 0; i < daysToShow; i++) {
      const day = 1 + ((i/4)|0);
      const era = 1 + i % 4;
      eraNames.push(`${day}-${era}`);
    }

    return stashes.map((stash, idx) => {
      const amounts: number[] = new Array(eraNames.length);
      stash.stash.forEach(({era, amount}) => {
        const i = era - StakedropAPI.startEra;
        if (i >= 0 && i < eraNames.length) {
          amounts[i] = amount / 1000;
        }
      });
      
      const chartOptions = {
        color: '#d32e79',
        xAxis: {
          type: 'category',
          data: eraNames,
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {},
        series: [{
          data: amounts,
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)'
          }
        }]
      };
      return (
        <StashCard key={stash.nominator}>
          <h1>{t('Stash')} #{idx+1}</h1>
          <p>{stash.nominator}</p>
          <ReactEcharts option={chartOptions} />
        </StashCard>
      )
    })

  }, [stashes]);

  return (
    <>
      <SummaryBox>
        <CardSummary label={t('My stashes')}>
          {formatBalance(particpated < 10 ? 0 : particpated, undefined, 0)}
        </CardSummary>
        <CardSummary label={t('Particpated period')}>
          {participatedPeriod} days
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
      <section>
        <Container>
          <Grid centered columns={2}>
            {stashCharts}
          </Grid>
        </Container>
      </section>
      {particpated > 0 && particpated < 10 && (<p>{t('Warning: you have staked {{val}} KSM, less than the minimal requirement of 10 KSM.', {replace: {val: particpated}})}</p>)}
      <ul>
        <li>{t('You can find the ongoing stakedrop status and historical data in this page. Reward stats and charts are coming soon.')}</li>
        <li>{t('You may not see your stake right after nominated the whitelisted validators becuae it takes 2 eras to take effect (6 hours per era in Kusama Network).')}</li>
        <li>{t('From Polkadot.js: "Once transmitted the new selection will only take effect in 2 eras since the selection criteria for the next era was done at the end of the previous era. Until then, the nominations will show as inactive."')}</li>
      </ul>
    </>
  )
}

export default Nomination;