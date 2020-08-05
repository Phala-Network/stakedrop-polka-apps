
import React, { useState } from 'react';
import { InputAddress, TxButton, Button } from '@polkadot/react-components';
import { useTranslation } from './translate';
import { Input } from 'semantic-ui-react'
import styled from 'styled-components';

import * as StakedropApi from './api';

interface Props {
  
}

const FoundTip = styled('p')`
  margin-left: 50px;
  padding-bottom: 25px;
  font-size: 14px;
  color: #888;

  span.eth-addr {
    font-family: monospace;
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

  function _setAccountId (v: string | null) {
    if (v != accountId) {
      if (v) {
        updateRecordedEthAddress(v)
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

  return (
    <>
      <section>
        <div className='ui--row'>
          <InputAddress
            label={t<string>('using the selected account')}
            onChange={_setAccountId}
            type='account'
            value={accountId}
          />
        </div>
        {recordedEthAddress && (
          <div className='ui--row'>
            <FoundTip>
              {t<string>('Linked ETH Address:')} <span className='eth-addr'>{recordedEthAddress}</span>
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
