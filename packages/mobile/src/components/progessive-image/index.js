import images from "@src/assets/images";
import { useTheme } from "@src/themes/theme-provider";
import React from "react";
import { View, StyleSheet, Animated, ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  },
  container: {
    backgroundColor: "#e1e4e8",
    alignItems: "center",
    justifyContent: "center"
  }
});
const withProgressiveImage = WrappedComponent => {
  return function (props) {
    const { colors } = useTheme();

    return <WrappedComponent colors={colors} {...props} />;
  };
};

class ProgressiveImage extends React.Component {
  thumbnailAnimated = new Animated.Value(0);
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  imageAnimated = new Animated.Value(0);

  handleThumbnailLoad = () => {
    Animated.timing(this.thumbnailAnimated, {
      toValue: 1
    }).start();
  };

  onImageLoad = () => {
    this.setState({
      loading: false
    });
    Animated.timing(this.imageAnimated, {
      toValue: 1
    }).start();
  };

  render() {
    const { thumbnailSource = images.empty_img, source, style, colors, styleContainer, ...props } = this.props;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors["neutral-surface-bg2"]
          },
          styleContainer
        ]}
      >
        <View
          style={{
            position: "absolute"
          }}
        >
          {this.state.loading ? <ActivityIndicator /> : null}
        </View>
        <Animated.Image
          {...props}
          source={thumbnailSource}
          style={[
            {
              opacity: this.thumbnailAnimated
            },
            style
          ]}
          onLoad={this.handleThumbnailLoad}
          blurRadius={1}
        />
        <Animated.Image
          {...props}
          source={source}
          style={[styles.imageOverlay, { opacity: this.imageAnimated }, style]}
          onLoad={this.onImageLoad}
          onError={this.onImageLoad}
        />
      </View>
    );
  }
}

export default withProgressiveImage(ProgressiveImage);
