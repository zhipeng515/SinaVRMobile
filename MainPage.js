import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import VideoList from './VideoList';
import SplashPage from './SplashPage'
import ViewPager from 'react-native-viewpager';
import DataRepository from './DataRepository';
import SegmentedButton from 'react-native-segmented-button';
import _ from 'lodash'

var repository = new DataRepository;

// const propTypes = {
//     toRoute: PropTypes.func.isRequired,
// };

export default class MainPage extends Component {
    constructor(props) {
        super(props);

        var categoryDataSource = new ViewPager.DataSource({
            pageHasChanged: (p1, p2) => p1 !== p2,
        });

        this.state = {
            splashed: false,
            isLoading: true,
            categoryDataSource: categoryDataSource,
            segmentTitles: [],
        }
    }

    fetchCategorys() {
        repository.getCategory()
            .then((responseData) => {
                var categoryDataSource = this.state.categoryDataSource;
                categoryDataSource = categoryDataSource.cloneWithPages(responseData.slice());
                this.setState({
                    categoryDataSource: categoryDataSource,
                    isLoading: false,
                    segmentTitles: _.map(responseData, 'name'),
                });
            })
            .catch((error) => {
                // console.error(error);
                this.setState({
                    categoryDataSource: this.state.categoryDataSource.cloneWithPages([]),
                    isLoading: false,
                    segmentTitles: [],
                });
            })
            .done();
    };

    componentDidMount() {
        this.timer = setTimeout(
            () => {
                this.setState({splashed: true});
            },
            2000,
        );
        this.fetchCategorys();
    };

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    _renderPage(category: Object,
                pageID: number | string,) {
        return (
            <VideoList categoryId={category._id}/>
        )
    };


    render() {
        if (this.state.splashed) {
            return this.state.categoryDataSource.getPageCount() === 0 ?
                <View style={styles.centerEmpty}>
                    <Text>{this.state.isLoading ? '正在加载...' : '加载失败'}</Text>
                </View> :
                <View style={{flex:1}}>
                    <SegmentedButton
                        style={{marginTop:0,}}
                        tinyColor="#ccc"
                        activeTinyColor="#f62323"
                        items={this.state.segmentTitles}
                        onSegmentBtnPress={(btn,index)=>{}}
                    />
                    <ViewPager
                        dataSource={this.state.categoryDataSource}
                        style={styles.videolist}
                        renderPage={this._renderPage.bind(this)}
                        isLoop={false}
                        autoPlay={false}
                        renderPageIndicator={false}/>
                </View>;
        } else {
            return <SplashPage/>;
        }
    }
};

// MainPage.propTypes = propTypes;

var styles = StyleSheet.create({
    centerEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videolist: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
});