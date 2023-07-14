import images from '@src/assets/images';
import { useTheme } from '@src/themes/theme-provider';
import React from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  },
  container: {
    backgroundColor: '#e1e4e8',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
const withProgressiveImage = (WrappedComponent) => {
  return function (props) {
    const { colors } = useTheme();

    return <WrappedComponent colors={colors} {...props} />;
  };
};

class ProgressiveImage extends React.Component {
  thumbnailAnimated = new Animated.Value(0);
  constructor(props) {
    super(props);
    this.state = { loading: true, isError: false };
  }

  imageAnimated = new Animated.Value(0);
  onErrorLoadImage = () => {
    this.setState({
      isError: true,
      loading: false
    });
  };
  handleThumbnailLoad = () => {
    this.setState({
      isError: false
    });
    Animated.timing(this.thumbnailAnimated, {
      toValue: 1
    }).start();
  };

  onImageLoad = () => {
    this.setState({
      loading: false,
      isError: false
    });
    Animated.timing(this.imageAnimated, {
      toValue: 1
    }).start();
  };

  render() {
    const { thumbnailSource, source, style, colors, styleContainer, ...props } =
      this.props;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: this.state.loading
              ? '#e1e4e8'
              : colors['background-box']
          },
          styleContainer
        ]}
      >
        {this.state.loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : null}
        <Animated.Image
          {...props}
          source={this.state.isError?images.empty_img : thumbnailSource}
          style={[
            {
              opacity: this.thumbnailAnimated
            },
            style
          ]}
          onLoad={this.handleThumbnailLoad}
          blurRadius={1}
          onError={this.onErrorLoadImage}
        />

        <Animated.Image
          {...props}
          source={source}
          style={[styles.imageOverlay, { opacity: this.imageAnimated }, style]}
          onLoad={this.onImageLoad}
          onError={this.onErrorLoadImage}
        />
      </View>
    );
  }
}

export default withProgressiveImage(ProgressiveImage);
