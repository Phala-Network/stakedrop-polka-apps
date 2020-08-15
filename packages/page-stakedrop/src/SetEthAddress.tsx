
import React, { useState, useEffect, useCallback } from 'react';
import { InputAddress, TxButton, Button } from '@polkadot/react-components';
import { useTranslation } from './translate';
import { Input } from 'semantic-ui-react'
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import * as StakedropApi from './api';
import { useAccounts } from '@polkadot/react-hooks';

interface Props {
  
}

const FoundTip = styled('p')`
  margin-left: 50px;
  padding-bottom: 25px;
  font-size: 14px;
  color: #888;

  span.eth-addr {
    font-family: monospace;
    overflow-wrap: anywhere;
  }
`;

const LeftPaddedDiv = styled('div')`
  padding-left: 30px;
`;

function checkParse(v: string): boolean {
  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(v)); //TODO:checksum
}

function toHexString(v: string): string {
  const buf = Buffer.from('--phala--' + v + '-phala-');
  return '0x' + buf.toString('hex');
}

function SetEthAddress({}: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState('');
  const [recordedEthAddress, setRecordedEthAddress] = useState('');
  const checked = checkParse(ethAddress);
  const [mobileView, setMobileView] = useState<boolean>(false);
  const [nominatorReward, setNominatorReward] = useState<{[key: string]: number}>({});

  const { hasAccounts } = useAccounts();

  useEffect(() => {
    (async () => {
      const r = await StakedropApi.getStakedropRewards();
      const map: {[key: string]: number} = {};
      for (const x of r) {
        map[x.nominator] = parseInt(x.pha);
      }
      setNominatorReward(map);
    })()
  }, []);

  function _setAccountId (v: string | null) {
    if (v != accountId) {
      if (v) {
        updateRecordedEthAddress(v);
      } else {
        setRecordedEthAddress('');
      }
      setAccountId(v);
    }
  }

  async function updateRecordedEthAddress (v: string) {
    const r = await StakedropApi.getEthAddress(v);
    if (r.status != 'ok' || r.result.length != 1) {
      setRecordedEthAddress('');
      return;
    }
    const [addr] = r.result;
    setRecordedEthAddress(addr.eth_address);
  }

  const onResize = useCallback(() => {
    setMobileView((window.outerWidth < 750) || (window.outerWidth < window.outerHeight))
  }, [setMobileView])

  useEffect(() => {
    if (!onResize) { return }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize);
  }, [onResize])

  return (
    <>
      <Helmet>
        {mobileView ? <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1" /> : <meta name="viewport" content="width=device-width, initial-scale=1" />}
      </Helmet>
      <section>
        <div className='ui--row'>
          {
            hasAccounts
              ? <InputAddress
                label={t<string>('using the selected account')}
                onChange={_setAccountId}
                type='account'
                value={accountId}
              />
              : <LeftPaddedDiv className='ui--row'>
                <p>Please add an account first.</p>
              </LeftPaddedDiv>
          }
        </div>
        {(recordedEthAddress || (accountId && nominatorReward[accountId])) && (
          <div className='ui--row'>
            <FoundTip>
              {recordedEthAddress && <div>{t<string>('Linked ETH Address:')} <span className='eth-addr'>{recordedEthAddress}</span></div>}
              {accountId && nominatorReward[accountId] && <div>{t('Total PHA')}: {nominatorReward[accountId]}</div>}
            </FoundTip>
          </div>
        )}
        <LeftPaddedDiv className='ui--row'>
          <Input 
            value={ethAddress}
            error={!checked}
            label={{content: t<string>('Your Ethereum addess'), color: 'teal'}}
            onChange={(_, {value}) => setEthAddress(value)}
          />
        </LeftPaddedDiv>
        <div className='ui--row'>
          <Button.Group>
            <TxButton
              accountId={accountId}
              icon='sign-in-alt'
              isDisabled={!checked}
              isPrimary
              label={t<string>('Submit')}
              params={[toHexString(ethAddress)]}
              tx='system.remark'
            />
          </Button.Group>
        </div>

        <div>
          <p>
            <ul>
              <li>{t('The Ethereum address is used for you to claim the PHA stakedrop reward once the event ends.')}</li>
              <li>{t('An Ethereum Dapp for reward claiming will be prepared shortly.')}</li>
              <li>{t('By clicking "Submit", the address will be recorded in the Kusama blockchain by a "system.remark" extrinsic.')}</li>
              <li>{t('You can submit the address more than once, but only the last one will be used.')}</li>
            </ul>
          </p>
        </div>
      </section>
    </>
  )
}

export default SetEthAddress;
