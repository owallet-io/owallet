import { Text } from 'react-native';

export default (props) => (
  <Text {...props} style={[{ fontFamily: 'DMSans-Regular' }, props.style]}>
    {props.children}
  </Text>
);
