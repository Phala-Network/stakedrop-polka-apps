import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";

// import { Button, Input, InputAddress, InputBalance, Modal, TxButton } from '@polkadot/react-components';
import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { SummaryBox, CardSummary } from '@polkadot/react-components';
import { formatBalance } from '@polkadot/util';
import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';

import { Button, Container, Input } from 'semantic-ui-react'

import * as StakedropAPI from './api';
import { useTranslation } from './translate';

interface Props {
  basePath: string;
}

const EstBox = styled.div`
  background-color: #e2e2e2;
  margin: 20px 0;
  border-radius: 3px;
  padding: 20px;

  div.title {
    margin-bottom: 24px
  }

  .button {
    position: relative;
    top: 30px;
  }
`;

interface CheckParseOptinos {
  min?: number;
  max?: number;
  def: number;
}

function checkParse(v: string, {min, max, def}: CheckParseOptinos): [number, string | undefined] {
  let x;
  try { x = parseFloat(v) } catch { return [def, 'Invalid number']; }
  if (isNaN(x)) {
    return [def, 'Invalid number'];
  }
  if (min !== undefined && x < min) {
    return [def, `Too low (<${min})`];
  }
  if (max !== undefined && x > max) {
    return [def, `Too high (>${max})`];
  }
  return [x, undefined];
}


function Calcualtor ({basePath} :Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { hasAccounts, allAccounts } = useAccounts();
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  });

  const [inputAmount, setInputAmount] = useState('1000');
  const [inputLength, setInputLength] = useState('90');

  const [amount, amountErr] = checkParse(inputAmount, {min:10, max:1e10, def:0});
  const [length, lengthErr] = checkParse(inputLength, {min:30, max:90, def:0});
  
  const [eventAmount, setEventAmount] = useState(0);
  useEffect(()=> {
    if (!hasAccounts || !activeEra) {
      return;
    }
    const currentEra = activeEra.toNumber();
    (async () => {
      const r = await StakedropAPI.getTotalStaking(currentEra);
      if (r.status == 'ok') {
        const amount = r.result[0].total_amount / 1000;
        setEventAmount(amount);
      }
    })();
  }, [allAccounts, activeEra])

  const [minPHA, estPHA] = useMemo((): number[] => {
    // minimal: 10 ksm
    const particpated = amount < 10 ? 0 : amount;
    const norm = StakedropAPI.points(particpated, length);
    const minDeorm = StakedropAPI.pointThreshold;
    const estDenorm = Math.min(StakedropAPI.points(eventAmount, 90), StakedropAPI.pointThreshold);
    return [
      norm / minDeorm * 27000000,
      estDenorm > 0 ? norm / estDenorm * 27000000 : 0
    ];
  }, [amount, eventAmount, length]);

  const history = useHistory();
  function handleClick() {
    history.push(`${basePath}/stake`);
  }

  return (
    <Container>
      <div className="ui--row">
        <div className="meidum">
          <p>{t('The amount of KSM to participate Stakedrop')}</p>
          <Input
            fluid={false}
            // autoFocus
            // help={t('How many KSM do you want to stake to the whitelisted validators?')}
            error={!amount}
            value={inputAmount}
            // ref={input => this.inputtext = amount.toString()} 
            label={{content: t('KSM Amount'), color: 'teal'}}
            onChange={(_, {value}) => setInputAmount(value)}
          />
          {amountErr && (<div>{amountErr}</div>)}
          {amountErr?.startsWith('Too low') && (<div>{t('Warning: need at least 10 KSM to get stakedrop')}</div>)}

        </div>
        <div className="small"></div>
        <div className="meidum">
          <p>{t('Time to stake')}</p>
          <Input
            // help={t('How long do you want to stake KSM for PHA stakedrop reward?')}
            value={inputLength}
            // ref={input => this.inputtext = length.toString()} 
            error={!length}
            label={{content: t('Days to stake'), color: 'teal'}}
            onChange={(_, {value}) => setInputLength(value)}
          />
          {lengthErr && (<div>{lengthErr}</div>)}

        </div>
      </div>
      <div className="ui--row">

        <EstBox>
          <div className='title'>{t('Estimated rewards')}</div>
          <div className="ui--row">
            <div className="large">
              <SummaryBox>
                <CardSummary label={t('Minimal PHA')}>
                  {formatBalance(minPHA, {withUnit: 'PHA'}, 0)}
                </CardSummary>
                <CardSummary label={t('PHA reward est.')}>
                  {formatBalance(estPHA, {withUnit: 'PHA'}, 0)}
                </CardSummary>
                {/* <CardSummary label={t('KSM stake reward')}>
                  
                </CardSummary> */}
              </SummaryBox>
            </div>
            <div className='small' style={{textAlign: 'right'}}>
              <Button primary color='teal' onClick={handleClick}>{t('Join')}</Button>
            </div>
          </div>
        </EstBox>

      </div>
      <p>
        {t('Reward curve chart is coming soon.')}
      </p>
    </Container>
  );
}

export default Calcualtor;