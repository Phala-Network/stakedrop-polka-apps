
import React, { useState } from 'react';
import { InputAddress, TxButton, Button } from '@polkadot/react-components';
import { useTranslation } from './translate';
import { Input } from 'semantic-ui-react'

interface Props {
  
}

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
  const checked = checkParse(ethAddress);

  return (
    <>
      <section>
        <div className='ui--row'>
          <InputAddress
            label={t<string>('using the selected account')}
            onChange={setAccountId}
            type='account'
            value={accountId}
          />
        </div>
        <div className='ui--row'>
          <Input 
            value={ethAddress}
            error={!checked}
            label={{content: t<string>('Your Ethereum addess'), color: 'teal'}}
            onChange={(_, {value}) => setEthAddress(value)}
          />
        </div>
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
