import React, {Component} from 'react';
import {
    ListView,
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import ViewPager from 'react-native-viewpager';
import VideoItem from './VideoItem';
import DataRepository from './DataRepository';
var repository = new DataRepository();

var dataCache = {
    videos: {},
    lastIds: {},
    recommends: {},
};

export default class VideoList extends Component {
    constructor(props) {
        super(props);

        var dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        var recommendDataSource = new ViewPager.DataSource({
            pageHasChanged: (p1, p2) => p1 !== p2,
        });

        this.state = {
            isLoading: false,
            isLoadingTail: false,
            dataSource: dataSource,
            recommendDataSource: recommendDataSource,
        };
    };

    componentWillUnmount() {
        repository.saveVideos(this.props.categoryId, dataCache.videos[this.props.categoryId]);
    };

    componentDidMount() {
//        this.fetchRecommends(this.props.categoryId);
        this.fetchVideos(this.props.categoryId, true);
    };

    componentWillReceiveProps(nextProps) {
//        this.fetchRecommends(nextProps.categoryId);
        this.fetchVideos(nextProps.categoryId, true);
    };

    fetchVideos(categoryId, isRefresh) {
        this.setState({
            isLoading: isRefresh,
            isLoadingTail: !isRefresh,
            dataSource: this.state.dataSource,
        });

        var lastId = isRefresh ? null : dataCache.lastIds[categoryId];
        var videos = dataCache.videos[categoryId];
        repository.fetchVideos(categoryId, lastId)
            .then((responseData) => {
                var lastId;
                var length = responseData.length;
                if (length > 0) {
                    lastId = responseData[length - 1]._id;
                }
                videos = isRefresh ? responseData : videos.concat(responseData);
                dataCache.lastIds[categoryId] = lastId;
                dataCache.videos[categoryId] = videos;

                var dataSouce = this.state.dataSource.cloneWithRows(videos);
                this.setState({
                    isLoading: (isRefresh ? false : this.state.isLoading),
                    isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
                    dataSource: dataSouce,
                });
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    isLoading: (isRefresh ? false : this.state.isLoading),
                    isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
                    dataSource: this.state.dataSource.cloneWithRows([]),
                });
            })
            .done();
    };

    fetchRecommends(categoryId) {
        repository.fetchRecommends(categoryId)
            .then((responseData) => {
                var recommendDataSource = this.state.recommendDataSource;
                recommendDataSource = recommendDataSource.cloneWithPages(responseData.slice());
                this.setState({
                    recommendDataSource: recommendDataSource,
                });
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    recommendDataSource: this.state.recommendDataSource.cloneWithPages([]),
                });
            })
            .done();
    };

    selectVideo(video: Object) {
        video.read = true;
        this.props.navigator.push({
            title: video.title,
            name: 'video',
            video: video,
        });
        // }
    };

    renderRow(video: Object,
              sectionID: number | string,
              rowID: number | string,
              highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,) {
        return (
            <VideoItem
                key={video._id}
                onSelect={() => this.selectVideo(video)}
                onHighlight={() => highlightRowFunc(sectionID, rowID)}
                onUnhighlight={() => highlightRowFunc(null, null)}
                video={video}
            />
        );
    };

    onEndReached() {
        console.log('onEndReached() ' + this.state.isLoadingTail);
        if (this.state.isLoadingTail) {
            return;
        }
        this.fetchVideos(this.props.categoryId, true);
    };

    _renderPage(video: Object,
                pageID: number | string,) {
        return (
            <TouchableOpacity style={{flex: 1}} onPress={()=>this.selectVideo(video)}>
                <Image
                    source={{uri: video.cover}}
                    style={styles.headerItem}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}
                              numberOfLines={2}>
                            {video.title}
                        </Text>
                    </View>
                </Image>
            </TouchableOpacity>
        )
    };

    _renderHeader() {
        var pageCount = this.state.recommendDataSource.getPageCount();
        return ((pageCount == 0 || pageCount == undefined) ?
                <View style={styles.headerItem}>
                    <Text>{this.state.isLoading ? '正在加载...' : '暂无推荐'}</Text>
                </View> :
                <View style={styles.headerItem}>
                    <ViewPager
                        dataSource={this.state.recommendDataSource}
                        style={styles.headerPager}
                        renderPage={this._renderPage.bind(this)}
                        isLoop={true}
                        autoPlay={true}/>
                </View>
        );
    }

    render() {
        var rowCount = this.state.dataSource.getRowCount();
        return rowCount == 0 ?
            <View style={styles.centerEmpty}>
                <Text>{this.state.isLoading ? '正在加载...' : '加载失败'}</Text>
            </View> :
            <ListView
                ref="listview"
                style={styles.listview}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow.bind(this)}
                onEndReached={this.onEndReached.bind(this)}
                automaticallyAdjustContentInsets={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps={true}
                showsVerticalScrollIndicator={false}
                renderHeader={this._renderHeader.bind(this)}
            />;
    }
}

var styles = StyleSheet.create({
    centerEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerEmpty: {
        flex: 1,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FAFAFA',
    },
    listview: {
        backgroundColor: '#FAFAFA',
    },
    toolbar: {
        backgroundColor: '#00a2ed',
        height: 56,
    },
    rator: {
        height: 1,
        backgroundColor: '#eeeeee',
    },
    scrollSpinner: {
        marginVertical: 20,
    },
    sectionHeader: {
        fontSize: 14,
        color: '#888888',
        margin: 10,
        marginLeft: 16,
    },
    headerPager: {
        height: 200,
    },
    headerItem: {
        flex: 1,
        height: 200,
        flexDirection: 'row',
    },
    headerTitleContainer: {
        flex: 1,
        alignSelf: 'flex-end',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: 'white',
        marginBottom: 10,
    },
    editors: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    editorsLable: {
        fontSize: 14,
        color: '#888888',
    },
    editorAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#AAAAAA',
        margin: 4,
    }
});
