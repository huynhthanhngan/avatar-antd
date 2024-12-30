import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Checkbox, Dropdown, Input, Menu, Modal, Radio, Tooltip, Typography } from 'antd';
import { CaretRightOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Media from '~/components/Media/index';
import { create as apiCreateLike } from '~/apis/like';
import { destroy as apiDestroyNews, getLikes, getViews, updatePin } from '~/apis/news';
import './config/News.css';
import { showMessage, showNotify, timeFormatStandard, checkManager, checkPermissionCreateTask, getFirstCharacter, getThumbnailHR } from '~/services/helper';
import ListComments from '~/components/ListCommentV2';
import iconLike_Active from '@icons/home/Like=Active.svg';
import iconLike_Inactive from '@icons/home/Like=Inactive.svg';
import iconComment_Active from '@icons/home/Comment=Active.svg';
import iconComment from '~/assets/images/icons/comment.svg';
import iconAssignTask from '~/assets/images/icons/Assign.svg';
import iconLikeActive from '~/assets/images/icons/like-active.svg';
import iconLikeActiveOutlined from '~/assets/images/icons/vector-smart-object.png';
import iconShape from '~/assets/images/icons/shape-1.svg';
import iconSaveBox from '~/assets/images/icons/save-box.svg';
import iconTrash from '~/assets/images/icons/trash.svg';
import iconEdit from '~/assets/images/icons/edit.svg';
import iconCoppy from '~/assets/images/icons/copy-box.svg';
import iconPin from '~/assets/images/icons/pin.svg';
import { showModalAssignTask } from '~/redux/actions/assignTaskModal';
import { destroy, updatePin as actUpdatePin } from '~/redux/actions/news';
import { showStaffModal } from '~/redux/actions/staffModal';
import { showModalNews } from '~/redux/actions/newsModal';
import { insertSave, deleteSave } from '~/apis/save';
import { insert as actionInsertNewsSave, destroy as actionDestroyNewsSave } from '~/redux/actions/newsSave';
import history from '~/redux/history';
import { findUser } from '~/apis/staff';
import { showAnswerModal } from '~/redux/actions/answerModal';
import PropTypes from 'prop-types';
import LoadStaff from '~/components/LoadStaff';
import LoadMore from '~/components/LoadMore';
import AvatarComponent from '~/components/Avatar';
import { DateFromNow } from '../DateFromNow';
import { PushpinOutlined } from '@ant-design/icons';
import { showNewsPin } from '~/redux/actions/groupDetail';
import { REG_MENTION } from '../MdEditor/helper';
import uniqueId from 'lodash/uniqueId';
import { sreenResponsive } from '~/constants/basic';
import rightIcon from '~/assets/images/icons/right_vote.svg';
import { getDetailAnswer as getDetailAns } from '~/apis/answer';
import { updateVote } from '~/apis/answer';
import message from '~/apis/message';
import logoIcon from "~/assets/images/icons/work_2024/Logo.svg";

/**
 * @propsType define
 */
const propTypes = {
    getHeight: PropTypes.func,
};

const defaultProps = {
    getHeight: () => { }
}

class News extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            toggleCmt: false,
            toggleWriteCmt: false,
            news: this.props.news || null,
            staffViewed: [],
        }

        this.coppyMentionClipboard = this.coppyMentionClipboard.bind(this);
    }

    componentDidMount() {
        const timeout = setTimeout(() => {
            let { news } = this.state;
            let newsId = 0
            if (!news.is_view) {
                newsId = this.state.news.id;
            }

            const height = this.divElement?.clientHeight;
            if (height) {
                this.props.getHeight(height, newsId, this.state.news.group_id);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.news != this.props.news) {
            this.setState({ news: this.props.news })
        }
    }

    /**
     * Toggle comments
     */
    toggleComments() {
        this.setState(state => ({
            toggleCmt: !state.toggleCmt,
            toggleWriteCmt: !state.toggleWriteCmt
        }))
    }

    /**
     * @event Submit like
     * @param {*} id 
     */
    async submitLike(id) {
        this.setState({ loading: true })
        let { auth: { profile } } = this.props;
        let response = await apiCreateLike({
            object_id: id,
            object_type: 1, // New
            type: 1, // Like
        });

        if (response.status) {
            this.setState({ loading: false })
            this.setState(state => {
                let { news } = state;
                if (news.is_like) {
                    news.is_like = false;
                    news.like_count -= 1;
                } else {
                    news.is_like = true;
                    news.like_count += 1;
                }

                return { news: { ...news } }
            })
        } else {
            showNotify('Notification', 'Server error', 'error')
        }
    }

    /**
     * Delete news
     */
    async deleteNews() {
        if (this.props.news?.id) {
            let response = await apiDestroyNews(this.props.news?.id);
            if (response.status === 200) {
                this.props.destroy(this.state.news.id)
            }
        }
    }

    /**
     * Handle save news
     */
    handleSaveNews = () => {
        let { news } = this.state;
        let xhr = insertSave(news.id);
        xhr.then(response => {
            if (response.status) {
                this.props.actionInsertNewsSave(news)
            }
        })
    }

    /**
     * Handle unsave news
     */
    handleUnsaveNews = () => {
        let { news } = this.state;
        let xhr = deleteSave(news.id);
        xhr.then(response => {
            if (response.status) {
                this.props.actionDestroyNewsSave(news.id)
            }
        })
    }

    /**
     * 
     * @param {*} id 
     */
    getNewsLikesDetail = (id) => {
        getLikes(id).then(response => {
            const { data } = response; // array staff 
            this.props.showStaffModal(data);
        })
    }

    /**
     * 
     * @param {*} id 
     */
    getNewsViewsDetail = (id) => {
        getViews(id).then(response => {
            const { data } = response; // array staff 
            this.props.showStaffModal(data);
        })
    }

    /**
     * render button count like 
     */
    renderBtnCountLike = () => {
        const { news } = this.state;
        let { like_count, is_like } = news;

        if (is_like && like_count >= 1) {
            like_count -= 1;
        }

        let result;
        if (is_like && !like_count) {
            result = <><img src={iconLikeActiveOutlined} alt='' /> You</>
        }
        else if (is_like && like_count) {
            result = <><img src={iconLikeActiveOutlined} alt='' /> You and {like_count} others</>
        }
        else {
            result = <span className='item_total_like text-muted'>{`${like_count ? like_count : 0}`} like</span>;
        }

        return <span onClick={() => this.getNewsLikesDetail(news.id)} type='text' className='text-muted'>{result}</span>
    }

    /**
     * Get staff viewed
     */
    getStaffViewed = () => {
        const { news } = this.state;
        let xhr = findUser({ user_ids: news.views })
        xhr.then(response => {
            if (response.status) {
                this.setState({ staffViewed: response.data })
            }
        })
    }

    /**
     * Coppy clipboard
     */
    coppyClipboard = () => {
        let { news } = this.state;
        navigator.clipboard.writeText(window.location.origin + `/news/${news.id}`);
        showMessage('Sao chép liên kết thành công!')
    }

    /**
     * Coppy mentioned user to clipboard
     */
    coppyMentionClipboard() {
        let { news } = this.state;
        let retunrData = [];
        let match;
        while ((match = REG_MENTION.exec(news.content))) {
            retunrData.push(match[0]);
        }
        if (!retunrData.length) {
            showMessage('Không tìm thấy người dùng được nhắc đến!', 'warning')
            return;
        }
        navigator.clipboard.writeText(retunrData.join(', '));
        showMessage('Đã copy danh sách người dùng được nhắc đến!')
    }

    /**
     * Pins post
     */
    pinsPost = async () => {
        let { news } = this.state;
        let data = {};
        let message = "Pin post successful";
        if (news.order_pins) {
            data = {
                delete_pin: 1
            }
            message = "Unpin post successful"
        }
        let response = await updatePin(news.id, data);
        if (response.status) {
            this.props.actUpdatePin({ id: news.id, order_pins: response.data })
            showMessage(message)
        }
    }

    /**
     * Check already checked
     */
    checkAlreadyChecked = (answers = [], id) => {
        if (!Array.isArray(answers)) return [];
        let result = [];
        answers.forEach(answer => {
            let isVote = answer.votes?.find(vote => vote.staff_id === id);
            if (isVote) {
                result.push(answer.id)
            }
        })

        return result;
    }

    /**
     * @render
     */
    render() {
        let { newsInGroup, newsSaveData, displayComment, auth: { profile, staff_info }, groupDetail } = this.props;
        let { news, toggleCmt } = this.state;
        const { baseData: { locations } } = this.props;
        if (!news) {
            return [];
        }

        let indexNewsSave = newsSaveData.find(ns => news.id == ns.id);
        let check_saved = indexNewsSave ? true : false;

        const confirm = () => {
            Modal.confirm({
                title: "Confirm",
                icon: <ExclamationCircleOutlined />,
                content: "Delete the post",
                onOk: () => this.deleteNews()
            });
        }
        const styleMenuEditPostItem = { boxShadow: '0.9px 1.8px 10px 0 rgba(0, 0, 0, 0.32)', borderRadius: '10px' }
        const menu = (
            <Menu style={styleMenuEditPostItem}>
                {profile.id == news.created_by ?
                    <>
                        <Menu.Item key="0" className='p-2'>
                            <div
                                className='text-muted cursor-pointer'
                                onClick={() => this.props.showModalNews(news, news.group_id)}
                            >
                                <span className='pt-3 pb-3 pl-1 pr-2'>
                                    <img src={iconEdit} alt='' />
                                </span>
                                <span className='pr-3'>Edit post</span>
                            </div>
                        </Menu.Item>
                        <Menu.Item key="2" className='p-2'>
                            <div
                                className='text-muted cursor-pointer'
                                onClick={confirm}
                            >
                                <span className='pt-3 pb-3 pl-1 pr-2'>
                                    <img src={iconTrash} alt='' />
                                </span>
                                <span className='pr-3'>Delete post</span>
                            </div>
                        </Menu.Item>
                        {window.innerWidth < sreenResponsive ? '' :
                            <Menu.Item key="3" className='p-2' disabled={!checkPermissionCreateTask(staff_info)} >
                                <div
                                    className='text-muted cursor-pointer'
                                    onClick={() => this.props.showModalAssignTask()}
                                >
                                    <span className='pt-3 pb-3 pl-1 pr-2'>
                                        <img src={iconAssignTask} alt='' />
                                    </span>
                                    <span className='pr-3' style={{ marginLeft: -4 }}>Assign task</span>
                                </div>
                            </Menu.Item>
                        }

                    </>
                    : []
                }
                <Menu.Item key="order_pins" className='p-2'>
                    <div
                        className='text-muted cursor-pointer'
                        onClick={() => this.pinsPost()}
                    >
                        <span className='pt-3 pb-3 pl-1 pr-2'>
                            <PushpinOutlined style={{ fontSize: 21 }} />
                        </span>
                        <span className='pr-3' style={{ marginLeft: -5 }}>
                            {news.order_pins ? t('workplace:unpin_post') : t('workplace:pin_post')}
                        </span>
                    </div>
                </Menu.Item>
                <Menu.Item key="4" className='p-2'>
                    <div
                        className='text-muted cursor-pointer'
                        onClick={() => this.coppyClipboard()}
                    >
                        <span className='pt-3 pb-3 pl-1 pr-2'>
                            <img src={iconCoppy} alt='' />
                        </span>
                        <span className='pr-3' style={{ marginLeft: -5 }}>
                            {t('workplace:copy_link_post')}
                        </span>
                    </div>
                </Menu.Item> 
                <Menu.Item key={uniqueId('menu_')} className='p-2'>
                    <div
                        className='text-muted cursor-pointer'
                        onClick={this.coppyMentionClipboard}
                    >
                        <span className='pt-3 pb-3 pl-1 pr-2'>
                            <img src={iconCoppy} alt='' />
                        </span>
                        <span className='pr-3' style={{ marginLeft: -5 }}>
                            {t('workplace:copy_mention')}
                        </span>
                    </div>
                </Menu.Item>
                {
                    check_saved ?
                        <Menu.Item key="5" className='p-2'>
                            <div
                                className='text-muted cursor-pointer'
                                onClick={() => this.handleUnsaveNews()}
                            >
                                <span className='pt-3 pb-3 pl-1 pr-2'>
                                    <img src={iconShape} alt='' />
                                </span>
                                <span className='pr-3' style={{ marginLeft: -4 }}>
                                    {t('workplace:unsave_post')}
                                </span>
                            </div>
                        </Menu.Item>
                        :
                        <Menu.Item key="5" className='p-2' disabled={!checkManager(staff_info.position_id)}>
                            <div
                                className='text-muted cursor-pointer'
                                onClick={() => this.handleSaveNews()}
                            >
                                <span className='pt-3 pb-3 pl-1 pr-2'>
                                    <img src={iconSaveBox} alt='' />
                                </span>
                                <span className='pr-3'>
                                    {t('workplace:save_post')}
                                </span>
                            </div>
                        </Menu.Item>
                }
            </Menu>
        );

        let isAnimatingCB = false;

        const defaultValue = () => {
            const { staff_info } = this.props.auth;
            const { news: { news_vote } } = this.state;
            const { answers } = news_vote;
            if (!Array.isArray(answers)) return null;

            let defaultValue = answers?.find(answer => {
                return answer.votes?.find(vote => vote.staff_id === staff_info.staff_id)
            })

            return defaultValue ? defaultValue.id : null;
        }

        return (
            <div className='card mb-3 item_comment_site ' ref={(divElement) => { this.divElement = divElement }}>
                {news.order_pins && newsInGroup && !groupDetail.show_news_pin ?
                    <div className='d-flex justify-content-between border-bottom p-2'>
                        <strong className='pl-2'>
                        {t('workplace:pinned_post')} &bull; {this.props.groupDetail?.news_pins?.length}
                        </strong>
                        <a className='txt_color_1 text_viewall pr-2' onClick={() => this.props.showNewsPin()} style={{ textAlign: 'left'}} >
                            {t('workplace:view_all')}
                        </a>
                    </div> : ''
                }
                <div className={`item_news_feed d-flex justify-content-between pl-3 pr-3 pt-3 pb-1 w-100 ${news?.is_view ? 'hsk-viewed' : ''}`}>
                    <div className='d-flex'>
                        <div className='cursor-pointer' onClick={() => history.push(`/profile/${news.user_id}`)}>
                            {news.user_id == 1001 ? <img src={logoIcon} alt="logo" className="icon_logo" /> : 
                            <AvatarComponent src={news.avatar} name={news.staff_name} />
                        }
                        </div>

                        <div className='flex-nowrap p-1 pl-2' style={{ color: '#333333', fontSize: 14 }}>
                            <div style={{ lineHeight: news.user_id == 1001 ? 1.1 : 1.3 }}>
                            <strong className='cursor-pointer' onClick={() => history.push(`/groups/${news.group_id}`)}>
                                {news.group_name}
                            </strong>

                            </div>
                            {news.user_id == 1001 ? (
                            <span className="text-muted pt-2" style={{ color: '#666666', fontSize: 12 }}>
                                <span className='text-muted pt-2' style={{ color: '#666666', fontSize: 12 }}>
                                Phòng Nhân Sự
                                </span>
                                <span className='item_circle_3x3'>&nbsp;</span>
                                <DateFromNow date={news.created_at} />
                            </span>
                            ) : (
                            <>
                                <span className='text-muted pt-2' style={{ color: '#666666', fontSize: 12 }}>
                                {news.staff_name}
                                </span>
                                {news?.staff_dept && <><span className='item_circle_3x3'>&nbsp;</span>
                                <span className='text-muted pt-2' style={{ color: '#666666', fontSize: 12 }}>{news?.staff_dept}</span></>}
                                {news.staff_loc_id > 0 && <>
                                <span className='item_circle_3x3'>&nbsp;</span>
                                <span className='text-muted pt-2' style={{ color: '#666666', fontSize: 12 }}> {locations.filter(d => d.id > 0).find(d => d.id === news.staff_loc_id)?.name}</span></>}
                                <span className='item_circle_3x3'>&nbsp;</span>
                                <span className='text-muted pt-2' style={{ color: '#666666', fontSize: 12 }}>
                                <DateFromNow date={news.created_at} />
                                </span>
                            </>
                            )}
                        </div>
                        </div>
                    <div>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <EllipsisOutlined className='icon_action_news rounded-circle p-1 cursor-pointer' style={{ fontSize: 22, backgroundColor: '#fff' }} />
                        </Dropdown>
                    </div>
                </div>

                <div className='pl-3 pr-3 pt-1 pb-1'>
                    <LoadMore content={news.content} />
                </div>

                <Media
                    files={news.files}
                    extra={{
                        news_id: news.id,
                        avatar: news.avatar,
                        staff_id: news.staff_id,
                        staff_name: news.staff_name,
                        created_at: news.created_at,
                        user_id: news.user_id,
                        group_id: news.group_id
                    }}
                />
                <div className='block_total_like d-flex pb-1 mt-1'>
                    <div className='ml-3 text_hover'>{this.renderBtnCountLike()}</div>
                    <div className='mr-3 text_hover'>
                    <span className='item_circle_3x3'>&nbsp;</span>

                        <span onClick={() => this.setState(state => ({ toggleCmt: !state.toggleCmt }))} className='item_total_like text-muted'>
                            {news?.comments_count || 0} {t('workplace:comment')}
                        </span>
                        <span className='item_circle_3x3'>&nbsp;</span>
                        <span
                            className='item_total_like text-muted'
                            onClick={() => this.getNewsViewsDetail(news.id)}
                        >
                            {news.views_count ? news.views_count : 0} {t('workplace:viewers')}
                        </span>

                    </div>
                </div>
                <div className='block_action_news pl-3 pr-3'>
                    <div className=' d-flex justify-content-around border-top'>
                        <span className='pb-1 pt-1 d-flex justify-content-center'>
                            <Button type='text' onClick={() => this.submitLike(news.id)}
                                style={{ color: news.is_like ? '#006052' : '#777777' }}
                                className=' cursor-pointer btn_site'
                            >
                                <img src={news.is_like ? iconLike_Active : iconLike_Inactive} alt='' />
                                    &nbsp;&nbsp;{t(`${news.is_like ? 'workplace:dislike' : 'workplace:like'}`)}
                            </Button>
                        </span>
                        <span className='pb-1 pt-1 d-flex justify-content-center' style={{ width: '33%' }}>
                            <Button type='text' onClick={() => this.toggleComments()} className="btn_site btn_comment_news">
                                <img src={iconComment} alt='' />
                                &nbsp;&nbsp;{t('workplace:comment')}
                            </Button>
                        </span>
                        <span className='pb-1 pt-1 d-flex justify-content-end text-muted'>
                            <Button type='text' onClick={() => this.props.showModalAssignTask()} disabled={!checkPermissionCreateTask(staff_info)} className='text-muted btn_site' >
                                <img src={iconAssignTask} alt='' />
                                &nbsp;&nbsp;{t('workplace:assign_tasks')}
                            </Button>
                        </span>

                    </div>

                    <div className='list_sub_comment'>
                        {
                            displayComment || toggleCmt ?
                                <ListComments
                                    objectType={1}
                                    objectId={news.id}
                                    groupId={news.group_id}
                                    visible={displayComment ? true : toggleCmt}
                                    displayComment={displayComment}
                                    cbRemoveComment={() => this.setState(state => {
                                        let { news } = state;
                                        news.comments_count--
                                        return { news }
                                    })}
                                    cbAddComment={() => this.setState(state => {
                                        let { news } = state;
                                        news.comments_count++
                                        return { news }
                                    })}
                                />
                                : ''
                        }
                    </div>
                </div>
            </div>
        )
    }
}

News.propTypes = propTypes;
News.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData,
        newsData: state.news,
        newsSaveData: state.newsSave,
        groupDetail: state.groupDetail
    };
}

const mapDispatchToProps = {
    showModalAssignTask,
    destroy,
    showModalNews,
    actionInsertNewsSave,
    actionDestroyNewsSave,
    actUpdatePin,
    showNewsPin,
    showAnswerModal,
    showStaffModal
}

export default connect(mapStateToProps, mapDispatchToProps)(News);