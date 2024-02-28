import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { ObservableQueryBalanceInner } from "@owallet/stores";
import { BondStatus } from "@owallet/stores";
import { CoinPretty, Dec } from "@owallet/unit";
import { useStore } from "../../stores";
import style from "./validator-list.module.scss";
import { ValidatorThumbnails } from "@owallet/common/src/config";
import { HeaderLayout } from "../../layouts";

type Sort = "APY" | "Voting Power" | "Name";

export const ValidatorListPage: FunctionComponent<{
  balance: ObservableQueryBalanceInner;
  onClick: () => void;
}> = observer(() => {
  const { chainStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Voting Power");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const data = useMemo(() => {
    let data = bondedValidators.validators;
    if (search) {
      data = data.filter((val) =>
        val.description.moniker?.toLowerCase().includes(search.toLowerCase())
      );
    }
    switch (sort) {
      case "APY":
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
            ? 1
            : -1;
        });
        break;
      case "Name":
        data.sort((val1, val2) => {
          if (!val1.description.moniker) {
            return 1;
          }
          if (!val2.description.moniker) {
            return -1;
          }
          return val1.description.moniker > val2.description.moniker ? -1 : 1;
        });
        break;
      case "Voting Power":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, search, sort]);

  const items = useMemo(() => {
    return [
      { label: "APY", key: "APY" },
      { label: "Amount Staked", key: "Voting Power" },
      { label: "Name", key: "Name" },
    ];
  }, []);

  const sortItem = useMemo(() => {
    const item = items.find((item) => item.key === sort);
    if (!item) {
      throw new Error(`Can't find the item for sort (${sort})`);
    }
    return item;
  }, [items, sort]);

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      {data.map((item, index) => {
        return (
          <ValidatorItem
            key={item.operator_address}
            validatorAddress={item.operator_address}
            index={index}
            sort={sort}
          />
        );
      })}
    </HeaderLayout>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  index: number;
  sort: Sort;

  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, index, sort, onSelectValidator }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);

  return validator ? (
    <button
      className={style.validatorItem}
      onClick={() => {
        if (onSelectValidator) {
          onSelectValidator(validatorAddress);
          // smartNavigation.goBack();
        } else {
          // smartNavigation.navigateSmart('Validator.Details', {
          //   validatorAddress
          // });
        }
      }}
    >
      <div className={style.left}>
        <span>{index + 1}</span>

        <div className={style.validatorThumbnail}>
          <img
            src={
              ValidatorThumbnails[validator.operator_address] ??
              bondedValidators.getValidatorThumbnail(validator.operator_address)
            }
          />
        </div>

        <span>{validator.description.moniker}</span>
      </div>

      {sort === "APY" ? (
        <span>
          {queries.cosmos.queryInflation.inflation
            .mul(
              new Dec(1).sub(
                new Dec(validator.commission.commission_rates.rate)
              )
            )
            .maxDecimals(2)
            .trim(true)
            .toString() + "%"}
        </span>
      ) : null}
      {sort === "Voting Power" ? (
        <span>
          {new CoinPretty(
            chainStore.current.stakeCurrency,
            new Dec(validator.tokens)
          )
            .maxDecimals(0)
            .hideDenom(true)
            .toString()}
        </span>
      ) : null}
      <div x-arrow="" />
    </button>
  ) : null;
});
