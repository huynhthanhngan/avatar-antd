import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { displayTextWithMentions } from '~/services/EditorUtils';
import history from '~/redux/history';
import PropTypes from 'prop-types';

import { uniqueId } from 'lodash';
import MdEditorRender from '../MdEditor/MdEditorRender';

const LoadMore = (props) => {
    const [ellipsis, setEllipsis] = useState(false);
    const [visibleEllipsis, setVisibleEllipsis] = useState(false);

    const refContent = useRef(null)

    const formatMentionNode = (txt, key, user_id) => (
        <a className='text-hsk' key={key} onClick={() => (props.hasLink && user_id != 0) ? history.push(`/profile/${user_id}`) : null}>
            <strong>@{txt}</strong>
        </a>
    )

    const formatHashtagNode = (txt, key) => (
        <a className='' key={key} onClick={() => props.hasLink ? history.push(`/hashtag/${txt?.substr(1)}`) : null}>
            {txt}
        </a>
    )

    const formatLinkNote = (txt, key) => (
        <a className='' key={key} target='_blank' href={props.hasLink ? txt : null} style={{ wordBreak: 'break-all' }}>{txt}</a>
    )

    useEffect(() => {
        setTimeout(() => countLines(), 300);
    }, [props.content])

    const countLines = () => {
        const divHeight = refContent.current?.offsetHeight;
        const lineHeight = parseInt(refContent.current?.style?.lineHeight);
        const lines = divHeight / lineHeight;

        if (lines > props.rowEllipes) {
            setEllipsis(true);
            setVisibleEllipsis(true);
        }
    }

    return (
        <div>
            <div ref={refContent} className={`${ellipsis ? 'content editor' : 'editor'}`} style={{ lineHeight: '22px' }}>
                { displayTextWithMentions(props.content, formatMentionNode, formatHashtagNode, formatLinkNote)}
            </div>
            {!visibleEllipsis || <p type='text' className='text-hsk cursor-pointer' onClick={() => setEllipsis(!ellipsis)}> {ellipsis ? 'Xem thêm' : 'Ẩn bớt'}</p>}

            <style dangerouslySetInnerHTML={{
                __html: `
                .content {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: ${props.rowEllipes};
                    -webkit-box-orient: vertical;
                    display: -webkit-box;
                    display: -moz-box;
                }
            `}} />
        </div>
    )
}

/**
 * @propsType define
 */
const propTypes = {
    hasLink: PropTypes.bool,
    rowEllipes: PropTypes.number
};

const defaultProps = {
    hasLink: true,
    rowEllipes: 12
}


LoadMore.propTypes = propTypes;
LoadMore.defaultProps = defaultProps;


const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(LoadMore)
