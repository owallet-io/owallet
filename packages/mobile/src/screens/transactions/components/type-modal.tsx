import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { useTheme } from '@src/themes/theme-provider';
import { Text } from '@src/components/text';
import { _keyExtract, convertTypeEvent } from '@src/utils/helper';
import { metrics, spacing } from '@src/themes';
import { OWEmpty } from '@src/components/empty';

const TypeModal = ({ transactions, active, actionType }) => {
  const { colors } = useTheme();
  const getUniqueActions = (dataAction) => {
    const actions = new Set();
    actions.add('All');
    const uniqueActions = [];
    dataAction?.map((log) => {
      if (log?.tx_result?.code == 0) {
        const logObj = JSON.parse(log?.tx_result?.log);
        const events = logObj[0].events;
        events.forEach((event) => {
          if (event.type === 'message') {
            const attributes = event.attributes;
            const actionAttribute = attributes.find(
              (attr) => attr.key === 'action'
            );
            if (actionAttribute) {
              const action = actionAttribute.value;
              actions.add(action);
            }
          }
        });
      }
    });
    actions.forEach((action) =>
      uniqueActions.push({
        label: convertTypeEvent(action),
        value: action
      })
    );
    return uniqueActions;
  };
  const data = useMemo(() => {
    const rs = getUniqueActions(transactions);
    return rs;
  }, [transactions]);
  const onActionType = (item) => {
    actionType(item);
  };
  const renderItem = ({ item }) => (
    <ItemModal onPress={onActionType} item={item} active={active} />
  );
  return (
    <ContainerModal
      title={'Transaction Type'}
      renderItem={renderItem}
      data={data}
    />
  );
};
const ContainerModal = ({ data, renderItem, title }) => {
  const styles = styling();
  return (
    <View style={styles.container}>
      <Text variant="body1" style={styles.textTitle} typo="bold">
        {title}
      </Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={_keyExtract}
        ListEmptyComponent={<OWEmpty />}
      />
    </View>
  );
};
const ItemModal = ({ item, active, onPress, iconComponent }) => {
  const { colors } = useTheme();
  const styles = styling();
  return (
    <TouchableOpacity
      style={styles.containerItem}
      onPress={() => onPress(item)}
    >
      <View>
        {iconComponent && iconComponent}
        <Text variant="body1" typo="bold">
          {item?.label}
        </Text>
      </View>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor:
              item?.value === active
                ? colors['purple-700']
                : colors['bg-circle-select-modal']
          }
        ]}
      >
        <View style={styles.iconSubCircle} />
      </View>
    </TouchableOpacity>
  );
};
export default TypeModal;

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    iconSubCircle: {
      width: 12,
      height: 12,
      borderRadius: spacing['32'],
      backgroundColor: colors['background-item-list']
    },
    iconCircle: {
      width: 24,
      height: 24,
      borderRadius: spacing['32'],
      justifyContent: 'center',
      alignItems: 'center'
    },
    containerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 54,
      backgroundColor: colors['background-item-list'],
      borderRadius: 12,
      marginBottom: 16,
      alignItems: 'center',
      paddingHorizontal: 16
    },
    textTitle: {
      textAlign: 'center',
      paddingBottom: 12
    },
    container: {
      height: metrics.screenHeight / 2
    }
  });
};
