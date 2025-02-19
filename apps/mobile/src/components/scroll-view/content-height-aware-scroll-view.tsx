import React, { forwardRef } from "react";
import { ScrollView, ScrollViewProps } from "react-native";

export const ContentHeightAwareScrollView = forwardRef<
  ScrollView,
  ScrollViewProps
>((props, ref) => {
  const {
    children,
    onLayout,
    onContentSizeChange,
    scrollEnabled,
    indicatorStyle,
    ...rest
  } = props;

  const [layoutSize, setLayoutSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [contentSize, setContentSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  return (
    <ScrollView
      {...rest}
      ref={ref}
      indicatorStyle={indicatorStyle || "white"}
      scrollEnabled={(() => {
        // prop을 통해서 명시되어 있다면 그것을 반환한다.
        if (scrollEnabled != null) {
          return scrollEnabled;
        }

        if (!layoutSize || !contentSize) {
          return false;
        }

        return (
          layoutSize.height < contentSize.height ||
          layoutSize.width < contentSize.width
        );
      })()}
      onLayout={(e) => {
        if (onLayout) {
          onLayout(e);
        }

        setLayoutSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        });
      }}
      onContentSizeChange={(w, h) => {
        if (onContentSizeChange) {
          onContentSizeChange(w, h);
        }

        setContentSize({
          width: w,
          height: h,
        });
      }}
    >
      {children}
    </ScrollView>
  );
});
