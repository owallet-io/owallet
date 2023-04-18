import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import React, { FC } from 'react';
import { FlatListProps } from 'react-native';
import { OWEmpty } from '../empty';
import { _keyExtract } from '@src/utils/helper';
interface IOWFlatListProps extends FlatListProps<any> {
  loadMore?: boolean;
}
const OWFlatList: FC<IOWFlatListProps> = ({ loadMore, onRefresh, ...rest }) => {
  return (
    <FlatList
      ListEmptyComponent={<OWEmpty />}
      keyExtractor={_keyExtract}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <View style={styles.footer}>
          {loadMore ? <ActivityIndicator /> : null}
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      {...rest}
    />
  );
};

export default OWFlatList;

const styles = StyleSheet.create({
  footer: {
    height: 20
  }
});
