// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveHeartbeats, DeriveStakingOverview } from '@polkadot/api-derive/types';
import { AccountId, Nominations } from '@polkadot/types/interfaces';
import { Authors } from '@polkadot/react-query/BlockAuthors';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Table } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { BlockAuthorsContext } from '@polkadot/react-query';
import { Option, StorageKey } from '@polkadot/types';

import Filtering from '../Filtering';
import { useTranslation } from '../translate';
import Address from './Address';

interface Props {
  favorites: string[];
  hasQueries: boolean;
  showType: 'validators' | 'intentions' | 'both';
  next?: string[];
  setNominators?: (nominators: string[]) => void;
  stakingOverview?: DeriveStakingOverview;
  toggleFavorite: (address: string) => void;
  whitelist?: string[];
}

type AccountExtend = [string, boolean, boolean];

interface Filtered {
  elected?: AccountExtend[];
  validators?: AccountExtend[];
  waiting?: AccountExtend[];
}

const EmptyAuthorsContext: React.Context<Authors> = React.createContext<Authors>({ byAuthor: {}, eraPoints: {}, lastBlockAuthors: [], lastHeaders: [] });

function filterAccounts (accounts: string[] = [], elected: string[], favorites: string[], without: string[]): AccountExtend[] {
  return accounts
    .filter((accountId): boolean => !without.includes(accountId as any))
    .map((accountId): AccountExtend => [
      accountId,
      elected.includes(accountId),
      favorites.includes(accountId)
    ])
    .sort(([,, isFavA]: AccountExtend, [,, isFavB]: AccountExtend): number =>
      isFavA === isFavB
        ? 0
        : (isFavA ? -1 : 1)
    );
}

function accountsToString (accounts: AccountId[]): string[] {
  return accounts.map((accountId): string => accountId.toString());
}

function getFiltered (stakingOverview: DeriveStakingOverview, favorites: string[], next?: string[], whitelist?: string[]): Filtered {
  let allElected = accountsToString(stakingOverview.nextElected);
  let validatorIds = accountsToString(stakingOverview.validators);
  if (whitelist) {
    allElected = allElected.filter(a => whitelist.includes(a));
    validatorIds = validatorIds.filter(a => whitelist.includes(a));
    next = next?.filter(a => whitelist.includes(a));
  }
  const validators = filterAccounts(validatorIds, allElected, favorites, []);
  const elected = filterAccounts(allElected, allElected, favorites, validatorIds);
  const waiting = filterAccounts(next, [], favorites, allElected);

  return {
    elected,
    validators,
    waiting
  };
}

function extractNominators (nominations: [StorageKey, Option<Nominations>][]): Record<string, [string, number][]> {
  return nominations.reduce((mapped: Record<string, [string, number][]>, [key, optNoms]) => {
    if (optNoms.isSome) {
      const nominatorId = key.args[0].toString();

      optNoms.unwrap().targets.forEach((_validatorId, index): void => {
        const validatorId = _validatorId.toString();
        const info: [string, number] = [nominatorId, index + 1];

        if (!mapped[validatorId]) {
          mapped[validatorId] = [info];
        } else {
          mapped[validatorId].push(info);
        }
      });
    }

    return mapped;
  }, {});
}

function CurrentList ({ favorites, hasQueries, showType, next, stakingOverview, toggleFavorite, whitelist }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const emptyAuthorContext = (showType != 'validators') ? useContext(EmptyAuthorsContext) : undefined;
  const blockAuthorContext = (showType != 'intentions') ? useContext(BlockAuthorsContext) : undefined;
  const recentlyOnline = useCall<DeriveHeartbeats>(showType != 'intentions' && api.derive.imOnline?.receivedHeartbeats, []);
  const nominators = useCall<[StorageKey, Option<Nominations>][]>(showType != 'validators' && api.query.staking.nominators.entries as any, []);
  const [{ elected, validators, waiting }, setFiltered] = useState<Filtered>({});
  const [nameFilter, setNameFilter] = useState<string>('');
  const [nominatedBy, setNominatedBy] = useState<Record<string, [string, number][]> | null>();
  const [withIdentity, setWithIdentity] = useState(false);

  useEffect((): void => {
    stakingOverview && setFiltered(
      getFiltered(stakingOverview, favorites, next, whitelist)
    );
  }, [favorites, next, stakingOverview]);

  useEffect((): void => {
    nominators && setNominatedBy(
      extractNominators(nominators)
    );
  }, [nominators]);

  const headerWaiting = useMemo(() => [
    [t('intentions'), 'start', 2],
    [t('nominators'), 'start', 2],
    [t('commission'), 'number', 1],
    []
  ], [t]);

  const headerActive = useMemo(() => [
    [t('validators'), 'start', 2],
    [t('other stake')],
    [t('own stake')],
    [t('commission')],
    [t('points')],
    [t('last #')],
    []
  ], [t]);

  const headerBoth = useMemo(() => [
    [t('whitelist'), 'start', 3],
    [t('nomination')],
    [t('own stake')],
    [t('commission')],
    [t('points')],
    [t('last #')],
    []
  ], [t]);

  const _renderRows = useCallback(
    (addresses?: AccountExtend[], isMain?: boolean): React.ReactNode[] => {
      const { byAuthor, eraPoints } = (isMain ? blockAuthorContext : emptyAuthorContext)!;
      return (addresses || []).map(([address, isElected, isFavorite]): React.ReactNode => (
        <Address
          address={address}
          filterName={nameFilter}
          hasQueries={hasQueries}
          isElected={isElected}
          isFavorite={isFavorite}
          isMain={isMain}
          key={address}
          lastBlock={byAuthor[address]}
          nominatedBy={nominatedBy ? (nominatedBy[address] || []) : undefined}
          onlineCount={recentlyOnline?.[address]?.blockCount.toNumber()}
          onlineMessage={recentlyOnline?.[address]?.hasMessage}
          points={eraPoints[address]}
          toggleFavorite={toggleFavorite}
          withIdentity={withIdentity}
        />
      ))
    },
    [blockAuthorContext, emptyAuthorContext, hasQueries, nameFilter, nominatedBy, recentlyOnline, toggleFavorite, withIdentity]
  );

  if (showType == 'intentions') {
    return (
      <Table
        empty={waiting && t<string>('No waiting validators found')}
        filter={
          <Filtering
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            setWithIdentity={setWithIdentity}
            withIdentity={withIdentity}
          />
        }
        header={headerWaiting}
      >
        {_renderRows(elected, false).concat(_renderRows(waiting, false))}
      </Table>
    );
  } else if (showType == 'validators') {
    return (
      <Table
        empty={validators && t<string>('No active validators found')}
        filter={
          <Filtering
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            setWithIdentity={setWithIdentity}
            withIdentity={withIdentity}
          />
        }
        header={headerActive}
      >
        {_renderRows(validators, true)}
      </Table>
    );
  } else {
    return (
      <Table
        empty={validators && t('No validators found')}
        header={headerBoth}
      >
        {_renderRows(validators, true)
          .concat(_renderRows(elected, false))
          .concat(_renderRows(waiting, false))}
      </Table>
    );

  }
}

export default React.memo(CurrentList);
