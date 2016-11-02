import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableNativeFeedback,
    Image
} from 'react-native';
import Router from 'react-native-simple-router';
import Config from './Config';

var TITLE_REF = 'title';

export default class VideoItem extends Component {
    constructor(props) {
        super(props);
    }

    onItemClick(event) {
        this.props.video.played = true;
        this.refs[TITLE_REF].setNativeProps({style: {color: '#808080'}});
    }

    render() {
        var TouchableElement = TouchableOpacity;
        if (Platform.OS === 'android') {
            TouchableElement = TouchableNativeFeedback;
        }
        var coverUrl = Config.cmsHost + this.props.video.extensions.vrimage_url;
        return (
            <View {...this.props}
                  style={styles.container}>
                <TouchableElement onPress={this.onItemClick.bind(this.refs[TITLE_REF])}>
                    <Image
                        source={{uri: coverUrl}}
                        style={styles.videoCover}/>
                    <Text
                        ref={TITLE_REF}
                        style={this.props.video.played ? styles.titlePlayed : styles.title}
                        numberOfLines={3}>
                        {this.props.video.title}
                    </Text>
                </TouchableElement>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 4,
        marginTop: 10,
        marginBottom: 20,
        flexDirection: 'column',
        height: 210,
    },
    // 标题
    titlePlayed: {
        fontSize: 18,
        color: '#808080',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        flex: 1                //Step 3
    },
    title: {
        fontSize: 18,
        color: '#000000',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        flex: 1                //Step 3
    },
    videoCover: {
        backgroundColor: '#dddddd',
        height: 200,
        marginLeft: 10,
        marginRight: 10,
    },
});