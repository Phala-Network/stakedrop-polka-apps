import React, { useMemo } from 'react';

import { useOwnStashInfos } from '@polkadot/react-hooks';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import Targets from '@polkadot/app-staking/Targets';

interface Props {
  whitelist: string[];
}

function Participate({whitelist}: Props): React.ReactElement<Props> {
  const ownStashes = useOwnStashInfos();
  const targets = useSortedTargets();

  const whitelistedTargets = useMemo(() => {
    const validators = targets.validators?.filter(v => whitelist.includes(v.accountId.toString()));
    return {
      ...targets,
      validators
    };
  }, [targets])

  return (
    <Targets
      hideSummary
      ownStashes={ownStashes}
      targets={whitelistedTargets}
    />
  )
}

export default Participate;