import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from '@src/common/constants';
import { WebpageScreenScreenOptionsPreset } from '@src/screens/web/components/webpage-screen';
import { Browser } from '@src/screens/web/browser';
import { BookMarks } from '@src/screens/web/bookmarks';
import { WebScreen } from '@src/screens/web';
import { DAppWebpageScreen } from '@src/screens/web/webpages';
const Stack = createStackNavigator();
export const WebNavigation: FC = () => {
    return (
      <Stack.Navigator
        initialRouteName={SCREENS.Browser}
        screenOptions={
            {
          ...WebpageScreenScreenOptionsPreset
        }
    }
        headerMode="screen"
      >
        <Stack.Screen
          options={{
            title: 'Browser'
          }}
          name={SCREENS.Browser}
          component={Browser}
        />
        <Stack.Screen
          options={{
            title: 'BookMarks'
          }}
          name={SCREENS.BookMarks}
          component={BookMarks}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name={SCREENS.WebIntro}
          component={WebScreen}
        />
        <Stack.Screen name={SCREENS.WebDApp} component={DAppWebpageScreen} />
      </Stack.Navigator>
    );
  };
  
  

const styles = StyleSheet.create({})