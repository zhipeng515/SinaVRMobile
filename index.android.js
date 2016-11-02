/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Navigator
} from 'react-native';
import Router from 'react-native-simple-router';
import MainPage from './MainPage'

const firstRoute = {
  name: '首页!',
  component: MainPage,
};

export default class SinaVRMobile extends Component {
  render() {
    return <MainPage/>;
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5cafec',
  },
});

AppRegistry.registerComponent('SinaVRMobile', () => SinaVRMobile);
