
import React, { useState } from 'react';
import { InputAddress, TxButton } from '@polkadot/react-components';
import { useTranslation } from './translate';
import { Input } from 'semantic-ui-react'

interface Props {
  
}

function checkParse(v: string): boolean {
  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(v)); //TODO:checksum
}

function toHexString(v: String): String {
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
        <br/>
        <InputAddress
          label={t<string>('using the selected account')}
          onChange={setAccountId}
          type='account'
          value={accountId}
        />
        
        <Input 
          value={ethAddress}
          error={!checked}
          label={{content: t<string>('Your Ethereum addess'), color: 'teal'}}
          onChange={(_, {value}) => setEthAddress(value)}
        />
        <br/>
        <TxButton
          accountId={accountId}
          icon='sign-in'
          isDisabled={!checked}
          isPrimary
          label={t<string>('Submit Now')}
          params={[toHexString(ethAddress)]}
          tx='system.remark'
        />
      </section>
    </>
  )
}

export default SetEthAddress;