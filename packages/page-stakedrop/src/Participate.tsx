import React, { useMemo } from 'react';
// import BN from 'bn.js';

// import { Toggle } from '@polkadot/react-components';
import { useOwnStashInfos } from '@polkadot/react-hooks';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import Targets from '@polkadot/app-staking/Targets';
// import { useTranslation } from '@polkadot/react-params/translate';

interface Props {
  whitelist: string[];
}

function Participate({whitelist}: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
  const ownStashes = useOwnStashInfos();
  const targets = useSortedTargets();

  const whitelistedTargets = useMemo(() => {
    const validators = targets.validators?.filter(v => whitelist.includes(v.accountId.toString()));
    return {
      ...targets,
      validators
    };
  }, [targets])

  // const [ addPhala, setAddPhala ] = useState(true);
  // function toggleAddPhala () {
  //   setAddPhala(!addPhala);
  // }

  // const preferredValidator = useMemo(() => addPhala ? ['GvHQrW6ekMU71ev5mZTaXZgochiyK4mK3CKdN5wdGUqubMf'] : undefined, [addPhala]);

  return (
    <>
      {/* <Toggle
        label={addPhala ? t('include Phala Network\'s validators') : t('do not include Phala Network\'s validator')}
        onChange={toggleAddPhala}
        value={addPhala}
      /> */}
      <Targets
        hideSummary
        ownStashes={ownStashes}
        targets={whitelistedTargets}
        // preferredValidator={preferredValidator}
      />
    </>
  )
}

export default Participate;